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

app.listen(8081, () => {
    console.log("listening")
});
