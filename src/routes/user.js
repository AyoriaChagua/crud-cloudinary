const { Router } = require("express");
const { SENGRID_KEY, JWT_SECRET } = require("../config/config.js")
const router_user = Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User.js")
const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(SENGRID_KEY)

router_user.get('/', async(req, res)=>{
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);
        const userId = decodedToken.id;
        res.json(userId)
    } catch (error) {
        res.json(error);
    }
})

router_user.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId).lean()
    res.render('edit-profile', {user});
  });

  router_user.post('/password', async (req, res) => {
    const { userId, password } = req.body;
    const newPassword = await User.encryptPassword(password);
    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let shouldRenderError = false;

    for (const pass of user.pastPasswords) {
        const matchPassword = await User.comparePassword(password, pass);
        if (matchPassword) {
            shouldRenderError = true;
            break;
        }
    }

    if (shouldRenderError) {
        return res.render("edit-profile", { error: "oops, do you want to use one of the last 4 passwords again?" });
    }

    user.pastPasswords.unshift(newPassword);

    if (user.pastPasswords.length > 4) {
        user.pastPasswords.pop();
    }

    user.password = newPassword;

    await User.findByIdAndUpdate(userId, user, { new: true });

    const message = setMessage(user.email, "Updated password in ClinicApp", "I hope you remember your password and do not have to change it again, it will be more difficult to remember it more and more.", user.username);

    await sgMail.send(message);

    return res.redirect(`/profile/${userId}`);
});



const setMessage = (to, subject, text, name) => {
    return {
        to,
        from: "ayoria.chagua@tecsup.edu.pe",
        subject,
        text,
        html: `<h2>Hello ${name}</h2><p>${text}</p>`
    }
}


module.exports = router_user