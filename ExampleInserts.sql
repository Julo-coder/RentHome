USE RentHome;

-- Then insert tenants
INSERT INTO tenants (name, surname, phone) VALUES 
    ('Jan', 'Kowalski', '555-123-456'),
    ('Anna', 'Nowak', '555-234-567'),
    ('Piotr', 'Wiśniewski', '555-345-678');

-- Then insert estates (now user_id=1 exists)
INSERT INTO estates (user_id, address, city, postal_code, people, max_person, area) VALUES 
    (1, 'ul. Długa 1', 'Poznań', '61-123', 2, 4, 65.5),
    (1, 'ul. Krótka 2', 'Poznań', '61-234', 1, 3, 48.0),
    (1, 'os. Kwiatowe 3', 'Poznań', '61-345', 3, 5, 82.0);

-- Now you can reference both estates and tenants
INSERT INTO contracts (contract_number, estate_id, tenant_id, rental_price, rent, charges) VALUES 
    ('202/3001/004', 1, 1, 2500.00, 12, 450.00),
    ('202/3002/005', 1, 2, 1800.00, 12, 350.00),
    ('201/3000/006', 1, 3, 3000.00, 12, 500.00);

-- Other inserts can remain in the same order
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


INSERT INTO estate_usage (estate_id, water_usage, electricity_usage, gas_usage, date_of_measure) VALUES 
    (1, 12.5, 150.2, 45.0, '2023-01-15'),
    (1, 14.2, 165.8, 50.2, '2023-02-15'),
    (2, 8.3, 120.5, 30.0, '2023-01-15'),
    (2, 9.1, 125.7, 32.5, '2023-02-15'),
    (3, 15.7, 180.3, 55.8, '2023-01-15'),
    (3, 16.9, 195.4, 60.2, '2023-02-15');