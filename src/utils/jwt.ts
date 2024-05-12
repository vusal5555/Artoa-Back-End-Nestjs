import * as jwt from 'jsonwebtoken';

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, 'jwt456', { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, 'jwt123', { expiresIn: '1d' });
};

const jsonTokenGenerator = (res: any, user: any) => {
  // Generate access token
  const accessToken = generateAccessToken(user._id);

  // Generate refresh token
  const refreshToken = generateRefreshToken(user._id);

  // Set cookies refresh token
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: 'None',
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  return { accessToken, refreshToken };
};

export default jsonTokenGenerator;
