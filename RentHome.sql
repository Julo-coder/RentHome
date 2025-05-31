DROP DATABASE IF EXISTS RentHome;
CREATE DATABASE RentHome;
USE RentHome;

DROP TABLE IF EXISTS estate_usage;
DROP TABLE IF EXISTS estate_equipments;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS estates;
DROP TABLE IF EXISTS users;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS estates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address VARCHAR(80) NOT NULL,
    city VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    people INT NOT NULL,
    max_person INT NOT NULL,
    area DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL
);

CREATE TABLE IF NOT EXISTS contracts (
    contract_number VARCHAR(20) PRIMARY KEY,
    estate_id INT NOT NULL,
    tenant_id INT NOT NULL,
    rental_price DECIMAL(10, 2) NOT NULL,
    rent INT NOT NULL,
    charges DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (estate_id) REFERENCES estates(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);


CREATE TABLE IF NOT EXISTS estate_equipments (
    estate_id INT NOT NULL,
    estate_equipment VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    equipment_condition VARCHAR(20) NOT NULL,
    FOREIGN KEY (estate_id) REFERENCES estates(id)
);

CREATE TABLE IF NOT EXISTS estate_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estate_id INT NOT NULL,
    water_usage DECIMAL(10, 2) NOT NULL,
    electricity_usage DECIMAL(10, 2) NOT NULL,
    gas_usage DECIMAL(10, 2) NOT NULL,
    date_of_measure DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estate_id) REFERENCES estates(id)
);