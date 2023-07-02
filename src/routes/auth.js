const { Router } = require("express")
const router_auth = Router()
const { verifySignUp } = require("../middlewares/index.js")
const User = require("../models/User.js")
const { SENGRID_KEY, SECRET_KEY, JWT_SECRET } = require("../config/config.js")
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(SENGRID_KEY)


const jwt = require("jsonwebtoken")


let countAttemps = 0;

router_auth.get('/login', async (req, res) => {
    try {
        res.render("login")
    } catch (error) {
        res.status(500).json({ error: "" });
    }
})

router_auth.post('/login',  [
    body('email').isEmail(),
    body('password').notEmpty(),
    body('g-recaptcha-response').notEmpty().withMessage('Please complete the reCAPTCHA'),
  ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('login', { error: "Please complete the reCAPTCHA"  });
        }
        const userCaptcha = req.body['g-recaptcha-response'];
        const secretKey = SECRET_KEY; // Reemplaza con tu propia clave secreta
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptcha}`;
    
        const response = await axios.post(verificationUrl);
        const { success } = response.data;

        if(success) {
            const user = req.body
            const userFound = await User.findOne({ email: user.email })
                
            if(!userFound){
                return res.render("login", { error: "Invalid username and/or password" });
            }
                
            if (!userFound.isBlocked){
        
                const matchPassword = await User.comparePassword(
                    user.password,
                    userFound.password
                );
            
                if (!matchPassword){
                    countAttemps ++;
                    console.log(countAttemps)
                    if(countAttemps == 2 ){
                        return res.render("login", { error: "You only have one more try, otherwise your account will be locked" });
                    }
                    if(countAttemps == 3){
                        await User.findByIdAndUpdate(userFound._id, { isBlocked: true }, { new: true })
                        return res.render("login", { error: "For security reasons this account has been blocked" });
                    }
                    return res.render("login", { error: "Invalid username and/or password" });
                }
                    const token = jwt.sign({ id: userFound._id }, JWT_SECRET, {
                        expiresIn: 86400,
                    });
                return res.render("patients", {token})
            }
            res.render("login", { error: "Sorry, this account has been blocked" })
        }else {
            return res.render('login', { error: 'Invalid reCAPTCHA' });
        }
    } catch (error) {
        res.render('login', { error: 'Oops, something went wrong' });;
    }
})

router_auth.get('/register', async (req, res) => {
    try {
        res.render("register")
    } catch (error) {
        res.status(500).json({ error: "" });
    }
})

router_auth.post('/register', [
    verifySignUp.checkDuplicateUsernameOrEmail,
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('g-recaptcha-response').notEmpty().withMessage('Please complete the reCAPTCHA'),
],

    async (req, res) => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
            return res.render('login', { errors: errors.array() });
            }
            const userCaptcha = req.body['g-recaptcha-response'];
            const secretKey = SECRET_KEY; // Reemplaza con tu propia clave secreta
            const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${userCaptcha}`;
        
            const response = await axios.post(verificationUrl);
            const { success } = response.data;

            if(success) {
                const user = req.body
                if (!errors.isEmpty()) return res.render("register", { errors: errors.array() });
                const newUser = new User({
                    username: user.username,
                    email: user.email,
                    password: await User.encryptPassword(user.password),
                });
                await newUser.save();

                const message = setMessage(newUser.email, "Account registered in ClinicApp", "Your account has been created successfully, keep in mind our security measures for your account. It is important that you remember your password.", newUser.username)

                await sgMail.send(message)
                
                res.render("login", { msg: "Successful registration, we send you an email with the email confirmation" })
                
            }
        } catch (error) {
            res.render("register", { error: "Oops, something went wrong, try again or later" })
        }
    }
)

const setMessage = (to, subject, text, name) => {
    return {
        to,
        from: "ayoria.chagua@tecsup.edu.pe",
        subject,
        text,
        html: `<h2>Hello ${name}</h2><p>${text}</p>`
    }
}

module.exports = router_auth