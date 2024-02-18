const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  console.log ("classification_id: ", classification_id)
  const data = await invModel.getInventoryByClassificationId(classification_id)
  console.log ("data: ", data)
  
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}



/* ***************************
 *  Build DETAIL by classification view
 * ************************** */
invCont.buildByDetailId = async function (req, res, next) {
  const detail_id = req.params.detailId;
  console.log("detail_id: ", detail_id);

  const data = await invModel.getInventoryByDetailId(detail_id);
  console.log("detailData: ", data);

  if (data && data.length > 0) {
    const grid = await utilities.buildDetailGrid(data);
    let nav = await utilities.getNav();

    const detailId = data[0].detail_id;
    res.render("./inventory/detail", {
      title: data[0].inv_make + ' ' + data[0].inv_model + " Details", // Adjusted to use vehicle make and model as title
      nav,
      grid,
    });
  } else {
    // Handle the case where no data is returned or an empty array is returned
    let nav = await utilities.getNav(); // Ensure navigation is still loaded
    res.render("./inventory/detail", {
      title: "Vehicle Not Found",
      nav,
      grid: "<p>Vehicle details could not be found.</p>",
    });
  }
};

module.exports = invCont
