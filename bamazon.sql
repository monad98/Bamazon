CREATE DATABASE `Bamazon`;
USE `Bamazon`;

CREATE TABLE `departments` (
  department_id INT(11) UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  over_head_costs FLOAT(10, 2) UNSIGNED DEFAULT 0,
  total_sales FLOAT(10, 2) UNSIGNED DEFAULT 0
);

INSERT INTO `departments` (`department_name`, `over_head_costs`) VALUES
("ELECTRONICS", 10000),
("TOYS & GAMES", 3000),
("SOFTWARE", 5000),
("HOME & KITCHEN", 40000),
("TOOLS & HOME IMPROVEMENT", 20000),
("HOUSEHOLD", 8000),
("COMPUTER", 12000),
("CELL PHONE", 32000),
("PRIME PANTRY", 17000);


CREATE TABLE `products` (
  `item_id` INT(11) UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `product_name` VARCHAR(100) NOT NULL,
  `department_id` INT(11) UNSIGNED NOT NULL,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`department_id`), 
  `price` FLOAT(10, 2) UNSIGNED DEFAULT 0,
  `stock_quantity` INT(11) UNSIGNED DEFAULT 0
);

ALTER TABLE `products` ADD `product_sales` FLOAT(10, 2) UNSIGNED DEFAULT 0; 


INSERT INTO `products` (product_name, department_id, price, stock_quantity) VALUES
("LOGITECH MX ANYWHERE 2", (SELECT department_id FROM departments WHERE department_name="ELECTRONICS"), 29.99, 1000),
("ANKER POWERCORE 20100", (SELECT department_id FROM departments WHERE department_name="ELECTRONICS"), 18.11, 1200),
("IPAD PRO 128GB", (SELECT department_id FROM departments WHERE department_name="ELECTRONICS"), 899.00, 800),
("Harman Kardon Onyx Bluetooth Speaker", (SELECT department_id FROM departments WHERE department_name="ELECTRONICS"), 129.00, 2100),
("AMAZON ECHO DOT", (SELECT department_id FROM departments WHERE department_name="ELECTRONICS"), 39.99, 5000),
("ZHPUAT Smart Light Alarm Clock with Dimmer", (SELECT department_id FROM departments WHERE department_name="TOYS & GAMES"), 13.99, 1000),
("TurboTax Deluxe 2016 Tax Software", (SELECT department_id FROM departments WHERE department_name="SOFTWARE"), 34.89, 900),
("Cuckoo CR-0631F Rice Cooker", (SELECT department_id FROM departments WHERE department_name="HOME & KITCHEN"), 109.99, 200),
("VonHaus Steel 4 Step Ladder", (SELECT department_id FROM departments WHERE department_name="TOOLS & HOME IMPROVEMENT"), 49.00, 700),
("Master Lock 653D 2-inch Padlock", (SELECT department_id FROM departments WHERE department_name="TOOLS & HOME IMPROVEMENT"), 13.26, 1100),
("AMAZON BASICS AAA BATTERY 20-PACK", (SELECT department_id FROM departments WHERE department_name="HOUSEHOLD"), 7.59, 0),
("DELL XPS 13 9350", (SELECT department_id FROM departments WHERE department_name="COMPUTER"), 1199.00, 12),
("IPHONE 6S 128GB", (SELECT department_id FROM departments WHERE department_name="CELL PHONE"), 949.99, 8),
("COCA COLA 36 COUNT, 12FL OZ", (SELECT department_id FROM departments WHERE department_name="PRIME PANTRY"), 10.99, 5);



