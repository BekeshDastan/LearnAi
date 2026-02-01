
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

const { validateUserInput, validateLoginInput, asyncHandler } = require("../middleware/auth.middleware");

router.get("/users", asyncHandler(authController.getAllUsers));

router.get("/users/:id", asyncHandler(authController.getUserById));

router.post("/users", validateUserInput, asyncHandler(authController.register));

router.post("/login", validateLoginInput, asyncHandler(authController.login));

router.put("/users/:id", validateUserInput, asyncHandler(authController.updateUser));

router.delete("/users/:id", asyncHandler(authController.deleteUser));

module.exports = router;