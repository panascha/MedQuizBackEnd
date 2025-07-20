const rateLimit = require('express-rate-limit');

// OTP request limiter: max 3 requests per 10 minutes per IP
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 3, 
    message: {
        success: false,
        message: 'Too many OTP requests from this IP, please try again after 10 minutes.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { otpLimiter }; 