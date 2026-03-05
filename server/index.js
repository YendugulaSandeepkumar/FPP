// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const { initDB } = require('./db');
// const routes = require('./routes/api');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Serve Uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api', routes);

// // Start Server
// const start = async () => {
//   await initDB();
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// };

// start();

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const routes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();