const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const ENV_PATH = path.join(__dirname, '.env');
// .env を process.env にマージする
require('dotenv').config({ path: ENV_PATH });
const env = process.env;

const PORT = 3000;

// Import Routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const tokenRouter = require('./routes/token');

// Connect DB
mongoose.connect(
  env.MONGO_ALTA_DB_USER,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('connected to DB!')
);

// Middleweare
app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded

// Route Middlewares
app.use('/api/users', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/token', tokenRouter);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
