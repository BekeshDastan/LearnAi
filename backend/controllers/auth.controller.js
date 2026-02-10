const jwt = require('jsonwebtoken');
const User = require("../models/User.model");
const bcrypt = require('bcrypt');
const { secretKey } = require('../middleware/jwt.middleware');

exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
};

exports.register = async (req, res) => {
    const { name, surname, age, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({ name, surname, age, email, password: hashedPassword });
    res.status(201).json(newUser);
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        const token = jwt.sign(
            { id: user._id, roles: user.roles }, 
            secretKey, 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Login successful", 
            token: token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                roles: user.roles 
            } 
        });

    } catch (error) {
        res.status(500).json({ error: "Server error during login" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, surname, age, email, password } = req.body;
        
        const updateData = { name, surname, age, email };

        if (password && password.trim() !== "") {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        const changedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData }, 
            { new: true, runValidators: true }
        );

        if (!changedUser) return res.status(404).json({ error: "User not found" });
        
        res.json(changedUser);
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(400).json({ error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
};