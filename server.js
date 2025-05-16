//Must have dependecies to make API and MySQL connection
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');



//Create app 
const app = express();
app.use(cors());
app.use(express.json());


//Connection to MySQL DB and select database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "zaq1@WSX",
    database: "RentHome"
});


app.get('/', (req, res) => {
    return res.json("From backend side");
});

//Get all spices from database
app.get('/spices', (req, res) => {
    const sql= "select * from spices";
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
        return res.json(data);
    })
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    const values = [req.body.email, req.body.password];

    db.query(sql, values, (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) {
            const user = data[0];
            // Don't send password back to client
            delete user.password;
            return res.status(200).json({ message: "Login successful", user });
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    });
});

app.listen(8081, ()=>{
    console.log("listening")
})