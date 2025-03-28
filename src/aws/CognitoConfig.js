import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "ap-southeast-2_vtwd9UV4E", // Replace with your actual User Pool ID
  ClientId: "745l6e2msldreakerhoor5f1no",   // Replace with your SPA Client ID (no secret)
};

const userPool = new CognitoUserPool(poolData);

export { poolData, userPool };