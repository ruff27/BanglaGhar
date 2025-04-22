// server/middleware/validationMiddleware.js
const { validationResult } = require("express-validator");

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log the errors for debugging
    console.error("Validation Errors:", errors.array());
    // Return a 400 Bad Request response with the errors
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // Proceed to the controller function if validation passes
};
