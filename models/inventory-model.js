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
// Add a new classification to the database
async function addClassification(classificationName) {
  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classificationName]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

// Add a new inventory item to the database
// In inventory-model.js

async function addInventoryItem(inventoryData) {
  try {
    const result = await pool.query(
      `INSERT INTO public.inventory (
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        inventoryData.inv_make,
        inventoryData.inv_model,
        inventoryData.inv_year,
        inventoryData.inv_description,
        inventoryData.inv_image,
        inventoryData.inv_thumbnail,
        inventoryData.inv_price,
        inventoryData.inv_miles,
        inventoryData.inv_color,
        inventoryData.classification_id
      ]
    );
    return result.rows[0]; // Returns the added inventory item
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByDetailId, addClassification, addInventoryItem };
