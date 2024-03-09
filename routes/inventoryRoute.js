// inventoryRoute.js
const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');
// Import validation rules from utilities. Ensure this path is correct based on your project structure.
const invValidation = require('../utilities/inv-validation');

// Route to add a new classification with validation and check for errors
router.post('/add-classification', invValidation.addClassificationRules(), invValidation.checkInventoryData, invController.addClassification);

// Route to add a new inventory item with validation and check for errors
router.post('/add-inventory', invValidation.addInventoryItemRules(), invValidation.checkInventoryData, invController.addInventoryItem);

// Route to display inventory items by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display detailed view of an inventory item
router.get("/detail/:detailId", invController.buildByDetailId);

// Route to show the management view
router.get('/', invController.showManagementView);

// Route to show the form for adding a new classification
router.get('/add-classification', invController.showAddClassificationForm);

// Route to show the form for adding a new inventory item
router.get('/add-inventory', invController.showAddInventoryForm);

// Route to trigger an intentional 500 error for testing error handling
router.get("/trigger-error", (req, res, next) => {
    const err = new Error("Intentional 500 Error Triggered");
    err.status = 500;
    next(err);
});

// Export the router module
module.exports = router;
