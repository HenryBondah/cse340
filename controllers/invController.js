const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require('express-validator'); 
const { getClassificationsWithApprovedItems } = require('../models/inventory-model'); // Adjust the path as necessary

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res) {
    const classification_id = req.params.classificationId;
    try {
        const data = await invModel.getInventoryByClassificationId(classification_id);
        const grid = await utilities.buildClassificationGrid(data);
        let nav = await utilities.getNav();
        const className = data.length > 0 ? data[0].classification_name : 'Unknown Classification';
        res.render("inventory/classification", {
            title: `${className} Vehicles`,
            nav,
            grid,
        });
    } catch (error) {
        console.error("Error fetching inventory by classification:", error);
        res.status(500).send("Error loading the page.");
    }
};

/* ***************************
 *  Build DETAIL by classification view
 * ************************** */
invCont.buildByDetailId = async function (req, res) {
    const detail_id = req.params.detailId;
    try {
        const data = await invModel.getInventoryByDetailId(detail_id);
        if (data && data.length > 0) {
            const grid = await utilities.buildDetailGrid(data);
            let nav = await utilities.getNav();
            res.render("inventory/detail", {
                title: `${data[0].inv_make} ${data[0].inv_model} Details`,
                nav,
                grid,
            });
        } else {
            let nav = await utilities.getNav(); 
            res.render("inventory/detail", {
                title: "Vehicle Not Found",
                nav,
                grid: "<p>Vehicle details could not be found.</p>",
            });
        }
    } catch (error) {
        console.error("Error fetching inventory detail:", error);
        res.status(500).send("Error loading the page.");
    }
};

/* ***************************
 *  Show Form for Adding a Classification
 * ************************** */
invCont.showAddClassificationForm = async function(req, res) {
    let nav = await utilities.getNav(); 
    res.render("inventory/addClassification", {
        title: "Add New Classification",
        errors: [],
        formData: {},
        nav 
    });
};

/* ***************************
 *  Add a Classification with Validation
 * ************************** */
invCont.addClassification = async function(req, res) {
    const classificationName = req.body.classification_name;
    try {
        const existingClassification = await invModel.checkClassificationExistence(classificationName);
        if (existingClassification) {
            req.flash('error', 'Classification already exists.');
            return res.redirect('/inv/add-Classification');
        }

        await invModel.addClassification(classificationName);
        req.flash('success', 'Classification added successfully.');
        res.redirect("/inv/");
        const classifications = await invModel.getClassifications(); // Fetch updated list of classifications
        res.render("inventory/managementView", {
            title: "Vehicle Management",
            classifications: classifications, // Pass the classifications to the view
        });
    } catch (error) {
        console.log("catch executed")
        console.error("Failed to add classification:", error);
        req.flash('error', 'Failed to add classification.');
        res.redirect('/inv');
    }
};


/* ***************************
 *  Show Form for Adding an Inventory Item
 * ************************** */
invCont.showAddInventoryForm = async function(req, res) {
    const errors = req.flash('errors');
    const formData = req.flash('formData')[0]; 
    try {
        const classifications = await invModel.getClassifications();
        let nav = await utilities.getNav();
        res.render("inventory/addInventory", {
            title: "Add Vehicle",
            classifications: classifications.rows,
            formData: formData || {}, 
            errors: errors,
            nav
        });
    } catch (error) {
        console.log("catch executed")
        console.error("Failed to add classification:", error);
        req.flash('error', 'Failed to add classification.');
        res.redirect('inventory/addInventory');
    }
};

/* ***************************
 *  Add an Inventory Item with Validation and Sticky Form Functionality
 * ************************** */
