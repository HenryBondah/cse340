const utilities = require("../utilities/index");
const {
  registerAccount: registerAccountModel,
  checkExistingEmail,
} = require("../models/account-model");
const accountModel = require("../models/account-model");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
  let nav = await utilities.getNav();
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
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "error",
      "Sorry, there was an error processing the registration."
    );
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
    hashedPassword 
  );
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, ${account_firstname}, you're registered. Please log in.`
    );
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
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
      req.flash("error", "Incorrect email or password.");
      return res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: [{msg: "Incorrect email or password."}], 
          account_email,
      });
  }
  try {
      const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
      if (!passwordMatch) {
          req.flash("error", "Incorrect email or password.");
          return res.status(400).render("account/login", {
              title: "Login",
              nav,
              errors: [{msg: "Incorrect email or password."}], 
              account_email,
          });
      }
      delete accountData.account_password; 
      const accessToken = jwt.sign(
          accountData,
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: 3600 * 1000 }
      );
      const cookieOptions = process.env.NODE_ENV === "development" ? 
                            { httpOnly: true, maxAge: 3600 * 1000 } : 
                            { httpOnly: true, secure: true, maxAge: 3600 * 1000 };
      res.cookie("jwt", accessToken, cookieOptions);
      return res.redirect("/account/");
  } catch (error) {
      console.error("Login error:", error);
      req.flash("error", "Server error during login.");
      return res.status(500).render("account/login", {
          title: "Login",
          nav,
          errors: [{msg: "Server error during login."}],
          account_email,
      });
  }
}



async function buildAccount(req, res, next) {
  const nav = await utilities.getNav();
  const errors = validationResult(req);

  let name = "";
  if (res.locals.accountData) {
    name = res.locals.accountData.account_firstname;
  } else {
    req.flash("error", "Please log in to view this page.");
    return res.redirect("/account/login");
  }

  
  res.render("account/account", {
    title: "Account Management",
    errors: errors.array(), 
    nav,
    name: name
  });

}

async function displayUpdateAccountForm(req, res) {
  let nav = await utilities.getNav(); 
  const accountId = req.params.account_id; 
  const accountData = await accountModel.getAccountById(accountId);
  if (!accountData) {
    req.flash("error", "Account not found.");
    return res.redirect("/account"); 
  }
  const { account_firstname, account_lastname, account_email, account_id } = accountData;
  res.render("account/update", {
    title: "Update Account Information",
    nav,
    account_firstname,
    account_lastname,
    account_email,
    account_id 
  });
}

async function processAccountUpdate(req, res) {
  const { account_id, firstname, lastname, email } = req.body;
  try {
    const updatedAccount = await accountModel.updateAccountDetails(account_id, firstname, lastname, email);
    if (updatedAccount) {
      const fullAccountDetails = await accountModel.getAccountById(account_id);
      
      if (!fullAccountDetails) {
        throw new Error('Failed to retrieve updated account details.');
      }
      const userForToken = {
        account_id: fullAccountDetails.account_id,
        account_firstname: firstname, 
        account_lastname: lastname,
        account_email: email,
        account_type: fullAccountDetails.account_type, 
      };
      const accessToken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      if (process.env.NODE_ENV === 'development') {
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      req.flash("success", "Account updated successfully.");
      res.redirect("/account/"); 
    }
  } catch (error) {
    console.error("updateinfo err", error);
    req.flash("error", "Failed to update account.");
    res.redirect("/account/updateAccount"); 
  }
}

async function processPasswordChange(req, res) {
  const { account_id, newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await accountModel.updateAccountPassword(account_id, hashedPassword);
    req.flash("success", "Password changed successfully.");
    res.redirect("/account/");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to change password.");
    res.redirect("/account/updateAccount"); 
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  buildAccount,
  displayUpdateAccountForm,
  processAccountUpdate,
  processPasswordChange,
  accountLogin, 
};
