const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'password', // Replace with your MySQL password
  database: 'sonifi_db', // Replace with your database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// API: Get transaction history
app.get('/api/transactions', (req, res) => {
  const userEmail = req.query.email; // Email from query parameter

  const query = `
    SELECT 
      t.id AS transaction_id,
      u1.name AS sender_name,
      u2.name AS receiver_name,
      t.amount,
      t.transaction_date
    FROM 
      transactions t
    JOIN users u1 ON t.sender_id = u1.id
    JOIN users u2 ON t.receiver_id = u2.id
    WHERE 
      u1.email = ? OR u2.email = ?
    ORDER BY t.transaction_date DESC;
  `;

  db.query(query, [userEmail, userEmail], (err, results) => {
    if (err) {
      console.error('Error fetching transaction history:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
