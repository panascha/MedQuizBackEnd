const User = require('../models/User');
const Blacklist = require('../models/Blacklist');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');


const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};

/**
 * @desc Register user
 * @route POST /api/v1/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, year, email, password, role } = req.body;

        const user = await User.create({
            name,
            year,
            email,
            password,
            role
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error(error.stack);
        res.status(400).json({ success: false });
    }
};

/**
 * @desc Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Please provide an email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error(error.stack);
        return res.status(401).json({ success: false, msg: 'Cannot convert email or password to string' });
    }
};

/**
 * @desc Logout user
 * @route GET /api/v1/auth/logout
 * @access Private
 */
exports.logout = async (req, res, next) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = req.headers.authorization.split(' ')[1];

        const existingBlacklist = await Blacklist.findOne({ token });
        if (existingBlacklist) {
            return res.status(400).json({
                success: false,
                error: 'Token already invalidated'
            });
        }

        await Blacklist.create({ token });

        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({
            success: false,
            error: 'Error during logout'
        });
    }
};

/**
 * @desc Get current Logged in user
 * @route POST /api/v1/auth/me
 * @access Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error.stack);
        res.status(400).json({ success: false });
    }
};

exports.updateUser = async (req, res) => {
    try {
      if (req.params.id !== req.user.id && req.user.role === "user" ) {
        return res.status(401).json({
          success: false,
          message: "User is not authorized to update this user.",
        });
      }
  
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) {
        return res.status(400).json({ success: false });
      }
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "please check your tel.",
      });
    }
  };
  
/**
 * @desc Get all users
 * @route GET /api/v1/auth/users
 * @access Private (admin/S-admin only)
 */
exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find({}, 'name email year role');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

/**
 * @desc Check if user exists by email
 * @route GET /api/v1/auth/user-exists?email=...
 * @access Public (or you can protect if needed)
 */
exports.checkUserExists = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ exists: false, message: 'Email is required' });
        }
        const user = await User.findOne({ email });
        res.status(200).json({ exists: !!user });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ exists: false, message: 'Error checking user existence' });
    }
};

/**
 * @desc Ban a user
 * @route POST /api/v1/auth/ban/:id
 * @access Private (S-admin only)
 */
exports.banUser = async (req, res) => {
    try {
        const { reason, banUntil } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.status.isBanned = true;
        user.status.banReason = reason || '';
        user.status.banUntil = banUntil || null;
        await user.save();
        res.status(200).json({ success: true, message: 'User banned successfully', data: user });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Error banning user' });
    }
};

/**
 * @desc Unban a user
 * @route POST /api/v1/auth/unban/:id
 * @access Private (S-admin only)
 */
exports.unbanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.status.isBanned = false;
        user.status.banReason = '';
        user.status.banUntil = null;
        await user.save();
        res.status(200).json({ success: true, message: 'User unbanned successfully', data: user });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Error unbanning user' });
    }
};

exports.requestOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No user with that email' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otpCode = otp;
  user.otpExpire = Date.now() + 5 * 60 * 1000; 
  user.otpVerified = false; // Reset verification status
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - MDKKU Self-Exam Bank',
    text: `Dear ${user.name || 'User'},

We received a request to reset your password for your MDKKU Self-Exam Bank account.

Your One-Time Password (OTP) is:

    ${otp}

This OTP is valid for 5 minutes. Please enter this code in the password reset page to proceed.

If you did not request a password reset, please ignore this email. Do not share this code with anyone for your account's security.

Best regards,
MDKKU Self-Exam Bank
`,
  });

  res.status(200).json({ success: true, message: 'OTP sent to email', data: otp });
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please provide email and OTP' 
    });
  }

  const user = await User.findOne({ 
    email, 
    otpCode: otp, 
    otpExpire: { $gt: Date.now() } 
  });

  if (!user) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired OTP' 
    });
  }

  // Generate a temporary token for password reset access with 5-minute expiration
  const resetToken = user.getResetToken();
  
  // Mark OTP as verified but don't clear it yet (will be cleared on password reset)
  user.otpVerified = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ 
    success: true, 
    message: 'OTP verified successfully',
    resetToken,
    expiresIn: '5 minutes',
    data: {
      email: user.email,
      name: user.name
    }
  });
};

/**
 * @desc Reset password using reset token from OTP verification
 * @route POST /api/v1/auth/reset-password
 * @access Private (requires reset token from verifyOTP)
 * @note This function requires a valid reset token obtained from the verifyOTP endpoint
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.headers['x-access-token'];

    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide new password' 
      });
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No reset token provided in x-access-token header' 
      });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Get the user from database and check if they have an active OTP session
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user has verified OTP and it's still valid
    if (!user.otpVerified || !user.otpCode || user.otpExpire < Date.now()) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP verification required or expired' 
      });
    }

    // Update password and clear OTP data
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.otpVerified = undefined;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password' 
    });
  }
};
  