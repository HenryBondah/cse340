const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// In inventory-model.js

// Assuming the detail_id corresponds to a unique identifier for an inventory item
async function getInventoryByDetailId(detail_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [detail_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Error fetching inventory detail: ", error);
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByDetailId };


