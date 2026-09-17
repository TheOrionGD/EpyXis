require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/provisioning', require('./src/routes/provisioning'));
app.use('/api/devices', require('./src/routes/devices'));
app.use('/api/ingest', require('./src/routes/ingest'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/onboarding', require('./src/routes/onboarding'));
app.use('/api/provider', require('./src/routes/provider'));
app.use('/api/team', require('./src/routes/team'));
app.use('/api/tenants', require('./src/routes/tenants'));

app.get('/', (req, res) => {
  res.send('Epyxis Backend API Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
