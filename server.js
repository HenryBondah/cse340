/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const expressLayouts = require('express-ejs-layouts');
const env = require("dotenv").config();
const pool = require('./database/');
const utilities = require("./utilities/");
const flash = require('connect-flash'); 
const jwt = require('jsonwebtoken');


// Controllers
const baseController = require("./controllers/baseController");
const accountController = require('./controllers/accountController');

// Routes
const staticRoute = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoutes = require('./routes/accountRoute');

// App initialization
const app = express();

/* ***********************
 * Middleware
 ************************/
// Session configuration
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool: pool,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: 'auto' }
}));


// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.use((req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
          if (err) {
              console.log("JWT verification error:", err);
              next();
          } else {
              req.accountData = { account_id: decodedToken.account_id };
              next();
          }
      });
  } else {
      console.log("No JWT found");
      next();
  }
});
// Express Messages Middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// View Engine and Templates
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./layouts/layout"); 

app.use(utilities.checkJWTToken)

/* ***********************
 * Routes
 *************************/
// Static files
app.use(express.static('public'));

// Index route
app.get("/", baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes
app.use("/account", accountRoutes);


// Inventory add route
app.post('/inv/add-inventory', async (req, res) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
  try {
    const newCar = await pool.query(
      `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]
    );
    res.redirect('/inventory'); 
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Add inventory form route
app.get('/inv/add', async (req, res) => {
  try {
    const classificationResults = await pool.query(`SELECT * FROM classifications`);
    res.render('addInventory', {
      title: 'Add New Car Inventory',
      classifications: classificationResults.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get('/account', (req, res) => {
  res.render('account/account', {
    title: 'Manage',
    errors: req.flash('errors')
  });
});



app.get('/account', async (req, res) => {
  try {
    res.render('account/account', {
      title: 'Account Management', 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).render('account/account', {
      title: 'Error',
    });
  }
});


app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message = err.status == 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?';
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Server Operation Confirmation
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});