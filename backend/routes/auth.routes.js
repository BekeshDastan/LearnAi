const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const { validateUserInput, validateLoginInput, asyncHandler } = require("../middleware/auth.middleware");

const { verifyToken, isAdmin } = require("../middleware/jwt.middleware");

router.post("/users", validateUserInput, asyncHandler(authController.register));

router.post("/login", validateLoginInput, asyncHandler(authController.login));

router.get("/users", verifyToken, isAdmin, asyncHandler(authController.getAllUsers));

router.get("/users/:id", verifyToken, asyncHandler(authController.getUserById));

router.put("/users/:id", verifyToken, validateUserInput, asyncHandler(authController.updateUser));

router.delete("/users/:id", verifyToken, isAdmin, asyncHandler(authController.deleteUser));

module.exports = router;