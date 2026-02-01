const express = require('express');
const Course = require('../models/Course.model');
const { asyncHandler } = require('../middleware/auth.middleware');
