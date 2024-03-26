const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const utilities = require(".");

const validate = {};

validate.registrationRules = () => {
    return [
      body("account_firstname").trim().isLength({ min: 1 }).withMessage("Please provide a first name."),
      body("account_lastname").trim().isLength({ min: 1 }).withMessage("Please provide a last name."),
      body("account_email").trim().isEmail().withMessage("A valid email is required.")
        .custom(async (value) => {
          const existingUser = await accountModel.checkExistingEmail(value);
          if (existingUser) {
            return Promise.reject('E-mail already in use');
          }
        }),
      body("account_password").trim().isStrongPassword().withMessage("Password does not meet requirements."),
    ];
  };
  
  validate.checkRegData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.status(422).render("account/register", {
        title: "Register",
        nav,
        errors: errors.array(),
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email,
      });
    }
    next();
  };

/* **********************************
 * Login Data Validation Rules
 ***********************************/
validate.loginRules = () => {
    return [
      body("account_email").trim().isEmail().withMessage("Please enter a valid email address."),
      body("account_password").trim().notEmpty().withMessage("Password is required."),
    ];
  };

/* **********************************
 * Check Data and Return Errors or Continue to Login
 ***********************************/
validate.checkLoginData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.status(422).render("account/login", {
        title: "Login",
        nav,
        errors: errors.array(),
        account_email: req.body.account_email, // Keeping the email input if validation fails
      });
    }
    next();
  };

// In your validation file (e.g., account-validation.js)
const accountValidationRules = () => {
    return [
      body('email').custom(async (email, { req }) => {
        const existingUser = await accountModel.getAccountByEmail(email);
        if (existingUser && existingUser.account_id !== req.body.account_id) {
          throw new Error('Email already in use.');
        }
        return true;
      }),
    ];
  };

  // Add to utilities/account-validation.js

  validate.updateAccountRules = () => {
    return [
      body("firstname")
        .trim()
        .notEmpty().withMessage("First name is required."),
        
      body("lastname")
        .trim()
        .notEmpty().withMessage("Last name is required."),
        
      body("email")
        .trim()
        .isEmail().withMessage("A valid email is required.")
        .notEmpty().withMessage("Email is required."),
    ];
  };
  
  validate.checkUpdateAccountData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      // Assume account_id is passed back to correctly identify the user during update.
      return res.status(422).render("account/update", {
        title: "Update Account",
        nav,
        errors: errors.array(),
        account_firstname: req.body.firstname,
        account_lastname: req.body.lastname,
        account_email: req.body.email,
        account_id: req.body.account_id,
      });
    }
    next();
  };
  
  
  const passwordValidationRules = () => {
    return [
    ];
  };
  
  const validateCheck = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
  
module.exports = validate;
