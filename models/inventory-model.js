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
      WHERE i.classification_id = $1 AND i.inv_approved = true`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    throw error; 
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

// In models/inventory-model.js
async function checkClassificationExistence(classificationName) {
  const result = await pool.query(
      "SELECT * FROM classification WHERE classification_name = $1",
      [classificationName]
  );
  return result.rows.length > 0; 
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
    return result.rows[0]; 
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error; 
  }
}

async function getInventoryById(inv_id) {
  const query = `SELECT * FROM inventory WHERE inv_id = $1`;
  try {
      const result = await pool.query(query, [inv_id]);
      return result.rows[0]; 
  } catch (error) {
      console.error("Error fetching inventory by ID:", error);
      throw error;
  }
}


async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    throw error; 
  }
}

async function deleteInventoryItem(inv_id) {
  try {
      const sql = 'DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *';
      const result = await pool.query(sql, [inv_id]);
      return result.rowCount > 0; 
  } catch (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
  }
}

async function getUnapprovedClassifications() {
  const query = "SELECT * FROM classification WHERE classification_approved = false";
  try {
      const result = await pool.query(query);
      return result.rows;
  } catch (err) {
      console.error(err);
      throw err;
  }
}
async function getUnapprovedInventoryItems() {
  const query = "SELECT * FROM inventory WHERE inv_approved = false";
  try {
      const result = await pool.query(query);
      return result.rows;
  } catch (err) {
      console.error(err);
      throw err;
  }
}

// async function getClassificationsWithApprovedItems() {
//   const query = `
//       SELECT DISTINCT c.classification_id, c.classification_name 
//       FROM classification c
//       INNER JOIN inventory i ON c.classification_id = i.classification_id 
//       WHERE c.classification_approved = true AND i.inv_approved = true
//       ORDER BY c.classification_name`;
//   try {
//       const result = await pool.query(query);
//       return result.rows;
//   } catch (err) {
//       console.error("Error fetching classifications with approved items: ", err);
//       throw err;
//   }
// }

async function getClassificationsWithApprovedItems() {
  const query = `
      SELECT DISTINCT c.classification_id, c.classification_name 
      FROM classification c
      INNER JOIN inventory i ON c.classification_id = i.classification_id 
      WHERE c.classification_approved = true AND i.inv_approved = true
      ORDER BY c.classification_name`;
  try {
      const result = await pool.query(query);
      return result.rows;
  } catch (err) {
      console.error("Error fetching classifications with approved items: ", err);
      throw err;
  }
}



async function getUnapprovedInventoryItemsWithClassification() {
  const query = `
      SELECT i.*, c.classification_name 
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id 
      WHERE i.inv_approved = false
      ORDER BY c.classification_name, i.inv_make, i.inv_model`;
  try {
      const result = await pool.query(query);
      return result.rows;
  } catch (err) {
      console.error("Error fetching unapproved inventory items with classification: ", err);
      throw err;
  }
}

async function approveInventoryItemById(invId, accountId) {
  const query = `
      UPDATE inventory
      SET inv_approved = true, account_id = $2, in_approved_date = NOW()
      WHERE inv_id = $1
      RETURNING *`;
  try {
      const result = await pool.query(query, [invId, accountId]);
      return result.rows[0]; 
  } catch (err) {
      console.error("Error approving inventory item by ID:", err);
      throw err;
  }
}

async function approveClassificationById(classificationId, accountId) {
  const query = `
      UPDATE classification 
      SET classification_approved = TRUE, 
          account_id = $2, 
          classification_approval_date = NOW()
      WHERE classification_id = $1
      RETURNING *;`;

  try {
      const res = await pool.query(query, [classificationId, accountId]);
      return res.rows[0];
  } catch (err) {
      console.error("Error approving classification by ID:", err);
      throw err;
  }
}
async function approveInventoryItem (req, res) {
};

async function getApprovedClassifications() {
  try {
      const result = await pool.query("SELECT * FROM classification WHERE is_approved = TRUE ORDER BY classification_name");
      return result.rows;
  } catch (error) {
      console.error("Error fetching approved classifications:", error);
      throw error;
  }
}


module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByDetailId, 
  addClassification, addInventoryItem, getInventoryById, updateInventory, deleteInventoryItem, 
  getClassificationsWithApprovedItems, getUnapprovedInventoryItems, getUnapprovedClassifications, 
  getUnapprovedInventoryItemsWithClassification, approveInventoryItemById, approveClassificationById, 
  checkClassificationExistence, getApprovedClassifications, approveInventoryItem };
