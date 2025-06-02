const serverless = require("serverless-http");
// Ensure this path correctly points to your main server.js
const { app } = require("./../../server"); // [cite: 19]
module.exports.handler = serverless(app);
