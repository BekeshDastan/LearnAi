require('dotenv').config(); 
const jwt = require('jsonwebtoken');

const secretKey = 'blockchain';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("Auth Header:", authHeader); 

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token' });

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log("JWT Error:", err.message); 
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.userRoles = decoded.roles;
        console.log("User Role from Token:", req.userRoles); 
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.userRoles !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
};

module.exports = { verifyToken, isAdmin, secretKey };