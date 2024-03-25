const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

const validate = {};

/* **********************************
 * Registration Data Validation Rules
 ***********************************/
validate.registrationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."),
        
        body("account_lastname")
            .trim()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),
        
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() 
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (emailExists > 0) {
                    throw new Error("Email exists. Please log in or use a different email.");
                }
            }),
        
        body("account_password")
            .trim()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* **********************************
 * Check Data and Return Errors or Continue to Registration
 ***********************************/
validate.checkRegData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav(); 
        res.render("account/register", { 
            errors: errors.array(),
            title: "Register",
            nav,
        });
    } else {
        next();
    }
};

/* **********************************
 * Login Data Validation Rules
 ***********************************/
validate.loginRules = () => {
    return [
        // Email must be valid
        body("account_email")
            .trim()
            .isEmail()
            .withMessage("Please provide a valid email address."),
        
        // Password is required
        body("account_password")
            .trim()
            .not()
            .isEmpty()
            .withMessage("Password is required."),
    ];
};

/* **********************************
 * Check Data and Return Errors or Continue to Login
 ***********************************/
validate.checkLoginData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors: errors.array(),
            title: "Login",
            nav,
        });
    } else {
        next();
    }
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
