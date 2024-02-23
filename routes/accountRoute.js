// In ./routes/accountRoute.js
const express = require("express");
const router = new express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities/'); 
const { route } = require("./static");

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
//route to registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

module.exports = router;

