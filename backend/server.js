const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 8000;

// Connect to Database
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
});
