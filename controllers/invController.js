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
  const detail_id = req.params.detailId
  console.log("detail_id: ", detail_id)

  const data = await invModel.getInventoryByDetailId(detail_id)
  console.log("detailData: ", data)
  
  const grid = await utilities.buildDetailGrid(data)
  let nav = await utilities.getNav()

  const detailId = data[0].detail_id
  res.render("./inventory/detail", {
    title: detailId + " vehicles",
    nav,
    grid,
  })
}

module.exports = invCont
