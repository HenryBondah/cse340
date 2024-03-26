// In ./routes/accountRoute.js
const express = require("express");
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities/');
const regValidate = require('../utilities/account-validation');
const validate = require('../utilities/account-validation');

// Route to display the login view
router.get("/login", accountController.buildLogin);

// Route to display the registration view
router.get("/register", accountController.buildRegister);

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  accountController.registerAccount
);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  accountController.accountLogin
);

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('jwt'); 
  req.flash('success', 'You have been logged out.');
  res.redirect('/'); // Redirect to home view
});

// Default route for the account section after a successful login
router.get("/", utilities.checkLogin, accountController.buildAccount);

// Route to display the update account form
router.get('/update/:account_id', utilities.checkLogin, accountController.displayUpdateAccountForm);

// Route to process the account update
router.post('/update', utilities.checkLogin, accountController.processAccountUpdate);

// In routes/accountRoute.js

router.post("/update/:account_id",
  validate.updateAccountRules(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.render("/account/update", {
        title: "Update Account Information",
        nav,
        errors: errors.array(),
        account: req.body, // Pass back the submitted data to re-populate the form
      });
    }
    next();
  },
  accountController.processAccountUpdate
);


// Route to process the password change
router.post('/changePassword', utilities.checkLogin, accountController.processPasswordChange);

module.exports = router;
