const invModel = require("../models/inventory-model");
const utilities = require("../utilities/")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {};

/**
 * Constructs the nav HTML unordered list.
 */
Util.getNav = async function () {
    try {
        const data = await invModel.getClassificationsWithApprovedItems();

        let list = "<ul>";
        list += '<li><a href="/" title="Home page">Home</a></li>';

        data.forEach((row) => {
            list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`;
        });

        list += "</ul>";
        return list;
    } catch (error) {
        console.error("Error generating navigation:", error);
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


Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
        classificationList += `<option value="${row.classification_id}"`;
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += " selected";
        }
        classificationList += `>${row.classification_name}</option>`; 
    });
    classificationList += "</select>";
    return classificationList;
}


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


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
     jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
       if (err) {
        req.flash("Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
       }
       res.locals.accountData = accountData
       res.locals.loggedin = 1
       next()
      })
    } else {
     next()
    }
   }
   

   /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
      next()
    } else {
      req.flash("notice", "Please log in.")
      return res.redirect("/account/login")
    }
   }

   /**
 * Middleware to check if the user has an Employee or Admin account type.
 * If not, redirect to the login page with an error message.
 */
Util.requireAdminOrEmployee = (req, res, next) => {
    if (res.locals.loggedin && (res.locals.accountData.account_type === 'Employee' || res.locals.accountData.account_type === 'Admin')) {
        next();
    } else {
        req.flash('error', 'You must be logged in as an Employee or Admin to access this page.');
        res.redirect('/account/login');
    }
};

module.exports = Util;
