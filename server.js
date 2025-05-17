//Must have dependecies to make API and MySQL connection
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const saltRounds = 10;

//Create app 
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Your React app's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

//Mozliwosc podloczenia wiekszej ilosci ludzi na raz

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
        return res.status(200).json({ 
            message: "Login successful", 
            user 
        });
    } catch (err) {
        return res.status(500).json({ error: "Database or authentication error" });
    }
});

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

app.get('/estates/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const [rows] = await db.promise().query('SELECT * FROM estates WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Database query failed' });
    }
});

app.listen(8081, ()=>{
    console.log("listening")
})