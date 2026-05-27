const express = require('express');
const cors = require('cors');
const classifyRouter = require('./routes/classify');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/classify', classifyRouter);

// Health check
app.get('/', (req, res) => {
    res.send('Shape Segregation Service is running.');
});

// Start server
app.listen(PORT, () => {
    console.log(`Service listening on port ${PORT}`);
});