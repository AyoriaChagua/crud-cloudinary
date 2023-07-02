const User = require("../models/User.js");

exports.checkDuplicateUsernameOrEmail = async (req, res, next) => {
  console.log(req.body)
  const user = await User.findOne({ username: req.body.username });
  if (user)
    return res
      .render("register", { error: `The user ${user.username} already exists` });

  const email = await User.findOne({ email: req.body.email });
  if (email)
    return res
      .status(400)
      .render("register", { error: `The email ${email.email} already exists` });
  next();
};
