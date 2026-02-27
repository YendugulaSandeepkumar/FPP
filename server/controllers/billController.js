const PDFDocument = require('pdfkit');
const { Request } = require('../db');

const generatePDFBill = async (req, res) => {
  try {
    const { id } = req.params;
    // Populate farmerId which corresponds to 'User'
    const request = await Request.findById(id).populate('farmerId');

    if (!request || !request.billGenerated) {
        return res.status(404).send({ error: 'Bill not found or not generated yet.' });
    }

    // Adapting for field name change: request.User -> request.farmerId
    const farmer = request.farmerId; // In Mongoose populate, the field is replaced by the object

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${request.serialNumber}.pdf`);

    doc.pipe(res); 

    // --- Header ---
    doc.fillColor('#444444').fontSize(20).text('Farmer Paddy Portal', { align: 'center' })
       .fontSize(10).text('Government of India', { align: 'center' });
    doc.moveDown();

    // --- Divider ---
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
    doc.moveDown();

    // --- Bill Details ---
    const customerInfoTop = 120;

    doc.fontSize(12).font('Helvetica-Bold').text('Paddy Procurement Bill', 50, customerInfoTop);
    
    doc.font('Helvetica').fontSize(10)
       .text(`Bill No: ${request.serialNumber}`, 400, customerInfoTop)
       .text(`Date: ${new Date().toLocaleDateString()}`, 400, customerInfoTop + 15)
       .moveDown();

    // --- Farmer Details Grid ---
    doc.font('Helvetica-Bold').text('Farmer Details:', 50, customerInfoTop + 40);
    doc.font('Helvetica')
       .text(`Name: ${farmer.name}`, 50, customerInfoTop + 55)
       .text(`Mobile: ${farmer.mobile}`, 50, customerInfoTop + 70)
       .text(`Village: ${request.village}`, 50, customerInfoTop + 85)
       .text(`Aadhaar: ${request.aadhaar}`, 300, customerInfoTop + 55);

    doc.moveDown();

    // --- Transaction Table ---
    const tableTop = 250;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 350;
    const priceX = 450;

    doc.font('Helvetica-Bold');
    doc.text('Item', itemCodeX, tableTop);
    doc.text('Description', descriptionX, tableTop);
    doc.text('Quantity (Bags)', quantityX, tableTop);
    doc.text('Total', priceX, tableTop);

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemCodeX, tableTop + 15).lineTo(priceX + 50, tableTop + 15).stroke();

    doc.font('Helvetica');
    const itemY = tableTop + 25;
    
    doc.text('1', itemCodeX, itemY);
    doc.text('Paddy Grade A', descriptionX, itemY);
    doc.text(request.paddyBags, quantityX, itemY);
    doc.text('-', priceX, itemY); 

    // --- Footer ---
    doc.fontSize(10)
       .text('Valid for all government procurement purposes.', 50, 700, { align: 'center', width: 500 });

    doc.end();

  } catch (error) {
    console.error(error);
    if (!res.headersSent) res.status(500).send({ error: 'Failed to generate PDF' });
  }
};

module.exports = { generatePDFBill };
