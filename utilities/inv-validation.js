// inv-validation.js
const { body, validationResult } = require('express-validator');
const inventoryModel = require('../models/inventory-model'); 
const utilities = require('../utilities/index'); 

const validate = {};

/* **********************************
 * Inventory Item Data Validation Rules
 ********************************** */
validate.addInventoryItemRules = () => {
    return [
        body('make')
            .trim()
            .notEmpty()
            .withMessage('Please provide a make.'),
        
        body('model')
            .trim()
            .notEmpty()
            .withMessage('Please provide a model.'),
        
        body('year')
            .trim()
            .isNumeric()
            .isLength({ min: 4, max: 4 })
            .withMessage('Year must be a 4-digit number.'),
        
    ];
};

/* **********************************
 * Classification Data Validation Rules
 ********************************** */
validate.addClassificationRules = () => {
    return [
        body('classification_name')
            .trim()
            .isAlphanumeric()
            .withMessage('Classification name must be alphanumeric.'),
        
    ];
};

/* ******************************
 * Check data and return errors or continue with the process
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("inventory/add-inventory", {
            errors: errors.array(),
            title: "Add Inventory Item",
            nav,
            formData: req.body, 
        });
    } else {
        next();
    }
};

/* ******************************
 * Check data and return errors will be directed back to the edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    console.log("check edit was called")
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("there are errors in validation")
        let nav = await utilities.getNav(); 
        res.render("inventory/edit", {
            errors: errors.array(),
            title: "Edit Inventory",
            nav,
            formData: req.body,
            inv_id: req.params.inv_id, 
        });
    } else {
        next();
    }
};

validate.updateInventoryRules = () => {
    return [
        body('inv_make').trim().notEmpty().withMessage('Make is required.'),
        body('inv_model').trim().notEmpty().withMessage('Model is required.'),
        body('inv_year').isLength({ min: 4, max: 4 }).withMessage('Year must be a 4-digit number.').isNumeric().withMessage('Year must be numeric.'),
        body('inv_price').isDecimal().withMessage('Price must be a valid number.'),
        body('inv_miles').isNumeric().withMessage('Miles must be numeric.'),
        body('inv_color').trim().notEmpty().withMessage('Color is required.'),
        body('classification_id').notEmpty().withMessage('Classification is required.'),
        body('inv_description').trim().notEmpty().withMessage('Description is required.'),
        body('inv_image').trim().notEmpty().withMessage('Image path is required.'),
        body('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail path is required.')
    ];
};


validate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        req.flash('formData', req.body);
        return res.redirect(`/inv/edit/${req.params.inv_id}`);
    }
    next();
};

  
  const checkInventoryData = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());
      req.flash('formData', req.body);
      return res.redirect(`/inv/edit/${req.body.inv_id}`);
    }
    next();
  };

module.exports = validate;
