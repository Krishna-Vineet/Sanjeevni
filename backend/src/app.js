const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ELITE ROUTES (Focus on High Impact Features)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transfer', require('./routes/transfer'));
app.use('/api/hospital', require('./routes/hospital'));
app.use('/api/resource', require('./routes/resource'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/news', require('./routes/news'));
app.use('', require('./routes/system')); // Combined for /api/hospitals/nearby and /api/dev/seed

// Health check
app.get('/', (req, res) => {
    res.json({ message: "Sanjeevni Elite Backend — Mission Critical Coordination", version: "2.0.0" });
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
