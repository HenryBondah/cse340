
const utilities = require('../utilities/index');
const { registerAccount: registerAccountModel, checkExistingEmail } = require('../models/account-model');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    });
}

/* ****************************************
*  Register Account
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
        req.flash("error", 'Sorry, there was an error processing the registration.');
        return res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }

    const regResult = await registerAccountModel(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword // Use hashed password here
    );

    if (regResult) {
        req.flash("notice", `Congratulations, ${account_firstname}, you're registered. Please log in.`);
        res.redirect("/account/login"); 
    } else {
        req.flash("error", "Sorry, the registration failed.");
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        });
    }
}

/* ****************************************
*  Login Account
* *************************************** */
async function loginAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;

    try {
        const user = await checkExistingEmail(account_email);
        if (user && user.rowCount > 0) {
            const isValid = await bcrypt.compare(account_password, user.rows[0].account_password);
            if (isValid) {
                req.flash("notice", `Congratulations, you're logged in.`);
                res.redirect("/"); 
            } else {
                req.flash("error", "Invalid login credentials.");
                res.redirect("/account/login");
            }
        } else {
            req.flash("error", "Account not found.");
            res.redirect("/account/login");
        }
    } catch (error) {
        req.flash("error", 'There was an error processing your login.');
        res.redirect("/account/login");
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount };
