//Must have dependecies to make API and MySQL connection
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');

const saltRounds = 10;

//Create app 
const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));;
app.use(express.json());

//sesja
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

//odswiezenie i cofniecie strony - sprawdzanie sesji
app.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }
    res.json(req.session.user);
});

//wylogowanie
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.status(200).json({ message: "Logged out successfully" });
    });
});
// koniec endpointow dla sesji

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "zaq1@WSX",
    database: "RentHome",
    waitForConnections: true,
    connectionLimit: 100,
});

(async () => {
    try {
        const connection = await db.promise().getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
})();
//logowanie
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const [results] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Usuń hasło przed wysłaniem danych użytkownika
        delete user.password;
        req.session.user = user;
        return res.status(200).json({
            message: "Login successful",
            user
        });
    } catch (err) {
        return res.status(500).json({ error: "Database or authentication error" });
    }
});
//rejestracja
app.post('/register', async (req, res) => {
    console.log('Received registration request:', req.body);

    const { name, surname, phone, email, password } = req.body;

    if (!name || !surname || !phone || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (result.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const values = [name, surname, phone, email, hashedPassword];
        console.log('Attempting to insert user with values:', { ...values, password: '[HIDDEN]' });

        const [data] = await db.promise().query(
            "INSERT INTO users (name, surname, phone, email, password) VALUES (?, ?, ?, ?, ?)", values
        );
        console.log('User inserted successfully:', data);
        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({
            message: "Error creating user",
            details: err.sqlMessage || err.message
        });
    }
});

//pobranie danych mieszkania
app.get('/estates', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM estates WHERE user_id = ? ORDER BY id DESC',
            [req.session.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error fetching estates' });
    }
});

// dodawanie mieszkania
app.post('/estates', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user_id = req.session.user.id;
    const { address, city, postal_code, people, max_person, area } = req.body;

    if (!address || !city || !postal_code || !people || !max_person || !area) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const [result] = await db.promise().query(
            "INSERT INTO estates (user_id, address, city, postal_code, people, max_person, area) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user_id, address, city, postal_code, people, max_person, area]  
        );
        res.status(201).json({ message: "Estate added successfully", estateId: result.insertId });
    } catch (err) {
        console.error('Error adding estate:', err); // Added error logging
        res.status(500).json({ message: "Error adding estate", details: err.message });
    }
});

// Add this new endpoint for fetching estate usage
app.get('/estate-usage/:estateId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT eu.*, e.address 
             FROM estate_usage eu 
             JOIN estates e ON eu.estate_id = e.id 
             WHERE eu.estate_id = ? AND e.user_id = ? 
             ORDER BY eu.date_of_measure DESC, eu.created_at DESC 
             LIMIT 1`,
            [req.params.estateId, req.session.user.id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Usage data not found" });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error fetching estate usage' });
    }
});

//wyswietlanie wszystkich nieruchomosci
app.get('/estates/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    try {
        const [rows] = await db.promise().query(
            'SELECT * FROM estates WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Estate not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error fetching estate details' });
    }
});

// Pobranie szczegółów mieszkania do edycji
app.get('/estates/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user_id = req.session.user.id;
    const estate_id = req.params.id;

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM estates WHERE id = ? AND user_id = ?",
            [estate_id, user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Estate not found or unauthorized access." });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching estate:', err);
        res.status(500).json({ message: "Error fetching estate data", details: err.message });
    }
});

//Edytowanie danych mieszkania
app.put('/estates/edit/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user_id = req.session.user.id;
    const estate_id = req.params.id;
    const { address, city, postal_code, people, max_person, area } = req.body;

    if (!address || !city || !postal_code || !people || !max_person || !area) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await db.promise().query(
            "UPDATE estates SET address = ?, city = ?, postal_code = ?, people = ?, max_person = ?, area = ? WHERE id = ? AND user_id = ?",
            [address, city, postal_code, people, max_person, area, estate_id, user_id]
        );

        const [updatedEstate] = await db.promise().query(
            "SELECT * FROM estates WHERE id = ? AND user_id = ?",
            [estate_id, user_id]
        );

        res.status(200).json(updatedEstate[0]); // Zwracamy nowe dane
    } catch (err) {
        console.error('Error updating estate:', err);
        res.status(500).json({ message: "Error updating estate", details: err.message });
    }
});

//dodawania zużycia
app.post('/estate-usage', async (req, res) => {
    console.log('Received data:', req.body);
    
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { estate_id, water_usage, electricity_usage, gas_usage, date_of_measure } = req.body;

    try {
        const [estate] = await db.promise().query(
            "SELECT id FROM estates WHERE id = ? AND user_id = ?",
            [estate_id, req.session.user.id]
        );

        if (estate.length === 0) {
            return res.status(403).json({ message: "Estate not found or unauthorized access" });
        }

        await db.promise().query(
            "INSERT INTO estate_usage (estate_id, water_usage, electricity_usage, gas_usage, date_of_measure) VALUES (?, ?, ?, ?, ?)",
            [estate_id, parseFloat(water_usage), parseFloat(electricity_usage), parseFloat(gas_usage), date_of_measure]
        );

        res.status(201).json({ message: "Usage data added successfully" });
    } catch (err) {
        console.error('Error adding usage data:', err);
        res.status(500).json({ 
            message: "Error adding usage data", 
            details: err.message 
        });
    }
});

// Add this new endpoint for usage history
app.get('/estate-usage/:id/history', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT eu.water_usage, eu.electricity_usage, eu.gas_usage, eu.date_of_measure 
             FROM estate_usage eu 
             JOIN estates e ON eu.estate_id = e.id 
             WHERE eu.estate_id = ? AND e.user_id = ? 
             ORDER BY eu.date_of_measure ASC`,
            [req.params.id, req.session.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No historical data found" });
        }

        res.json(rows);
    } catch (err) {
        console.error('Error fetching usage history:', err);
        res.status(500).json({ message: "Error fetching usage history" });
    }
});

// Add this endpoint after your other endpoints
app.post('/estate-equipment', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { estate_id, estate_equipment, quantity, equipment_condition } = req.body;

    try {
        const [estate] = await db.promise().query(
            "SELECT id FROM estates WHERE id = ? AND user_id = ?",
            [estate_id, req.session.user.id]
        );

        if (estate.length === 0) {
            return res.status(403).json({ message: "Estate not found or unauthorized access" });
        }

        await db.promise().query(
            "INSERT INTO estate_equipments (estate_id, estate_equipment, quantity, equipment_condition) VALUES (?, ?, ?, ?)",
            [estate_id, estate_equipment, quantity, equipment_condition]
        );

        res.status(201).json({ message: "Equipment added successfully" });
    } catch (err) {
        console.error('Error adding equipment:', err);
        res.status(500).json({ 
            message: "Error adding equipment", 
            details: err.message 
        });
    }
});

// New endpoint for fetching equipment by estate ID
app.get('/estate-equipment/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT ee.* 
             FROM estate_equipments ee 
             JOIN estates e ON ee.estate_id = e.id 
             WHERE ee.estate_id = ? AND e.user_id = ?`,
            [req.params.id, req.session.user.id]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching equipment:', err);
        res.status(500).json({ message: "Error fetching equipment" });
    }
});

// Add this before app.listen(8081...)

app.get('/user/stats/:userId', async (req, res) => {
    if (!req.session.user || req.session.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Get total estates and average area
        const [estatesQuery] = await db.promise().query(
            `SELECT 
                COUNT(*) as total,
                SUM(people) as totalTenants,
                AVG(area) as averageArea,
                AVG((people / max_person) * 100) as occupancyRate
             FROM estates 
             WHERE user_id = ?`,
            [req.params.userId]
        );

        // Get contracts and financial information
        const [contractsQuery] = await db.promise().query(
            `SELECT 
                COUNT(*) as total,
                SUM(rental_price) as monthlyIncome,
                AVG(rental_price) as averageRent,
                SUM(charges) as monthlyCharges
             FROM contracts c
             JOIN estates e ON c.estate_id = e.id
             WHERE e.user_id = ?`,
            [req.params.userId]
        );

        // Get average utility usage
        const [usageQuery] = await db.promise().query(
            `SELECT 
                AVG(eu.water_usage) as avgWater,
                AVG(eu.electricity_usage) as avgElectricity,
                AVG(eu.gas_usage) as avgGas
             FROM estate_usage eu
             JOIN estates e ON eu.estate_id = e.id
             WHERE e.user_id = ?
             GROUP BY e.user_id`,
            [req.params.userId]
        );

        // Combine and format the data
        const stats = {
            estates: {
                total: estatesQuery[0].total || 0,
                totalTenants: estatesQuery[0].totalTenants || 0,
                averageArea: Math.round(estatesQuery[0].averageArea || 0),
                occupancyRate: Math.round(estatesQuery[0].occupancyRate || 0)
            },
            contracts: {
                total: contractsQuery[0].total || 0,
                monthlyIncome: Math.round(contractsQuery[0].monthlyIncome || 0),
                averageRent: Math.round(contractsQuery[0].averageRent || 0),
                monthlyCharges: Math.round(contractsQuery[0].monthlyCharges || 0)
            },
            usage: {
                avgWater: Math.round(usageQuery[0]?.avgWater || 0),
                avgElectricity: Math.round(usageQuery[0]?.avgElectricity || 0),
                avgGas: Math.round(usageQuery[0]?.avgGas || 0)
            }
        };

        res.json(stats);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ 
            message: "Error fetching statistics",
            details: err.message 
        });
    }
});

// Add these endpoints before app.listen(8081...)

// Get all tenants
app.get('/tenants', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM tenants"
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching tenants:', err);
        res.status(500).json({ message: "Error fetching tenants" });
    }
});

// Get estates for specific user
app.get('/estates/user/:userId', async (req, res) => {
    if (!req.session.user || req.session.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM estates WHERE user_id = ?",
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching estates:', err);
        res.status(500).json({ message: "Error fetching estates" });
    }
});

// Create new contract
app.post('/contracts', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { estate_id, tenant_id, rental_price, charges, rent, contract_number } = req.body;

    try {
        // First verify that the estate belongs to the logged-in user
        const [estate] = await db.promise().query(
            "SELECT id FROM estates WHERE id = ? AND user_id = ?",
            [estate_id, req.session.user.id]
        );

        if (estate.length === 0) {
            return res.status(403).json({ message: "Estate not found or unauthorized access" });
        }

        // Check if contract number already exists
        const [existingContract] = await db.promise().query(
            "SELECT contract_number FROM contracts WHERE contract_number = ?",
            [contract_number]
        );

        if (existingContract.length > 0) {
            return res.status(400).json({ message: "Contract number already exists" });
        }

        // Insert the contract with provided contract number
        await db.promise().query(
            `INSERT INTO contracts 
            (contract_number, estate_id, tenant_id, rental_price, charges, rent) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [contract_number, estate_id, tenant_id, rental_price, charges, rent]
        );

        // Update estate occupancy
        await db.promise().query(
            "UPDATE estates SET people = people + 1 WHERE id = ?",
            [estate_id]
        );

        res.status(201).json({ 
            message: "Contract created successfully",
            contract_number: contract_number
        });
    } catch (err) {
        console.error('Error creating contract:', err);
        res.status(500).json({ 
            message: "Error creating contract",
            details: err.message 
        });
    }
});

// Get contracts for a specific estate
app.get('/contracts/estate/:estateId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [rows] = await db.promise().query(
            `SELECT c.*, t.name, t.surname, t.phone 
             FROM contracts c
             JOIN tenants t ON c.tenant_id = t.id
             JOIN estates e ON c.estate_id = e.id
             WHERE c.estate_id = ? AND e.user_id = ?
             ORDER BY c.contract_number DESC`,
            [req.params.estateId, req.session.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching estate contracts:', err);
        res.status(500).json({ message: "Error fetching contracts" });
    }
});

app.get('/contracts/user/:userId', async (req, res) => {
    if (!req.session.user || req.session.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const [contracts] = await db.promise().query(
            `SELECT 
                c.contract_number,
                c.rental_price,
                c.charges,
                c.rent,
                e.address,
                t.name as tenant_name,
                t.surname as tenant_surname,
                t.phone as tenant_phone
             FROM contracts c
             JOIN estates e ON c.estate_id = e.id
             JOIN tenants t ON c.tenant_id = t.id
             WHERE e.user_id = ?
             ORDER BY c.contract_number DESC`,
            [req.params.userId]
        );

        res.json(contracts);
    } catch (err) {
        console.error('Error fetching user contracts:', err);
        res.status(500).json({ message: "Error fetching contracts" });
    }
});

// Delete a contract by contract number
app.delete('/contracts/:contractNumber', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const contractNumber = req.params.contractNumber;
    
    try {
        // First verify that the contract belongs to the user's estate
        const [contractCheck] = await db.promise().query(
            `SELECT c.* FROM contracts c
            JOIN estates e ON c.estate_id = e.id
            WHERE c.contract_number = ? AND e.user_id = ?`,
            [contractNumber, req.session.user.id]
        );
        
        if (contractCheck.length === 0) {
            return res.status(404).json({ message: "Contract not found or you don't have permission" });
        }
        
        // If verified, delete the contract
        const [result] = await db.promise().query(
            'DELETE FROM contracts WHERE contract_number = ?',
            [contractNumber]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Contract not found" });
        }
        
        res.json({ message: "Contract deleted successfully" });
    } catch (err) {
        console.error('Error deleting contract:', err);
        res.status(500).json({ message: "Error deleting contract" });
    }
});

app.delete('/estates/:id', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user_id = req.session.user.id;
    const estate_id = req.params.id;

    try {
        // Sprawdź, czy nieruchomość należy do zalogowanego użytkownika
        const [estate] = await db.promise().query(
            "SELECT * FROM estates WHERE id = ? AND user_id = ?",
            [estate_id, user_id]
        );

        if (estate.length === 0) {
            return res.status(404).json({ message: "Estate not found or unauthorized access" });
        }

        // Rozpocznij transakcję
        const connection = await db.promise().getConnection();
        await connection.beginTransaction();

        try {
            // Najpierw usuń powiązane kontrakty
            await connection.query(
                `DELETE FROM contracts WHERE estate_id = ?`,
                [estate_id]
            );

            // Usuń powiązane wyposażenie
            await connection.query(
                "DELETE FROM estate_equipments WHERE estate_id = ?",
                [estate_id]
            );

            // Usuń powiązane zużycia mediów
            await connection.query(
                "DELETE FROM estate_usage WHERE estate_id = ?",
                [estate_id]
            );

            // Na końcu usuń samą nieruchomość
            await connection.query(
                "DELETE FROM estates WHERE id = ? AND user_id = ?",
                [estate_id, user_id]
            );

            await connection.commit();
            res.json({ message: "Estate deleted successfully" });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error deleting estate:', err);
        res.status(500).json({ message: "Error deleting estate", details: err.message });
    }
});

app.listen(8081, () => {
    console.log("listening")
});
