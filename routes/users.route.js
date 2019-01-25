'use strict'
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
const User = require('../models/user.model').User;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');

// @@@@@@@@@@  This section for Dev purposes @@@@@@@@@@@@@@@@@@@@@@@@@@
// GET /api/users 200
// No Auth needed!   - For Dev purposes
router.get('/:id', (req, res, next) => {
    User.findById(req.params.id)
        .exec((err, users) => {
            if(err) return next(err);
            if(users) {
                res.json(users);
            } else {
                res.json(`User ${req.params.id} does not exist!`)
            };
        });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
// No Auth needed!   - For Dev purposes
router.post('/', (req, res, next) => {
    // creates a new user
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        emailAddress: req.body.emailAddress,
        password: bcrypt.hashSync(req.body.password, 10) // uses bcrypt to hash the password.
    });
    // save the user to MongoDB
    user.save()
        .then(userResult => {
          console.log(userResult);
          res.location('/');
          res.status(201).json('You have added a user!')

        })
        .catch(err => {
            console.log(err);
            res.status(400).json({ error : err });
        });
});

// DELETE /api/users/:id - Deletes a course and returns no content
// Not required, but added for later implementation and for development
// No Auth needed!   - For Dev purposes
router.delete('/:id', (req, res, next) => {
    User.remove({ _id: req.params.id })
        .exec()
        .then(deleteResult => {
            res.status(204).json(deleteResult);
            console.log(deleteResult);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error : err });
        });
  });
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// Basic-Auth and bcrypt.compare()
// middleware to authorize user
router.use((req, res, next) => {
    const aUser = auth(req); // basic-auth 
    if(aUser) {
      User.findOne({ emailAddress: aUser.name })
        .exec((err, user) => {
          if(err) {
            return next(err);
          } else if(!user) {
            err = new Error('Email is required');
            err.status = 401;
            return next(err);
          };
          bcrypt.compare(aUser.pass, user.password, (err, res) => {
            if (res) {
              req.user = user;
              return next();
            } else {
              err = new Error('Incorrect password');
              err.status = 401;
              return next(err);
            };
          });
        });
      };
  });

// api/users Routes - Returns the currently authenticated user
router.get('/', (req, res, next) => {
    User.find({})
        .exec((err, users) => {
            if(err) return next(err);
            res.json(req.user); // must use req.user for bcrypt!
        });
});

module.exports = router;