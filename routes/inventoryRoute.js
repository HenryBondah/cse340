// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:detailId", invController.buildByDetailId);
module.exports = router;

router.get("/trigger-error", (req, res, next) => {
    // Intentionally throw an error
    const err = new Error("Intentional 500 Error Triggered");
    err.status = 500; // Set the error status to 500
    next(err); // Forward the error to the error-handling middleware
  });