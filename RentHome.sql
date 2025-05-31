-- Drop database if exists and create new one
DROP DATABASE IF EXISTS RentHome;
CREATE DATABASE RentHome;
USE RentHome;

-- Drop tables if they exist (in correct order)
DROP TABLE IF EXISTS estate_usage;
DROP TABLE IF EXISTS estate_equipments;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS estates;
DROP TABLE IF EXISTS users;

-- Create tables in correct order
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

-- Create other tables
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

-- Insert sample data
-- First, insert a user
INSERT INTO users (name, surname, phone, email, password) VALUES 
    ('Admin', 'User', '555-000-000', 'admin@example.com', 'admin123');

--Then insert estates
INSERT INTO estates (user_id, address, city, postal_code, people, max_person, area) VALUES 
    (2, 'ul. Długa 1', 'Poznań', '61-123', 2, 4, 65.5),
    (2, 'ul. Krótka 2', 'Poznań', '61-234', 1, 3, 48.0),
    (2, 'os. Kwiatowe 3', 'Poznań', '61-345', 3, 5, 82.0);

-- Insert tenants
INSERT INTO tenants (name, surname, phone) VALUES 
    ('Jan', 'Kowalski', '555-123-456'),
    ('Anna', 'Nowak', '555-234-567'),
    ('Piotr', 'Wiśniewski', '555-345-678');

Finally insert contracts
INSERT INTO contracts (contract_number, estate_id, tenant_id, rental_price, rent, charges) VALUES 
    ('202/3001/004', 1, 1, 2500.00, 12, 450.00),
    ('202/3002/005', 1, 2, 1800.00, 12, 350.00),
    ('201/3000/006', 1, 3, 3000.00, 12, 500.00);

-- Insert sample estate equipment
INSERT INTO estate_equipments (estate_id, estate_equipment, quantity, equipment_condition) VALUES 
    (1, 'Washing Machine', 1, 'Good'),
    (1, 'Refrigerator', 1, 'Excellent'),
    (1, 'Bed', 2, 'Good'),
    (2, 'Refrigerator', 1, 'Good'),
    (2, 'Microwave', 1, 'Fair'),
    (2, 'Bed', 1, 'Excellent'),
    (3, 'Washing Machine', 1, 'Excellent'),
    (3, 'Dishwasher', 1, 'Good'),
    (3, 'Bed', 3, 'Good');

-- Insert sample estate usage measurements
INSERT INTO estate_usage (estate_id, water_usage, electricity_usage, gas_usage, date_of_measure) VALUES 
    (1, 12.5, 150.2, 45.0, '2023-01-15'),
    (1, 14.2, 165.8, 50.2, '2023-02-15'),
    (2, 8.3, 120.5, 30.0, '2023-01-15'),
    (2, 9.1, 125.7, 32.5, '2023-02-15'),
    (3, 15.7, 180.3, 55.8, '2023-01-15'),
    (3, 16.9, 195.4, 60.2, '2023-02-15');
