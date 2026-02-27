const { Request, User, Notification } = require('../db');

// Create Request (Step 1)
const createRequest = async (req, res) => {
  try {
    const { id: farmerId, village, role } = req.user;
    
    if (role !== 'farmer') {
      return res.status(403).send({ error: 'Only farmers can create requests.' });
    }

    const { aadhaar, contact, harvestDate } = req.body;
    
    // Season Logic: 2 Seasons
    // Season 1: April 1 - Sept 30
    // Season 2: Oct 1 - March 31
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    let seasonStart, seasonEnd;

    if (currentMonth >= 3 && currentMonth <= 8) {
      // Season 1 (April - Sept)
      seasonStart = new Date(currentYear, 3, 1); 
      seasonEnd = new Date(currentYear, 8, 30, 23, 59, 59);
    } else {
      // Season 2 (Oct - March)
      if (currentMonth >= 9) {
        // Oct - Dec
        seasonStart = new Date(currentYear, 9, 1);
        seasonEnd = new Date(currentYear + 1, 2, 31, 23, 59, 59);
      } else {
        // Jan - Mar
        seasonStart = new Date(currentYear - 1, 9, 1);
        seasonEnd = new Date(currentYear, 2, 31, 23, 59, 59);
      }
    }

    const requestCount = await Request.countDocuments({
      farmerId,
      createdAt: { $gte: seasonStart, $lte: seasonEnd }
    });

    if (requestCount >= 5) {
      return res.status(400).send({ error: 'Limit reached: You can only create 5 requests per season.' });
    }

    const request = await Request.create({
      farmerId,
      village,
      aadhaar,
      contact,
      harvestDate,
      proofFile: 'uploads/' + req.file.filename // Store relative path
    });

    res.status(201).send(request);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Get Requests (VAO View)
const getRequests = async (req, res) => {
  try {
    const { user } = req;
    
    if (user.role !== 'vao') return res.status(403).send();

    const requests = await Request.find({ village: user.village })
      .populate('farmerId', 'name mobile') // Populate farmer details
      .exec();
    
    // Transform to match previous structure if needed, or let frontend adapt.
    // Frontend expects `request.User.name`. Mongoose populate puts it in `request.farmerId`.
    // I should probably map it to keep structure or I will break frontend lightly.
    // The previous Sequelize `include: User` resulted in `request.User`.
    // I can stick to `farmerId` property but frontend would need change.
    // However, I can use lean() and modify result, or just fix frontend?
    // Let's modify the response structure for minimal frontend friction IF feasible.
    // Or better, let's look at `FarmerDashboard.jsx` again. It uses `requests` state.
    // Actually `getRequests` is for VAO. `FarmerDashboard` uses `getMyRequests`.
    // Let's check `VAODashboard.jsx` if exists.
    
    res.send(requests);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Approve Request (Assign Serial Number)
const approveRequest = async (req, res) => {
  try {
    if (req.user.role !== 'vao') return res.status(403).send({ error: 'Access denied.' });
    
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) return res.status(404).send();

    // Assign Serial Number: Count approved + completed requests in this village
    const count = await Request.countDocuments({
      village: request.village,
      status: { $in: ['approved', 'final_docs_uploaded', 'completed'] }
    });

    const serialNumber = `${request.village}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    request.status = 'approved';
    request.serialNumber = serialNumber;
    await request.save();

    await Notification.create({
      userId: request.farmerId,
      message: `Your request has been APPROVED! Serial Number assigned: ${serialNumber}. Please proceed to sell your paddy.`,
      type: 'success'
    });

    res.send(request);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Reject Request
const rejectRequest = async (req, res) => {
  try {
    if (req.user.role !== 'vao') return res.status(403).send({ error: 'Access denied.' });

    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await Request.findById(id);
    if (!request) return res.status(404).send();

    request.status = 'rejected';
    request.rejectionReason = rejectionReason;
    await request.save();

    await Notification.create({
      userId: request.farmerId,
      message: `Your request has been REJECTED. Reason: ${rejectionReason}`,
      type: 'error'
    });

    res.send(request);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Upload Final Docs (Step 3)
const uploadFinalDocs = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);

    if (!request) return res.status(404).send();
    
    // user.id is string from JWT
    if (request.farmerId.toString() !== req.user.id) {
       return res.status(403).send({ error: 'You do not own this request.' });
    }

    if (request.status !== 'approved') return res.status(400).send({ error: 'Request not approved yet.' });

    const getPath = (fieldName) => req.files[fieldName] ? 'uploads/' + req.files[fieldName][0].filename : null;

    const finalDocs = {
      landDoc: getPath('landDoc'),
      aadhaarDoc: getPath('aadhaarDoc'),
      bankDoc: getPath('bankDoc'),
      truckSheet: getPath('truckSheet'),
    };

    request.finalDocs = finalDocs; // Mongoose handles object
    request.status = 'final_docs_uploaded';
    await request.save();

    res.send(request);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Generate Bill (Step 4)
const generateBill = async (req, res) => {
  try {
    if (req.user.role !== 'vao') return res.status(403).send({ error: 'Access denied.' });
    
    const { id } = req.params;
    const { paddyBags } = req.body;

    const request = await Request.findById(id);
    if (!request) return res.status(404).send();

    request.paddyBags = paddyBags;
    request.status = 'completed';
    request.billGenerated = true;
    await request.save();

    await Notification.create({
      userId: request.farmerId,
      message: `Bill Generated! ${paddyBags} bags sold. Please download your bill.`,
      type: 'success'
    });

    res.send(request);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Farmer: Get My Request
const getMyRequest = async (req, res) => {
  try {
    const requests = await Request.find({ farmerId: req.user.id });
    res.send(requests);
  } catch (error) {
     res.status(500).send();
  }
}

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Sort descending
    res.send(notifications);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { isRead: true });
    res.send({ success: true });
  } catch (error) {
    res.status(500).send();
  }
};

// Get Village Serials (Public for Village)
const getVillageSerials = async (req, res) => {
  try {
    const { village } = req.user;
    
    const requests = await Request.find({ 
      village,
      status: { $in: ['approved', 'final_docs_uploaded', 'completed'] } 
    }).populate('farmerId', 'name');

    const data = requests.map(req => ({
      serialNumber: req.serialNumber,
      farmerName: req.farmerId ? req.farmerId.name : 'Unknown',
      status: req.status, // 'approved', 'final_docs_uploaded', 'completed'
      village: req.village
    }));

    res.send(data);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  approveRequest,
  rejectRequest,
  uploadFinalDocs,
  generateBill,
  getMyRequest,
  getNotifications,
  markNotificationRead,
  getVillageSerials
};
