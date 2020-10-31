const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');
const { NotExtended } = require('http-errors');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //new instance with var callback function
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600}); //will return token
}; // can allow expire to make it easier to remove

const opts = {}; //wil contain options for jwt
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //configure jwt strategy //how it is extracted from message, in Header
opts.secretOrKey = config.secretKey; // 

exports.jwtPassport = passport.use( //takes instance of jwt as a parameter
    new JwtStrategy(
        opts, //object with options, first argument
        (jwt_payload, done) => { //verify callback function
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false); //false, no user was found
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false); //no err and no user
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', {session: false});
//passport.auth -> third party, helps us identify user

exports.verifyAdmin = function(req, res, next) {
    if(req.user.admin){
        return next();
    } else{
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }
}