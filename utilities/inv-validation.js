// inv-validation.js
const { body, validationResult } = require('express-validator');
const inventoryModel = require('../models/inventory-model'); // Adjust path as necessary
const utilities = require('../utilities/index'); // Ensure utilities are correctly imported

const validate = {};

/* **********************************
 * Inventory Item Data Validation Rules
 ********************************** */
validate.addInventoryItemRules = () => {
    return [
        // Make is required and must be a string
        body('make')
            .trim()
            .notEmpty()
            .withMessage('Please provide a make.'),
        
        // Model is required and must be a string
        body('model')
            .trim()
            .notEmpty()
            .withMessage('Please provide a model.'),
        
        // Year must be a valid year
        body('year')
            .trim()
            .isNumeric()
            .isLength({ min: 4, max: 4 })
            .withMessage('Year must be a 4-digit number.'),
        
        // Additional validation rules as necessary...
    ];
};

/* **********************************
 * Classification Data Validation Rules
 ********************************** */
validate.addClassificationRules = () => {
    return [
        // Classification name is required and must be alphanumeric
        body('classification_name')
            .trim()
            .isAlphanumeric()
            .withMessage('Classification name must be alphanumeric.'),
        
        // Additional validation rules as necessary...
    ];
};

/* ******************************
 * Check data and return errors or continue with the process
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav(); // Ensure getNav is correctly defined and exported in your utilities
        // Adjust rendering to the appropriate inventory form with error messages
        res.render("inventory/add-inventory", {
            errors: errors.array(),
            title: "Add Inventory Item",
            nav,
            formData: req.body, // Include formData to maintain "stickiness" of the form
        });
    } else {
        next();
    }
};

module.exports = validate;
