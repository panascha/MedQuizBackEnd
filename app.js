const express = require('express');
const { xss } = require('express-xss-sanitizer');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv').config({ path: './config/config.env' });
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

const connectDB = require('./config/db');
connectDB();

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const score = require('./routes/score');
const auth = require('./routes/auth');
const quiz = require('./routes/quiz');
const category = require('./routes/category');
const subject = require('./routes/subject');
const report = require('./routes/report');
const approved = require('./routes/approved');
const keyword = require('./routes/keyword');
const stat = require('./routes/stat');
const image = require('./routes/image');

app.use('/api/v1/score', score);
app.use('/api/v1/auth', auth);
app.use('/api/v1/quiz', quiz);
app.use('/api/v1/category', category);
app.use('/api/v1/subject', subject);
app.use('/api/v1/report', report);
app.use('/api/v1/approved', approved);
app.use('/api/v1/keyword', keyword);
app.use('/api/v1/stat', stat);
app.use('/api/v1/images', image);
app.use('/public', express.static(path.join(__dirname, 'public')));

module.exports = app; 