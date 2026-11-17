const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/readings', require('./routes/readings'));
app.use('/api/reports', require('./routes/reports'));
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);
  res.status(500).json({ errors: ['Something went wrong. Please try again.'] });
});
module.exports = app;
