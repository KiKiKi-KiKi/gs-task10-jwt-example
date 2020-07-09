const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { createToken, revokeAllRefreshTokensByID } = require('../token');
const { verifyRefreshToken } = require('./verifyTolen');
const User = require('../model/User');
const { registerValidation, loginValidation } = require('../validation');

// user object from Database
const getLoginedUserData = (user) => {
  // create token
  // user._id is Object
  const [token, refreshToken] = createToken({ _id: user._id.toString() });

  return {
    user: user._id,
    name: user.name,
    token: token,
    refreshToken: refreshToken,
  };
};

router.post('/register', async (req, res) => {
  // VALIDATE THE DATA BEFORE WE A USER
  const { error } = registerValidation(req.body);

  if (error) {
    const errorMessages = error.details.map((data) => data.message);
    return res.status(400).send(errorMessages.join("\n"));
  }

  // Checking if the user is already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    return res.status(400).send('Email already exists!');
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);

  // Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    console.log('Register User', savedUser);
    const userData = getLoginedUserData(savedUser);
    res.header(process.env.TOKEN_HEADER, userData.token).send(userData);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  // VALIDATE THE DATA BEFORE WE A USER
  const { error } = loginValidation(req.body);
  if (error) {
    const errorMessages = error.details.map((data) => data.message);
    return res.status(400).send(errorMessages.join("\n"));
  }

  // Checking if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send('Email is not found');
  }

  // Checking the password is correct.
  const validPassword = await bcrypt.compareSync(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send('Invalid password.');
  }

  // return user data
  const userData = getLoginedUserData(user);
  res.header(process.env.TOKEN_HEADER, userData.token).send(userData);
});

// login by refresh token
router.post('/relogin', verifyRefreshToken, async (req, res) => {
  const userID = req.user._id.toString();

  // Checking if the email exists
  const user = await User.findOne({ _id: userID });
  if (!user) {
    return res.status(400).send('Invalid Token.');
  }

  // return user data
  const userData = getLoginedUserData(user);
  res.header(process.env.TOKEN_HEADER, userData.token).send(userData);
});

// logout
router.post('/logout', verifyRefreshToken, (req, res) => {
  res.send({
    message: 'Logout.',
    user: req.user._id,
  });
});

// logout all device (just revoke refresh token)
router.post('/logout-all', verifyRefreshToken, async (req, res) => {
  const userID = req.user._id;
  try {
    await revokeAllRefreshTokensByID(userID);
    return res.send({
      message: 'Logout All.',
      user: userID,
    });
  } catch (err) {
    return res.status(400).send('Delete Token Error');
  }
});

module.exports = router;
