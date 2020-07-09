const jwt = require('jsonwebtoken');
const { createToken, isTokenValidite, revokeRefreshToken, revokeToken } = require('../token');

const verifyToken = async function ({ token, secret, alg }) {
  try {
    const verified = jwt.verify(token, secret, {
      algorithms: [alg],
      ignoreExpiration: false,
    });

    // check token is revoked
    const isValidated = await isTokenValidite(token);
    // if don't have key return res is `null`
    console.log('Redis token', isValidated);
    if (!isValidated) {
      const err = new Error('Token Expired.');
      err.name = 'TokenExpiredError';
      throw err;
    }

    return {
      _id: isValidated,
      ...verified,
    };
  } catch (err) {
    throw err;
  }
};

// Refresh Token の有効性をチェックし revoke した上で data を返す
const getDataByRefreshToken = async (refreshToken) => {
  try {
    const data = await verifyToken({
      token: refreshToken,
      secret: process.env.REFRESH_TOKEN_SECRET,
      alg: process.env.REFRESH_TOKEN_ALG
    });

    // revoke tokens
    await revokeRefreshToken({ key: data._id, refreshToken });

    return data;
  } catch (err) {
    throw err;
  }
};

// Refresh token からユーザーデータと新しい token を作成して返す
const getUserAndNewTokensByRefreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('NO Refresh Token');
    }

    const data = await getDataByRefreshToken(refreshToken);

    const _id = data._id;
    const [newToken, newRefreshToken] = createToken({ _id });
    // create validate data
    return {
      user: _id,
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (err) {
    console.log('Refresh token is Expired.', err.name, err.message);
    return null;
  }
};

const verifyAccessToken = async function (req, res, next) {
  const token = req.header(process.env.TOKEN_HEADER);
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  try {
    const data = await verifyToken({
      token,
      secret: process.env.TOKEN_SECRET,
      alg: process.env.TOKEN_ALG
    });

    req.user = {
      user: data._id,
    };
    return next();
  } catch (err) {
    console.log('Verify Token Error', err.name, err.message);
    if (err.name && err.name === 'TokenExpiredError') {
      // auto refresh
      const refreshData = await getUserAndNewTokensByRefreshToken(
        req.header(process.env.REFRESH_TOKEN_HEADER)
      );
      if (refreshData) {
        console.log('> Auto Refresh Token', refreshData);
        req.user = refreshData;
        return next();
      }
      return res.status(400).send('Token Expired.');
    }
    return res.status(400).send('Invalid Token.');
  }
};

// return user id and revoke Token & refresh Token
const verifyRefreshToken = async function (req, res, next) {
  const token = req.header(process.env.TOKEN_HEADER);
  const refreshToken = req.header(process.env.REFRESH_TOKEN_HEADER);
  if (!refreshToken) {
    return res.status(401).send('Access Denied');
  }

  try {
    const data = await getDataByRefreshToken(refreshToken);

    req.user = {
      _id: data._id,
    };
    return next();
  } catch (err) {
    console.log('Verify Refresh Token Error', err);
    if (err.name && err.name === 'TokenExpiredError') {
      // delete access token
      if (token) {
        revokeToken(token);
      }
      return res.status(400).send('Token Expired.');
    }
    return res.status(400).send('Invalid Token.');
  }
};

module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
