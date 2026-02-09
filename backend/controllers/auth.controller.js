const User = require("../models/User.model");
const bcrypt = require('bcrypt');

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
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!user || !isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
    }
    
    res.json({ 
        message: "Login successful", 
        user: { id: user.id, name: user.name, email: user.email } 
    });
};

exports.updateUser = async (req, res) => {
    const { name, surname, age, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const changedUser = await User.findByIdAndUpdate(
        req.params.id,
        { name, surname, age, email, password: hashedPassword },
        { new: true, runValidators: true }
    );
    if (!changedUser) return res.status(404).json({ error: "User not found" });
    res.json(changedUser);
};


exports.deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
};