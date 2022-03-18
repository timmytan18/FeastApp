const aws = require('aws-sdk');

const REGION = 'us-east-2';
aws.config.update({ region: REGION });

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
  const params = {
    Destination: { ToAddresses: [SUPPORT_EMAIL] },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: JSON.stringify(req.body, null, '\t'),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: TITLE,
      },
    },
    Source: SUPPORT_EMAIL,
  };

  const SESService = new aws.SES({ apiVersion: '2010-12-01' });

  try {
    await SESService.sendEmail(params).promise();
    res.json({ status: 'Report succeed', isSuccessful: true });
  } catch (e) {
    console.log(e);
    res.json({ status: 'Report failed', isSuccessful: false });
  }
});

app.listen(3000, () => {
  console.log('App started');
});

module.exports = app;
