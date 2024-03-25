const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function accountLogin(req, res) {
  const { account_email, account_password } = req.body;

  try {
      const user = await accountModel.findUserByEmail(account_email);
      if (!user) {
          req.flash('error_msg', 'No account found with that email.');
          return res.redirect('/account/login');
      }
  } catch (error) {
      console.error(error);
      req.flash('error_msg', 'An error occurred during login.');
      return res.redirect('/account/login');
  }
}

// In account-model.js
async function getAccountById (accountId) {
  const query = 'SELECT * FROM account WHERE account_id = $1';
  const values = [accountId];
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
};

async function updateAccountDetails(accountId, firstname, lastname, email) {
  const query = 'UPDATE account SET account_firstname = $2, account_lastname = $3, account_email = $4 WHERE account_id = $1 RETURNING *';
  const values = [accountId, firstname, lastname, email];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; 
  } catch (err) {
    console.error('Error updating account details:', err);
    throw err; 
  }
}


async function updateAccountPassword(accountId, hashedPassword) {
  const query = 'UPDATE account SET account_password = $2 WHERE account_id = $1 RETURNING *';
  const values = [accountId, hashedPassword];
  try {
    const result = await pool.query(query, values);
    return result.rows[0]; 
  } catch (err) {
    console.error('Error updating account password:', err);
    throw err; 
  }
}


module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccountDetails, updateAccountPassword };
