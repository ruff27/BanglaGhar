import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.REACT_APP_USERPOOLID,
  ClientId: process.env.REACT_APP_CLIENTID,

};

const userPool = new CognitoUserPool(poolData);

export { poolData, userPool };
