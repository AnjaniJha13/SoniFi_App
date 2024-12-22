const express = require('express');
const mysql = require('mysql2');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'password', // Replace with your MySQL password
  database: 'sonifi_db', // Replace with your database name
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database.');
});

// Example WideCanvas API URL (Replace this with the actual WideCanvas.ai endpoint)
const WIDECANVAS_API_URL = 'https://api.widecanvas.ai/some-endpoint';

// API: Get User Details and Transactions
app.get('/api/user-details', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Fetch user data from MySQL
    const userQuery = `
      SELECT id, name, email, balance
      FROM users
      WHERE email = ?;
    `;
    const [userRows] = await db.promise().query(userQuery, [email]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userRows[0];

    // Fetch transaction history from MySQL
    const transactionQuery = `
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
    const [transactions] = await db.promise().query(transactionQuery, [email, email]);

    // Fetch data from WideCanvas API
    const wideCanvasResponse = await axios.post(
      WIDECANVAS_API_URL,
      { email },
      { headers: { Authorization: `Bearer YOUR_API_KEY` } } // Replace `YOUR_API_KEY` with your WideCanvas API Key
    );

    // Combine data from MySQL and WideCanvas
    const response = {
      user,
      transactions,
      wideCanvasData: wideCanvasResponse.data, // Include WideCanvas data
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
