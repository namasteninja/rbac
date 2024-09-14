const User = require('../models/user.model');
const router = require('express').Router();
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render('manage-users', { users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;