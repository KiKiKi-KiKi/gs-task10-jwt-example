const router = require('express').Router();
const { verifyRefreshToken } = require('./verifyTolen');
const { createToken } = require('../token');
const User = require('../model/User');

// middleweare verify JWT token
router.post('/refresh', verifyRefreshToken, async (req, res) => {
  const userID = req.user._id.toString();

  // Checking if the email exists
  const user = await User.findOne({ _id: userID });
  if (!user) {
    return res.status(400).send('Invalid Token.');
  }

  const [token, refreshToken] = createToken({ _id: userID });
  res.header(process.env.TOKEN_HEADER, token).send({
    token,
    refreshToken,
  });
});

module.exports = router;
