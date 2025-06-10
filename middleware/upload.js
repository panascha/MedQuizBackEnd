const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create public folder if it doesn't exist
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the public directory exists
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        cb(null, publicDir);
    },
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname)),
});

// Export configured multer middleware
const upload = multer({ storage });

module.exports = upload;
