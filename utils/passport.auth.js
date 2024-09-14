const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/user.model')


passport.use(
    new LocalStrategy({
        usernameField:"email",
        passwordField:"password"


    } ,async (email , password , done)=>
    {
       try {
             const user = await User.findOne({email});
             // username does not exixt

             if(!user)
             {
                return done(null , false , {message: "username/email not regsitered"});
             }

             // email exist and now we need to verify 

             const isMatch = await user.isValidPassword(password);


             return isMatch?done(null , user) :done(null , false , {message : 'incorrect password'});

             
        
       } catch (error) {
        done(error)
        
       }
    }
));

passport.serializeUser(function(user , done){
    done(null, user.id);
});


passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});