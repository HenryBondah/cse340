// inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { body } = require('express-validator'); // Import the body validator

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

// Show form to add a new inventory item
router.get('/add-inventory', invController.showAddInventoryForm);

// Add inventory item with server-side validation
router.post('/add-inventory', [
    // Example validation, adjust according to your form fields and requirements
    body('inv_make').trim().notEmpty().withMessage('Make is required.'),
    body('inv_model').trim().notEmpty().withMessage('Model is required.'),
    body('classification_id').notEmpty().withMessage('Classification is required.'),
    // Add validations for other fields like inv_image, inv_thumbnail, inv_price, inv_description as necessary
], invController.addInventoryItem);

// Export the router
module.exports = router;
