# OTP Flow Testing Guide

## OTP Password Reset Flow (Token-Based Only)

### Step 1: Request OTP
```http
POST /api/v1/auth/request-reset-otp
Content-Type: application/json

{
  "email": "user@kkumail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": "123456"
}
```

### Step 2: Verify OTP and Get Reset Token
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@kkumail.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "5 minutes",
  "data": {
    "email": "user@kkumail.com",
    "name": "John Doe"
  }
}
```

### Step 3: Reset Password with Reset Token (REQUIRED)
**⚠️ IMPORTANT: You MUST use the resetToken from Step 2 in the x-access-token header**

```http
POST /api/v1/auth/reset-password
Content-Type: application/json
x-access-token: <resetToken_from_step_2>

{
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## Security Features
1. **OTP Expiration**: 5 minutes validity
2. **Reset Token Expiration**: 5 minutes validity  
3. **Token-based Access**: Reset token required for password change
4. **Verification Status**: OTP must be verified before password reset
5. **Rate Limiting**: Applied to OTP requests
6. **Single Use**: OTP and verification status cleared after successful reset

## Error Scenarios
- Invalid/expired OTP
- Expired reset token (5 minutes)
- **Missing reset token in x-access-token header**
- **Using regular JWT token instead of reset token**
- Unverified OTP for token-based reset
- Invalid email address
- Rate limit exceeded

## Token Requirements
- **Reset Token**: Must be obtained from `/verify-otp` endpoint
- **x-access-token Header**: `x-access-token: <resetToken>` is REQUIRED for `/reset-password`
- **Token Expiration**: Reset token expires in 5 minutes
- **Single Use**: Reset token becomes invalid after successful password reset
