const router = require('express').Router();
const User = require('../models/user.model.js');
const { body, validationResult } = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport')


// login get
router.get('/login', ensurenotAuthenticated,async (req, res, next) => {

    res.render('login');
})


//login post
router.post('/login' ,ensurenotAuthenticated, passport.authenticate('local',{
    successRedirect:"/user/profile",
    failureRedirect:"/auth/login",
    failureFlash:true
}))


// register get
router.get('/register',ensurenotAuthenticated, async (req, res, next) => {
    res.render('register');
})


// register post

router.post('/register',ensurenotAuthenticated, [
    body('email')
        .trim()
        .isEmail()
        .withMessage('email must be a valid em ial')
        .normalizeEmail()
        .toLowerCase(),
    body('password')
        .trim().isLength(2)
        .withMessage('password length short , min 2 char required'),
    body('password2').custom((value, {req})=>{
        if(value!== req.body.password){
            throw new Error('Password do not match')
        }
        return true;
    })
], async (req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach(error => {
                req.flash('error', error.msg)
            })
            res.render('register', { messages: req.flash() })
            return;
        }

        const { email } = req.body;
        const doesexist = await User.findOne({ email });

        // check if the user is already register 
        if (doesexist) {
            res.redirect('/auth/register')
            return;
        }
        const user = new User(req.body)
        await user.save();

        req.flash('success', `${user.email}registered succesfully`)
        res.redirect('/auth/login')

        res.send(user);
    } catch (error) {
        next(error);

    }
})


router.get('/logout', ensureAuthenticated, (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        req.flash('success', 'You have been logged out successfully');
        res.redirect('/');
    });
});

module.exports = router;

function ensureAuthenticated(req, res , next){
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/auth/login');
    }
}

function ensurenotAuthenticated(req, res , next){
    if(req.isAuthenticated()){
        res.redirect('back');
    }else{
       next();
    }
}