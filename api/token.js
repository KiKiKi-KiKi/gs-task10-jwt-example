const path = require('path');
const jwt = require('jsonwebtoken');
const ms = require('ms');
const Redis = require('ioredis');
const redis = new Redis(6379, 'redis');
const redisTokens = new Redis(6379, 'redis', { db: 1 });
const ENV_PATH = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_PATH });
const env = process.env;
const { createHash } = require('./utils');

// convert ms to second
const covertExpireForRedis = (expires) => {
  return ms(expires) / 1000;
};

const saveTokenToRedis = async ({ token, _id, expires }) => {
  // token to hash
  const hashedToken = createHash(token);

  // save value
  const value = JSON.stringify(_id);

  const ttl = covertExpireForRedis(expires);

  // Save redis
  await redis.set(hashedToken, value, 'EX', ttl);

  return hashedToken;
};

const saveTokens = async ({ _id, token, refreshToken }) => {
  const id = _id.toString();
  const [tokenHash, refreshTokenHash] = await Promise.all([
    { token: token, _id: id, expires: env.TOKEN_EXP },
    { token: refreshToken, _id: id, expires: env.REFRESH_TOKEN_EXP },
  ].map((data) => saveTokenToRedis(data)));

  // save Refresh token to list
  const ttl = covertExpireForRedis(env.REFRESH_TOKEN_EXP);
  const pileline = redisTokens.pipeline();
  // 最後の refresh token の有効期限が切れたらデータが消えるように expire を設定
  pileline
    .hset(id, refreshTokenHash, tokenHash)
    .expire(id, ttl)
    .exec();
};

const createToken = (payload) => {
  const iat = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    {
      ...payload,
      iss: env.TOKEN_ISS,
      aud: env.TOKEN_ISS,
      iat: iat,
    },
    env.TOKEN_SECRET,
    {
      algorithm: env.TOKEN_ALG,
      expiresIn: env.TOKEN_EXP
    }
  );

  // Create refresh token
  const refreshToken = jwt.sign(
    {
      iss: env.REFRESH_TOKEN_ISS,
      iat: iat,
    },
    env.REFRESH_TOKEN_SECRET,
    {
      algorithm: env.REFRESH_TOKEN_ALG,
      expiresIn: env.REFRESH_TOKEN_EXP,
    }
  );

  // save token to Redis
  saveTokens({ _id: payload._id, token, refreshToken });

  return [token, refreshToken];
};

// token が redis 上に登録されているか確認して返す
const isTokenValidite = async (key) => {
  try {
    const hashedKey = createHash(key);
    const res = await redis.get(hashedKey);
    return JSON.parse(res);
  } catch (err) {
    console.log('> isTokenValidite', err.name, err.message);
    throw new Error(err);
  }
};

// redis にある token を削除
const revokeToken = async (key) => {
  try {
    const hashedKey = createHash(key);
    // success derete => 1, no key => 0
    const res = await redis.del(hashedKey);
    console.log('> revokeToken', hashedKey, res);
    return res;
  } catch (err) {
    console.log('> revokeToken', err.name, err.message);
    throw err;
  }
};

// _id: {refreshToken: token, ...} のリストから token を取り除き、該当の token を revoke する
const revokeRefreshToken = async ({ key, refreshToken }) => {
  try {
    const refreshTokenHash = createHash(refreshToken);
    const tokenHash = await redisTokens.hget(key, refreshTokenHash);
    // id: {refreshToken, token} のリストから削除
    redisTokens.hdel(key, refreshTokenHash);
    // revoke tokens
    const res = await redis.del(tokenHash, refreshTokenHash);
    console.log('> DELETE', key, tokenHash, refreshTokenHash);
    // console.log('>>', res);
    return res;
  } catch (err) {
    console.log('> revokeRefreshToken', err.name, err.message);
    throw err;
  }
};

const revokeAllRefreshTokensByID = async (key) => {
  try {
    // keysObj = {field: value, ...}
    const keysObj = await redisTokens.hgetall(key);
    console.log(keysObj);
    const list = Object.entries(keysObj).reduce((arr, [key, value]) => {
      return [...arr, key, value];
    }, []);
    // delete list
    redisTokens.del(key);
    console.log('> DELETE ALL RefreshToken', key, list);
    // login 1 user list is empty.
    const res = list.length ? await redis.del(...list) : 0;
    // console.log(res); res is deleted count
    return res;
  } catch (err) {
    console.log('> revokeTokensByID', err.name, err.message);
    throw new Error(err);
  }
};

module.exports.createToken = createToken;
module.exports.isTokenValidite = isTokenValidite;
module.exports.revokeToken = revokeToken;
module.exports.revokeRefreshToken = revokeRefreshToken;
module.exports.revokeAllRefreshTokensByID = revokeAllRefreshTokensByID;
