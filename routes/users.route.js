'use strict'
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
const User = require('../models/user.model').User;

// api/users Routes

router.get('/', (req, res, next) => {
    res.json({
        message : "Please define a User ID!"
    });
});

// GET /api/users 200 - Returns the currently authenticated user
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


module.exports = router;