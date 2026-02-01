const express = require("express");
const User = require("../models/User.model");

// User input validation middleware
const validateUserInput = (req, res, next) => {
    const { name, surname, age, email, password } = req.body;

    if (!name || !surname || !age || !email || !password) {
        return res.status(400).json({ error: "Each field is required" });
    }

    next();
};

// Login validation middleware
const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    next();
};

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    validateUserInput,
    validateLoginInput,
    asyncHandler
};