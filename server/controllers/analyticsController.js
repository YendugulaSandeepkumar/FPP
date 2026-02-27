const { Request } = require('../db');

const getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'vao') return res.status(403).send();

    const village = req.user.village;

    const totalRequests = await Request.countDocuments({ village });
    
    const pending = await Request.countDocuments({ village, status: 'pending' });
    const approved = await Request.countDocuments({ village, status: 'approved' });
    const completed = await Request.countDocuments({ village, status: 'completed' });
    
    // Aggregate sum of paddyBags for completed requests
    const result = await Request.aggregate([
      { $match: { village, status: 'completed' } },
      { $group: { _id: null, totalBags: { $sum: "$paddyBags" } } }
    ]);

    const totalBags = result.length > 0 ? result[0].totalBags : 0;

    res.send({
        totalRequests,
        pending,
        approved,
        completed,
        totalBags,
        target: 5000 
    });

  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch analytics' });
  }
};

const exportReport = async (req, res) => {
  try {
      if (req.user.role !== 'vao') return res.status(403).send();

      const requests = await Request.find({
          village: req.user.village,
          status: { $in: ['approved', 'final_docs_uploaded', 'completed'] }
      }).populate('farmerId');

      // Generate CSV Content
      let csv = 'Serial Number,Farmer Name,Mobile,Aadhaar,Status,Paddy Bags,Date\n';
      
      requests.forEach(req => {
          csv += `${req.serialNumber || 'N/A'},${req.farmerId.name},${req.farmerId.mobile},${req.aadhaar},${req.status},${req.paddyBags || 0},${req.createdAt}\n`;
      });

      res.header('Content-Type', 'text/csv');
      res.attachment(`report-${req.user.village}-${Date.now()}.csv`);
      return res.send(csv);

  } catch (error) {
    res.status(500).send({ error: 'Failed to export report' });
  }
};

module.exports = { getAnalytics, exportReport };
