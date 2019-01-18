'use strict'
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
const Course = require('../models/course.model').Course;
const mongoose = require('mongoose');

// api/courses Routes
// GET /api/courses 200 - Returns a list of courses (including the user that owns each course)
router.get('/', (req, res, next) => {
    Course.find({})
          .sort({ _id : 1 })
          .exec((err, courses) => {
            if(err) return next(err);
            res.json(courses);
          });
});

// GET /api/courses/:id 200 - Returns the course (including the user that owns the course) for the provided course ID
router.get('/:id', (req, res, next) => {
    Course.findById(req.params.id)
          .exec((err, courses) => {
            if(err) return next(err);
            if(courses) {
              res.status(200).json(courses);
            } else {
              res.status(404).json(`Course ${req.params.id} does not exist!`)
            };
          }); 
});

// POST /api/courses 201 - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/', (req, res, next) => {

  // creates a new course object
  const course = new Course({
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
        });
});

// PUT /api/courses/:id 204 - Updates a course and returns no content
router.put('/:id', (req, res, next) => {
  res.status(204).json(`You have updated course ${req.params.id}`)
});

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete('/:id', (req, res, next) => {
  res.status(204).json(`You have deleted course ${req.params.id}`)
});

module.exports = router;
  