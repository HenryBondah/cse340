// inv-validation.js
const { body } = require('express-validator');
const invModel = require('../models/inventory-model');

const validate = {};

// Validation rules for adding a classification
validate.addClassificationRules = () => {
  return [
    body('classification_name')
      .trim()
      .isAlphanumeric()
      .withMessage('Classification name must be alphanumeric.'),
  ];
};

// Validation rules for adding an inventory item
validate.addInventoryItemRules = () => {
  return [
    body('make').trim().notEmpty().withMessage('Make is required.'),
    body('model').trim().notEmpty().withMessage('Model is required.'),
    body('classification_id').notEmpty().withMessage('Classification is required.'),
    body('year').isNumeric().isLength({ min: 4, max: 4 }).withMessage('Year must be 4 digits.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('image_path').optional({ checkFalsy: true }).trim().matches(/.*/).withMessage('Image path must be provided.'),
    body('thumbnail_path').optional({ checkFalsy: true }).trim().matches(/.*/).withMessage('Thumbnail path must be provided.'),
    body('price').isDecimal().withMessage('Price must be a valid number.'),
    body('miles').isNumeric().withMessage('Miles must be a valid number.'),
    body('color').trim().notEmpty().withMessage('Color is required.')
  ];
};

module.exports = validate;
