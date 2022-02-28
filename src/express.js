const express = require('express');

const app = express();
const port = 8080;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/email', (req, res) => {
  console.log(req.body);
  res.json({ response: 'good' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
