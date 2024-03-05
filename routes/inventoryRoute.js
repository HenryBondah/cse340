// inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { body } = require('express-validator'); // Import the body validator
const invValidation = require('../utilities/inv-validation'); // Adjust path as necessary

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:detailId", invController.buildByDetailId);

// Trigger an intentional error (for testing error handling)
router.get("/trigger-error", (req, res, next) => {
    const err = new Error("Intentional 500 Error Triggered");
    err.status = 500;
    next(err);
});

// Management view
router.get('/', invController.showManagementView);

// Show form to add a new classification
router.get('/add-classification', invController.showAddClassificationForm);

// Add classification with validation
router.post('/add-classification', [
    body('classification_name').trim().isAlphanumeric().withMessage('Classification name must be alphanumeric.'),
], invController.addClassification);

// Use the validation rules for adding a classification
router.post('/add-classification', invValidation.addClassificationRules(), invController.addClassification);

// Use the validation rules for adding an inventory item
router.post('/add-inventory', invValidation.addInventoryItemRules(), invController.addInventoryItem);

// Show form to add a new inventory item
router.get('/add-inventory', invController.showAddInventoryForm);

// Export the router
module.exports = router;