invCont.addInventoryItem = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array());
        req.flash('formData', req.body);
        return res.redirect('/inv/add-inventory');
    }
    try {
        const inventoryData = {
            inv_make: req.body.make,
            inv_model: req.body.model,
            inv_year: req.body.year,
            inv_description: req.body.description,
            inv_image: req.body.image_path,
            inv_thumbnail: req.body.thumbnail_path,
            inv_price: req.body.price,
            inv_miles: req.body.miles,
            inv_color: req.body.color,
            classification_id: req.body.classification_id
        };
        await invModel.addInventoryItem(inventoryData);
        req.flash('success', 'Inventory item added successfully.');
        res.redirect('/inv/'); 
    } catch (error) {
        console.error("Failed to add inventory item:", error);
        req.flash('error', 'Failed to add inventory item.');
        res.redirect('/inv/add-inventory');
    }
};

/* ***************************
 *  Show Management View
 * ************************** */

invCont.showManagementView = async function(req, res) {
    try {
        // Fetch navigation links
        let nav = await utilities.getNav();

        let classifications = await getClassificationsWithApprovedItems(); // Use the new method here

        let formData = {}; 

        res.render("inventory/managementView", {
            title: "Vehicle Management",
            nav,
            classifications, 
            formData, 
        });
    } catch (error) {
        console.error("Error loading management view:", error);
        res.status(500).send("Sorry, we appear to have lost that page.");
    }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    let classification_id = parseInt(req.params.classificationId);
    if (isNaN(classification_id)) {
        return res.status(400).send("Invalid classification ID.");
    }
    try {
        const invData = await invModel.getInventoryByClassificationId(classification_id);
        if (invData && invData.length > 0) {
            return res.json(invData);
        } else {
            return res.status(404).send("No inventory items found for the specified classification.");
        }
    } catch (error) {
        console.error("Error fetching inventory by classification:", error);
        next(error); // Pass the error to the global error handler
    }
};
  
