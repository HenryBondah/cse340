--Q1
INSERT INTO account (account_firstname, account_lastname, account_email, account_password) 
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

--Q2
UPDATE account 
SET account_type = 'Admin' 
WHERE account_id = 1;

--Q3
DELETE FROM account 
WHERE account_id = 1;

--Q4
UPDATE inventory 
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior') 
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

--Q5
SELECT inv_make, inv_model, c.classification_name 
FROM inventory i 
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

--6
UPDATE inventory 
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'), 
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');