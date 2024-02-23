const utilities = require('../utilities/index');

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav // Assume this is for navigation purposes
  });
}





/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    const messages= {error: ""}
    res.render("account/register", {
      title: "Register",
      nav,
      messages
    });
  }
  
  module.exports = { buildLogin, buildRegister }