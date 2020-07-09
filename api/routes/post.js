const router = require('express').Router();
const { verifyAccessToken } = require('./verifyTolen');

// middleweare verify JWT token
router.get('/', verifyAccessToken, (req, res) => {
  res.send(req.user);
  // res.json({
  //   posts: {
  //     title: 'my first post',
  //     dessciption: 'random data you shouldnt access',
  //   }
  // });
});

module.exports = router;
