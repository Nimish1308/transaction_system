//Require Modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios=require('axios');
const PORT = 5000;
const app = express();

app.use(express.json());
app.use(cors(
    {
   origin: 'https://emp-sys-frontend.vercel.app',
    credentials:true
}
))


//API
app.get('/backend/products', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        res.json(response.data);
        // res.setHeader("Access-Control-Allow-Origin", "*");
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Server' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at port no:${PORT}`)
})