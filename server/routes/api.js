const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const requestController = require('../controllers/requestController');

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });


// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Update Profile
const profileController = require('../controllers/profileController');
router.put('/auth/me', auth, profileController.updateProfile);

// --- Request Routes (Farmer) ---
// Step 1: Create Request
router.post('/requests', auth, upload.single('proofFile'), requestController.createRequest);

// Step 3: Upload Final Docs
// Expects: landDoc, aadhaarDoc, bankDoc, truckSheet
router.post('/requests/:id/final-docs', auth, upload.fields([
  { name: 'landDoc', maxCount: 1 },
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'bankDoc', maxCount: 1 },
  { name: 'truckSheet', maxCount: 1 }
]), requestController.uploadFinalDocs);

// Get My Requests (Farmer)
// Get My Requests (Farmer)
router.get('/my-requests', auth, requestController.getMyRequest);

// Village Serial Status (Public for Village)
router.get('/village-serials', auth, requestController.getVillageSerials);


// --- Request Routes (VAO) ---
// Get All Requests (Pending/Approved/Etc)
router.get('/requests/all', auth, requestController.getRequests);

// Verify Step 1 & Assign Serial Number
router.post('/requests/:id/approve', auth, requestController.approveRequest);

// Reject Request
router.post('/requests/:id/reject', auth, requestController.rejectRequest);

const billController = require('../controllers/billController');

// Generate Bill (Final Step)
router.post('/requests/:id/bill', auth, requestController.generateBill);

// Download Bill PDF
router.get('/requests/:id/bill-pdf', auth, billController.generatePDFBill);

const analyticsController = require('../controllers/analyticsController');

// Analytics (VAO)
router.get('/analytics/dashboard', auth, analyticsController.getAnalytics);
router.get('/analytics/export', auth, analyticsController.exportReport);

// Notifications
router.get('/notifications', auth, requestController.getNotifications);
router.post('/notifications/read', auth, requestController.markNotificationRead);

module.exports = router;
