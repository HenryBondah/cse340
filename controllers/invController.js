
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require('express-validator'); // Import validationResult for handling form validations

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
            let nav = await utilities.getNav(); // Ensure navigation is still loaded
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
    let nav = await utilities.getNav(); // Fetch navigation links
    res.render("inventory/addClassification", {
        title: "Add New Classification",
        errors: [],
        formData: {},
        nav // Pass the navigation data to the view
    });
};


/* ***************************
 *  Add a Classification with Validation
 * ************************** */
invCont.addClassification = async function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('inventory/addClassification', {
            title: "Add New Classification",
            errors: errors.array(),
            formData: req.body
        });
    }
    try {
        await invModel.addClassification(req.body.classification_name);
        req.flash('success', 'Classification added successfully.');
        res.redirect('/inv/management');
    } catch (error) {
        console.error("Failed to add classification:", error);
        req.flash('error', 'Failed to add classification.');
        res.redirect('/inv/add-classification');
    }
};

/* ***************************
 *  Show Form for Adding an Inventory Item
 * ************************** */
invCont.showAddInventoryForm = async function(req, res) {
    try {
        const result = await invModel.getClassifications();
        const classifications = result.rows;
        let nav = await utilities.getNav(); // Fetch navigation links
        res.render("inventory/addInventory", {
            title: "Add Vihicle",
            classifications,
            nav // Pass the navigation data to the view
        });
    } catch (error) {
        console.error("Error loading add inventory form:", error);
        // Consider adding error handling here as well
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
        // Extract data from req.body with your specified fields
        const inventoryData = {
            inv_make: req.body.make,
            inv_model: req.body.model,
            classification_id: req.body.classification_id,
            inv_image: req.body.image_path,
            inv_thumbnail: req.body.thumbnail_path,
            inv_price: req.body.price,
            inv_description: req.body.description,
            inv_year: req.body.year,
            inv_miles: req.body.miles,
            inv_color: req.body.color
        };
        await invModel.addInventoryItem(inventoryData);
        req.flash('success', 'Inventory item added successfully.');
        res.redirect('/inv/management');
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
        let nav = await utilities.getNav();
        res.render("inventory/managementView", {
            title: "Vihicle Management",
            nav,
        });
    } catch (error) {
        console.error("Error loading management view:", error);
        res.status(500).send("Sorry, we appear to have lost that page.");
    }
};

module.exports = invCont;
