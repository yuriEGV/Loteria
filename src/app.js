const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
// Note: In serverless, we need to handle DB connection caching potentially.
// But for now calling it here is standard.
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/lottery', require('./routes/lottery'));
app.use('/api/commission', require('./routes/commission'));

// Root route
app.get('/', (req, res) => {
    res.send('Loteria Blockchain API is running');
});

module.exports = app;
