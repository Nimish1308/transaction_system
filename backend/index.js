// Require Modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const PORT = 5000;
const app = express();

// Middleware setup
app.use(express.json());
app.use(cors({
    origin: 'https://transaction-system-frontend.vercel.app', // Frontend URL for CORS
    credentials: true
}));

// Root route - optional
app.get('/', (req, res) => {
    res.send('Welcome to the Backend API');
});

// API route to fetch products
app.get('/backend/products', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        res.json(response.data); // Send the data to the client
    } catch (error) {
        console.error('Error fetching data from S3:', error.message);
        res.status(500).json({ error: 'Failed to fetch data from Server' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at port no: ${PORT}`);
});
