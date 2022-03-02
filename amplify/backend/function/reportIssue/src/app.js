/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["twiliokey"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
const aws = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

const SUPPORT_EMAIL = 'support@feastapp.io';
const TITLE = 'FEAST IN-APP ISSUE REPORTED';

app.post('/report', async (req, res) => {
  const { Parameters } = await (new aws.SSM())
    .getParameters({
      Names: ['twiliokey'].map((secretName) => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();
  const [{ Value: TWILIO_KEY }] = Parameters;
  sgMail.setApiKey(TWILIO_KEY);

  const msg = {
    to: SUPPORT_EMAIL,
    from: SUPPORT_EMAIL,
    subject: TITLE,
    text: `${JSON.stringify(req.body, null, '\t')}`,
  };

  try {
    await sgMail.send(msg);
    res.json({ status: 'Report succeed', isSuccessful: true });
  } catch (e) {
    res.json({ status: 'Report failed', isSuccessful: false });
  }
});

app.listen(3000, () => {
  console.log('App started');
});

module.exports = app;
