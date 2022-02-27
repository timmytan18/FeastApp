const aws = require('aws-sdk');

exports.handler = async (event) => {
  const { Parameters } = await (new aws.SSM())
    .getParameters({
      Names: ['bingkey', 'googlekey'].map((secretName) => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();
  const [{ Value: BING_KEY }, { Value: GOOGLE_KEY }] = Parameters;
  const response = {
    statusCode: 200,
    body: JSON.stringify({ BING_KEY, GOOGLE_KEY }),
  };
  return response;
};
