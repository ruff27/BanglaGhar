import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.USERPOOLID, // Replace with your actual User Pool ID
  ClientId: process.env.CLIENTID,   // Replace with your SPA Client ID (no secret)
};

const userPool = new CognitoUserPool(poolData);

export { poolData, userPool };
