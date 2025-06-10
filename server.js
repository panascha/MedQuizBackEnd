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

// Create public folder if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

app.use(cors());

//security
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

//create router
const score = require('./routes/score');
const auth = require('./routes/auth');
const quiz = require('./routes/quiz');
const category = require('./routes/category');
const subject = require('./routes/subject');
const upload = require('./routes/upload');
const report = require('./routes/report');
const approved = require('./routes/approved');
const keyword = require('./routes/keyword');

//use router
app.use('/api/v1/score', score);
app.use('/api/v1/auth', auth);
app.use('/api/v1/quiz', quiz);
app.use('/api/v1/category', category);
app.use('/api/v1/subject', subject);
app.use('/api/v1/report', report);
app.use('/api/v1/approved', approved);
app.use('/api/v1/keyword', keyword);
app.use('/public', express.static(path.join(__dirname, 'public'))); // Serve images
app.use('/', upload);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

process.on('unhandledRejection', (err, promise) => {
    console.error(`Error : ${err.message}`);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err, promise) => {
    console.error(`Error : ${err.message}`);
    server.close(() => process.exit(1));
});