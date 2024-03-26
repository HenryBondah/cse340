/**
 * Inventory Route Definitions
 */

const express = require('express');
const router = express.Router();
const utilities = require('../utilities/');
const invController = require('../controllers/invController');
const invValidation = require('../utilities/inv-validation');

// Route to show the form for adding a new classification
router.get('/add-classification', utilities.requireAdminOrEmployee, invController.showAddClassificationForm);

// Route to add a new classification with validation and authorization checks
router.post('/add-classification', utilities.requireAdminOrEmployee, invValidation.addClassificationRules(), invValidation.checkInventoryData, invController.addClassification);

// Route to show the form for adding a new inventory item
router.get('/add-inventory', utilities.requireAdminOrEmployee, invController.showAddInventoryForm);

// Route to add a new inventory item with validation and authorization checks
router.post('/add-inventory', utilities.requireAdminOrEmployee, invValidation.addInventoryItemRules(), invValidation.checkInventoryData, invController.addInventoryItem);

// Route to display inventory items by classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to display detailed view of an inventory item
router.get("/detail/:detailId", invController.buildByDetailId);

// Route to show the management view
router.get('/', utilities.requireAdminOrEmployee, invController.showManagementView);

// Route to show the edit view with error handling
router.get('/edit/:inv_id', utilities.handleErrors(invController.editInventoryView));

// Route to update an inventory item with validation, error handling, and authorization checks
router.post('/edit', utilities.requireAdminOrEmployee, invValidation.updateInventoryRules(), invValidation.checkUpdateData, invController.updateInventory);

// Route to display the delete confirmation view with error handling
router.get("/delete/:inv_id", utilities.handleErrors(invController.deleteConfirmationView));

// Route to process the deletion with error handling and authorization checks
router.post("/delete", utilities.requireAdminOrEmployee, utilities.handleErrors(invController.processDelete));

// Route to trigger an intentional 500 error for testing error handling
router.get("/trigger-error", (req, res, next) => {
    const err = new Error("Intentional 500 Error Triggered");
    err.status = 500;
    next(err);
});

// Route to return inventory by classification as JSON with error handling
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Export the router module
module.exports = router;
