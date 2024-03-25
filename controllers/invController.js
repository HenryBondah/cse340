const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require('express-validator'); 

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
    try {
        await invModel.addClassification(req.body.classification_name);
        req.flash('success', 'Classification added successfully.');
        console.log("try executed")
        const nav = await utilities.getNav()
        res.render("inventory/managementView", {
            title: "Vihicle Management",
            nav,
        });
    } catch (error) {
        console.log("catch executed")
        console.error("Failed to add classification:", error);
        req.flash('error', 'Failed to add classification.');
        res.redirect('/inventory/managementView');
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

        let classificationsResult = await invModel.getClassifications();
        let classifications = classificationsResult.rows;

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
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
      return res.json(invData)
    } else {
      next(new Error("No data returned"))
    }
  }
  
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

module.exports = invCont;
