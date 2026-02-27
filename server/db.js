const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
const initDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fpp');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// --- Schemas ---

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'vao'],
    required: true
  },
  village: {
    type: String,
    required: true
  },
  secretKey: {
    type: String // Only for VAO
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const User = mongoose.model('User', userSchema);

// Request Schema
const requestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  village: {
    type: String,
    required: true
  },
  aadhaar: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  harvestDate: {
    type: String, // Storing as String (YYYY-MM-DD) to match previous DATEONLY behavior roughly or simplify
    required: true
  },
  proofFile: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'final_docs_uploaded', 'completed'],
    default: 'pending'
  },
  serialNumber: {
    type: String
  },
  rejectionReason: {
    type: String
  },
  finalDocs: {
    landDoc: String,
    aadhaarDoc: String,
    bankDoc: String,
    truckSheet: String
  },
  paddyBags: {
    type: Number
  },
  billGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for backward compatibility with Sequelize 'include: User' -> 'request.User'
requestSchema.virtual('User').get(function() {
  return this.farmerId;
});

const Request = mongoose.model('Request', requestSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String // 'info', 'success', 'warning', 'error'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { initDB, User, Request, Notification };
