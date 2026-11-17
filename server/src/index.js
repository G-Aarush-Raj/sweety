require('dotenv').config();
const app = require('./app');
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Sweety API running on http://localhost:${port}`));