/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    try {
        const itemData = await invModel.getInventoryById(inv_id);
        const classifications = await invModel.getClassifications(); // Fetch classifications
        const classificationSelect = await utilities.buildClassificationList(itemData.classification_id); // Assuming this is needed separately
        
        const errors = []; 
        
        res.render("inventory/edit", {
            title: "Edit " + itemData.inv_make + " " + itemData.inv_model,
            nav,
            classificationSelect,
            itemData,
            classifications: classifications.rows, 
            errors,  
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_description: itemData.inv_description,
            inv_image: itemData.inv_image,
            inv_thumbnail: itemData.inv_thumbnail,
            inv_price: itemData.inv_price,
            inv_miles: itemData.inv_miles,
            inv_color: itemData.inv_color,
            classification_id: itemData.classification_id
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading the edit page.");
    }
};

/* ***************************
* Update Inventory Data
* ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
    } = req.body
    console.log("inv_make", req.body)
    const updateResult = await invModel.updateInventory(
    inv_id, 
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
    )
    console.log("updateresutl: ", updateResult )
    if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
    } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
    } 
}

  /* ***************************
 *  Display Delete Confirmation View
 * ************************** */
  invCont.deleteConfirmationView = async function(req, res) {
    const inv_id = parseInt(req.params.inv_id);
    try {
        const itemData = await invModel.getInventoryById(inv_id);
        if (!itemData) {
            req.flash('error', 'Inventory item not found.');
            return res.redirect('/inv/'); 
        }
        let nav = await utilities.getNav(); 
        res.render("inventory/delete", {
            title: "Delete Confirmation",
            nav,
            ...itemData 
        });
    } catch (error) {
        console.error("Error loading the delete confirmation page:", error);
        req.flash('error', 'Error loading the delete confirmation page.');
        res.redirect('/inv/'); 
    }
};

/* ***************************
 *  Process Delete Request
 * ************************** */
invCont.processDelete = async function(req, res) {
    const inv_id = parseInt(req.body.inv_id);
    try {
        const result = await invModel.deleteInventoryItem(inv_id);
        if (result) {
            req.flash('success', 'Inventory item deleted successfully.');
        } else {
            req.flash('error', 'Failed to delete inventory item.');
        }
        res.redirect("/inv/");
    } catch (error) {
        console.error("Error deleting inventory item:", error);
        req.flash('error', 'Failed to delete inventory item.');
        res.redirect("/inv/"); 
    }
};

/* ***************************
 *  Show Approval View
 * ************************** */
invCont.showApprovalView = async function(req, res) {
    try {
        // Assume getUnapprovedClassifications() is defined elsewhere in invModel
        let unapprovedClassifications = await invModel.getUnapprovedClassifications();
        
        // Use the new function that includes classification names
        let unapprovedInventoryItems = await invModel.getUnapprovedInventoryItemsWithClassification();
        
        let nav = await utilities.getNav(); 
        res.render("inventory/approve", {
            title: "Approve Inventory",
            nav,
            unapprovedClassifications, 
            unapprovedInventoryItems // Now includes classification names
        });
    } catch (error) {
        console.error("Error loading the approval view:", error);
        res.status(500).send("Error loading the page.");
    }
};


invCont.approveInventoryItem = async function(req, res) {
    const invId = req.params.inv_id;
    if (!invId) {
        console.log("No inventory item ID provided.");
        req.flash('error', 'Inventory item not found.');
        return res.redirect('/inv/approve');
    }

    console.log("Approving inventory item with ID:", invId);

    try {
        const itemData = await invModel.getInventoryById(invId);
        if (!itemData) {
            req.flash('error', 'Inventory item not found.');
            return res.redirect('/inv/approve');
        }

        await invModel.approveInventoryItemById(invId, req.accountData.account_id);

        req.flash('success', 'Inventory item approved successfully.');
        res.redirect('/inv/');
    } catch (error) {
        console.error("Error during inventory item approval:", error);
        req.flash('error', 'Failed to approve inventory item.');
        res.redirect('/inv/approve');
    }
};

invCont.approveClassification = async function(req, res) {
    const classificationId = req.params.classification_id;
    try {
        // Assuming invModel has a method called approveClassificationById that updates classification_approved to true
        await invModel.approveClassificationById(classificationId, req.accountData.account_id); // Log the admin's ID
        
        req.flash('success', 'Classification approved successfully.');
        res.redirect('/inv/approve'); // Redirect back to the approval page
    } catch (error) {
        console.error("Error approving classification:", error);
        req.flash('error', 'Failed to approve classification.');
        res.redirect('/inv/approve'); // Redirect back to the approval page with an error message
    }
};

invCont.approveClassification = async function(req, res) {
    const classificationId = req.params.classification_id; // Ensure this matches the route parameter
    try {
        await invModel.approveClassificationById(classificationId, req.accountData.account_id); // Assuming this function exists and works as intended
        req.flash('success', 'Classification approved successfully.');
        res.redirect('/account'); // Assuming you want to redirect here
    } catch (error) {
        console.error("Error approving classification:", error);
        req.flash('error', 'Failed to approve classification.');
        res.redirect('/inv/approve'); // Assuming you want to redirect back in case of failure
    }
};

invCont.addInventoryItem = async function(req, res) {
    try {
        // Extract data from request body
        const { make, model, year, description, image_path, thumbnail_path, price, miles, color, classification_id } = req.body;

        // Call your model function to add the inventory item
        await invModel.addInventoryItem({
            inv_make: make,
            inv_model: model,
            inv_year: year,
            inv_description: description,
            inv_image: image_path,
            inv_thumbnail: thumbnail_path,
            inv_price: price,
            inv_miles: miles,
            inv_color: color,
            classification_id
        });

        // Set a success message
        req.flash('success', 'Inventory item added successfully.');
        // Redirect to the account page
        res.redirect('/account');
    } catch (error) {
        console.error("Failed to add inventory item:", error);
        // Set an error message
        req.flash('error', 'Failed to add inventory item.');
        // Redirect back to the approval page (or wherever the form is located)
        res.redirect('/inv/approve');
    }
};
module.exports = invCont;
