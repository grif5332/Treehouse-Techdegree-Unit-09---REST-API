'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema ({
    title: String,
    description: String,
    estimatedTime: String,
    materialsNeeded: String
});

const Course = mongoose.model('Course', CourseSchema);
module.exports.Course = Course;