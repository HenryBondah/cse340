const invModel = require("../models/inventory-model");

const Util = {};

/**
 * Constructs the nav HTML unordered list.
 */
Util.getNav = async function () {
    try {
        // Fetch classifications from the database.
        const result = await invModel.getClassifications();
        // Ensure that we're working with the array part of the result, assuming result.rows contains the array.
        const data = result.rows;

        let list = "<ul>";
        list += '<li><a href="/" title="Home page">Home</a></li>';

        // Iterate over the data array to build navigation items.
        data.forEach((row) => {
            list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
        });

        list += "</ul>";
        return list;
    } catch (error) {
        console.error("Error generating navigation:", error);
        // Return a fallback navigation item in case of error.
        return "<ul><li>Error loading navigation</li></ul>";
    }
};

/**
 * Build the classification view HTML.
 */
Util.buildClassificationGrid = async function(data){
    let grid = "";
    if(data && data.length > 0){
        grid = '<ul id="inv-display">';
        data.forEach(vehicle => { 
            grid += '<li>';
            grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
            grid += '<div class="namePrice">';
            grid += '<hr />';
            grid += `<h2><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
            grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`;
            grid += '</div>';
            grid += '</li>';
        });
        grid += '</ul>';
    } else { 
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
};

/**
 * Build the detail view HTML.
 */
Util.buildDetailGrid = function(data) {
    let grid = "";
    if(data && data.length > 0) {
        const vehicle = data[0]; 
        grid += '<div class="vehicle-detail">';
        grid += '<div class="vehicle-content">'; 
        grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />`;
        grid += '<div class="detail-text">'; 
        grid += `<p>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`;
        grid += `<p><strong>Mileage:</strong> ${vehicle.inv_miles} miles</p>`;
        grid += `<p><strong>Color:</strong> ${vehicle.inv_color}</p>`;
        grid += `<p>Description: ${vehicle.inv_description}</p>`;
        grid += '</div>'; 
        grid += '</div>';
        grid += '</div>'; 
    } else {
        grid = '<p class="notice">Sorry, vehicle details could not be found.</p>';
    }
    return grid;
};

/**
 * Middleware For Handling Errors - Wrap other function in this for General Error Handling.
 */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
