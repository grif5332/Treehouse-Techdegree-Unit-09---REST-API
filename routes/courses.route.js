'use strict'
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Course = require('../models/course.model').Course;
const User = require('../models/user.model').User;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const auth = require('basic-auth');

router.use(bodyParser.urlencoded({extended: false}));

router.param('id', (req, res, next, id) => {
  Course.findById(id, (err, doc) => {
    if(err) return next(err);
    if(!doc) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    };
    req.course = doc;
    return next();
  })
});

// api/courses Routes
// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
// No auth needed
router.get('/', (req, res, next) => {
  Course.find({})
        .populate('user', 'firstName lastName')
        .sort({ _id : 1 })
        .exec((err, courses) => {
          if(err) return next(err);
          res.json(courses);
        });
});

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID
// No auth needed
router.get('/:id', (req, res, next) => {
  Course.findById(req.params.id)
        .populate('user', 'firstName lastName')
        .exec((err, courses) => {
          if(err) return next(err);
          if(courses) {
            res.status(200).json(courses);
          } else {
            res.status(404).json(`Course ${req.params.id} does not exist!`)
          };
        });
});

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
            return next()
          } else {
            err = new Error('Incorrect password');
            err.status = 401;
            return next(err);
          };
        });
      });
    };
});

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/', (req, res, next) => {
  // creates a new course object
  const course = new Course({
    user: req.user,  // adds the current auth'd user to the created course
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded
  });
  // saves the new course in the MongoDB
  course.save()
        .then(courseResult => {
          console.log(courseResult);
          res.status(201).json('You have posted a course to the catalog!')
        })
        .catch(err => {
          console.log(err);
          // res.status(403).json('Unable to add the course');
          // const addErr = new Error('user does not have delete permissions');
          err.status = 403;
          next(err)
        });;
});

// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/:id', (req, res, next) => {
  // if the courses user matches the current auth'd user
  if (req.course.user.toString() === req.user._id.toString()) {
      req.course.update(req.body, (err /*, res*/) => {
        if(err) return next(err);
        return res.sendStatus(204);
      });
  } else {
    const err = new Error('user does not have update permissions');
    err.status = 403;
    next(err)
   }
});

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/:id', (req, res, next) => {
  // check if the current user is the owner of the course.
  if(req.course.user.toString() === req.user._id.toString()) {
    Course.remove({ _id: req.params.id })
          .exec()
          .then(deleteResult => {
            res.status(204).json(deleteResult);
            console.log(deleteResult);
          })
          .catch(err => {
            console.log(err);
            err.sendStatus(403);
            // res.status(403).json('You do not have permissions to delete this course');
          });
  } else {
    // res.status(401).json('You do not have permissions to delete this course')
    const err = new Error('user does not have delete permissions');
    err.status = 401;
    next(err)
  };
});

module.exports = router;
  