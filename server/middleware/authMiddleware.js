// server/middleware/authMiddleware.js
const axios = require("axios");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");

// Cache for JWKs - start empty
let pems = {};
let isFetchingJWKs = false; // Add a flag to prevent concurrent fetches
let lastJWKFetchTime = 0; // Optional: Track fetch time for refreshing cache
const JWK_CACHE_TTL = 3600 * 1000; // Cache JWKs for 1 hour (in milliseconds)

const fetchJWKs = async () => {
  // Prevent concurrent fetches if one is already in progress
  if (isFetchingJWKs) {
    console.log("[JWK Fetch] Fetch already in progress, waiting...");
    // Simple wait strategy - could be improved with promises
    await new Promise((resolve) => setTimeout(resolve, 100));
    // If another fetch succeeded while waiting, pems might be populated now
    if (Object.keys(pems).length > 0) return true;
  }

  isFetchingJWKs = true;
  console.log("[JWK Fetch] Attempting to fetch JWKs..."); // Moved log inside

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const region = process.env.APP_AWS_REGION;

  // Re-check variables inside the function when it's called
  console.log("[DEBUG fetchJWKs] APP_AWS_REGION:", `"${region}"`);
  console.log("[DEBUG fetchJWKs] COGNITO_USER_POOL_ID:", `"${userPoolId}"`);

  if (!userPoolId || !region) {
    console.error(
      "[JWK Fetch Error] Cognito User Pool ID or Region not configured."
    );
    isFetchingJWKs = false;
    return false; // Indicate failure
  }

  const trimmedRegion = typeof region === "string" ? region.trim() : region;
  const trimmedUserPoolId =
    typeof userPoolId === "string" ? userPoolId.trim() : userPoolId;

  if (!trimmedUserPoolId || !trimmedRegion) {
    console.error("[JWK Fetch Error] Cognito User Pool ID or Region is empty.");
    isFetchingJWKs = false;
    return false;
  }

  const cognitoIssuer = `https://cognito-idp.${trimmedRegion}.amazonaws.com/${trimmedUserPoolId}`;
  const url = `${cognitoIssuer}/.well-known/jwks.json`;
  console.log("[DEBUG fetchJWKs] Fetching URL:", url);

  try {
    const response = await axios.get(url);
    const keys = response.data.keys;
    const newPems = {}; // Build new pems object
    keys.forEach((key) => {
      newPems[key.kid] = jwkToPem({ kty: key.kty, n: key.n, e: key.e });
    });

    if (Object.keys(newPems).length === 0) {
      console.warn("[JWK Fetch Warn] Fetched JWKs but found no keys.");
      isFetchingJWKs = false;
      return false; // Indicate failure or empty set
    }

    pems = newPems; // Update the cache atomically
    lastJWKFetchTime = Date.now(); // Update fetch time
    console.log("[JWK Fetch Success] Successfully fetched and cached JWKs.");
    isFetchingJWKs = false;
    return true; // Indicate success
  } catch (error) {
    console.error(
      "[JWK Fetch Error] Error fetching JWKs:",
      error.message || error
    );
    if (error.config?.url) {
      console.error(`[JWK Fetch Error] Failed URL: ${error.config.url}`);
    }
    isFetchingJWKs = false;
    return false; // Indicate failure
  }
};

// --- REMOVED the immediate fetchJWKs(); call from here ---

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing." });
  }

  try {
    // --- Check if JWKs need fetching (cache empty or expired) ---
    const now = Date.now();
    const cacheIsEmpty = Object.keys(pems).length === 0;
    const cacheIsExpired = now - lastJWKFetchTime > JWK_CACHE_TTL;

    if (cacheIsEmpty || cacheIsExpired) {
      if (cacheIsExpired)
        console.log("[Auth Middleware] JWK cache expired, attempting refresh.");
      if (cacheIsEmpty)
        console.log(
          "[Auth Middleware] JWK cache empty, attempting initial fetch."
        );

      const fetchSuccess = await fetchJWKs();
      if (!fetchSuccess || Object.keys(pems).length === 0) {
        // If fetch fails critically, deny request
        console.error(
          "[Auth Middleware] Failed to fetch/refresh JWKs. Denying request."
        );
        return res.status(500).json({
          message:
            "Failed to fetch authentication keys. Please try again later.",
        });
      }
    }
    // --- End JWK Fetch Check ---

    // 1. Decode the token to get the kid
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      return res.status(401).json({ message: "Invalid token format." });
    }
    const kid = decodedToken.header.kid;
    const pem = pems[kid];

    // 2. Check if PEM exists for this kid
    if (!pem) {
      // If PEM is missing even after potential fetch above, the key might be new or fetch failed transiently
      console.warn(
        `[Auth Middleware] No PEM found for kid: ${kid}. Token might be invalid or JWKs outdated.`
      );
      // Optionally try one more fetch here? Or just reject. Let's reject for now.
      return res.status(401).json({
        message: `Cannot verify token: Unknown key ID. Please try again.`,
      });
    }

    // 3. Verify the token signature
    jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, payload) => {
      if (err) {
        console.error(
          "[Auth Middleware] Token verification error:",
          err.message
        );
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired." });
        }
        if (err.name === "JsonWebTokenError") {
          return res
            .status(401)
            .json({ message: "Invalid token signature or format." });
        }
        return res.status(401).json({ message: "Token verification failed." });
      }

      // 4. Token is valid
      req.user = {
        email: payload.email,
        username: payload["cognito:username"],
        sub: payload.sub,
      };
      console.log(`[Auth Middleware] Authenticated user: ${req.user.email}`);
      next();
    });
  } catch (error) {
    console.error(
      "[Auth Middleware] Unexpected error:",
      error.message || error
    );
    return res.status(500).json({
      message: "Internal server error during authentication.",
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
