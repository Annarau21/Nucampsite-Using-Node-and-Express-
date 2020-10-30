const express = require('express');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

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

module.exports = router;

