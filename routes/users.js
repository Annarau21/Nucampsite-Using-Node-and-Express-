const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
/*
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
}); //return an array with all the user documents after confimed admin
*/

router.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find()
    .then(users => {
        if (users) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        } else {
            err = new Error(`User not found`);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})

router.post('/signup', (req, res) => {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            } else {
                if (req.body.firstname) { //check if firstname was sent
                    user.firstname = req.body.firstname; 
                }
                if (req.body.lastname) { //check if last name was sent
                    user.lastname = req.body.lastname;
                }
                user.save(err => { //save this to the database
                    if (err) { //will handle any errors
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return;
                    }
                    passport.authenticate('local')(req, res, () => { //will send authorization
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: 'Registration Successful!'});
                    });
                });
            }
        }
    );
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id}); //once auth, will give token to user
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => { //get because client is not submitting anything
    if (req.session) { //if session exists
        req.session.destroy(); //then detroy
        res.clearCookie('session-id'); //clear cookie
        res.redirect('/'); //redirect to main
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    if (req.user) {
        const token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, token: token, status: 'You are successfully logged in!'});
    }
});

module.exports = router;

