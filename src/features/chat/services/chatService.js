import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001/api";

/**
 * Fetches the Ably token from the backend.
 * Requires the user to be authenticated, so an auth token must be sent.
 * @param {string} authToken The user's JWT authentication token.
 * @returns {Promise<object>} The Ably tokenRequest object from the backend.
 */
export const getAblyTokenRequest = async (authToken) => {
  if (!authToken) {
    throw new Error("Authentication token is required to fetch Ably token.");
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/chat/ably-token`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching Ably token:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch Ably token"
    );
  }
};

/**
 * Initiates or retrieves an existing conversation with another user.
 * @param {string} authToken - The user's JWT.
 * @param {string} receiverId - The ID of the other user in the conversation.
 * @param {string} [propertyId] - Optional ID of the property related to the conversation.
 * @returns {Promise<object>} The conversation object.
 */
export const initiateOrGetConversation = async (
  authToken,
  receiverId,
  propertyId
) => {
  if (!authToken) throw new Error("Authentication token is required.");
  if (!receiverId) throw new Error("Receiver ID is required.");

  try {
    const payload = { receiverId };
    if (propertyId) {
      payload.propertyId = propertyId;
    }
    const response = await axios.post(
      `${API_BASE_URL}/chat/conversations`,
      payload,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error initiating or getting conversation:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to process conversation request."
    );
  }
};

/**
 * Posts a message to a specific conversation.
 * @param {string} authToken - The user's JWT.
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} text - The message text.
 * @returns {Promise<object>} The saved message object.
 */
export const postMessageToConversation = async (
  authToken,
  conversationId,
  text
) => {
  if (!authToken) throw new Error("Authentication token is required.");
  if (!conversationId) throw new Error("Conversation ID is required.");
  if (!text || text.trim() === "")
    throw new Error("Message text cannot be empty.");

  try {
    const response = await axios.post(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      { text },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error posting message:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.message || "Failed to post message.");
  }
};

/**
 * Retrieves all conversations for the logged-in user.
 * @param {string} authToken - The user's JWT.
 * @returns {Promise<Array<object>>} A list of conversation objects.
 */
export const getConversationsForUser = async (authToken) => {
  if (!authToken) throw new Error("Authentication token is required.");

  try {
    const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching conversations:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversations."
    );
  }
};

/**
 * Retrieves messages for a specific conversation with pagination.
 * @param {string} authToken - The user's JWT.
 * @param {string} conversationId - The ID of the conversation.
 * @param {number} [page=1] - The page number for pagination.
 * @param {number} [limit=30] - The number of messages per page.
 * @returns {Promise<object>} An object containing messages and pagination info.
 */
export const getConversationsSummary = async (authToken) => {
  if (!authToken) throw new Error("Authentication token is required.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/conversations/summary`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching conversations summary:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversations summary."
    );
  }
};

export const getMessagesInConversation = async (
  authToken,
  conversationId,
  page = 1,
  limit = 30
) => {
  if (!authToken) throw new Error("Authentication token is required.");
  if (!conversationId) throw new Error("Conversation ID is required.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching messages:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch messages."
    );
  }
};
