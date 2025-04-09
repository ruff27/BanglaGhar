import { CognitoUserPool } from "amazon-cognito-identity-js";
import AWS from "aws-sdk";

const poolData = {
  UserPoolId: process.env.REACT_APP_USERPOOLID,
  ClientId: process.env.REACT_APP_CLIENTID,
};

/*AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});*/

const userPool = new CognitoUserPool(poolData);

export { poolData, userPool };
