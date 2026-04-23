const jwt = require('jsonwebtoken');

/**
 * Signs a JWT payload and returns the token string.
 */
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Creates a token for the given user document and returns
 * a standardised response object.
 */
const createTokenResponse = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    name: user.name,
  };

  const token = signToken(payload);

  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;

  return { token, user: userObj };
};

module.exports = { signToken, createTokenResponse };
