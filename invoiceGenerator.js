const PDFDocument = require('pdfkit');
const path = require('path');

function generateInvoice(data, stream) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(stream);

    
    const logoPath = path.join(__dirname, 'public', 'logo.png');  
    doc.image(logoPath, 50, 50, { width: 100 });  

    
    doc.moveDown(2);

    
    doc.fontSize(10).text(`Seller: ${data.sellerName}`, 50, 150);
    doc.text(`Address: ${data.sellerAddress}, ${data.sellerCity}, ${data.sellerState}, ${data.sellerPincode}`);
    doc.text(`PAN: ${data.sellerPAN}`);
    doc.text(`GST: ${data.sellerGST}`);

    
    doc.text(`Billing: ${data.billingName}`, 300, 150);
    doc.text(`Address: ${data.billingAddress}, ${data.billingCity}, ${data.billingState}, ${data.billingPincode}`);
    doc.text(`State Code: ${data.billingStateCode}`);

    
    doc.text(`Shipping: ${data.shippingName}`, 50, 250);
    doc.text(`Address: ${data.shippingAddress}, ${data.shippingCity}, ${data.shippingState}, ${data.shippingPincode}`);
    doc.text(`State Code: ${data.shippingStateCode}`);

    
    doc.text(`Order No: ${data.orderNo}`, 300, 250);
    doc.text(`Order Date: ${data.orderDate}`);
    doc.text(`Invoice No: ${data.invoiceNo}`);
    doc.text(`Invoice Date: ${data.invoiceDate}`);


    doc.text(`Place of Supply: ${data.placeOfSupply}`, 50, 350);
    doc.text(`Place of Delivery: ${data.placeOfDelivery}`);
    doc.text(`Reverse Charge: ${data.reverseCharge}`, 300, 350);

    
    doc.moveDown();
    const tableTop = 400;
    doc.font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Unit Price', 150, tableTop);
    doc.text('Quantity', 250, tableTop);
    doc.text('Discount', 320, tableTop);
    doc.text('Net Amount', 390, tableTop);
    doc.text('Tax', 460, tableTop);
    doc.text('Total', 530, tableTop);

    let position = 0;
    doc.font('Helvetica');
    data.items.forEach((item, i) => {
        position = tableTop + 25 + (i * 25);
        doc.text(item.description, 50, position);
        doc.text(item.unitPrice.toString(), 150, position);
        doc.text(item.quantity.toString(), 250, position);
        doc.text(item.discount.toString(), 320, position);
        
        const netAmount = item.unitPrice * item.quantity - item.discount;
        doc.text(netAmount.toFixed(2), 390, position);

        const taxRate = 0.18; 
        let taxAmount;
        if (data.placeOfSupply === data.placeOfDelivery) {
            const cgst = netAmount * (taxRate / 2);
            const sgst = netAmount * (taxRate / 2);
            taxAmount = cgst + sgst;
            doc.text(`CGST: ${cgst.toFixed(2)}\nSGST: ${sgst.toFixed(2)}`, 460, position);
        } else {
            taxAmount = netAmount * taxRate;
            doc.text(`IGST: ${taxAmount.toFixed(2)}`, 460, position);
        }

        const total = netAmount + taxAmount;
        doc.text(total.toFixed(2), 530, position);
    });


    const totalNetAmount = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity - item.discount), 0);
    const totalTaxAmount = totalNetAmount * 0.18;
    const grandTotal = totalNetAmount + totalTaxAmount;

    position += 40;
    doc.font('Helvetica-Bold');
    doc.text('Total:', 390, position);
    doc.text(totalNetAmount.toFixed(2), 460, position);
    doc.text(totalTaxAmount.toFixed(2), 530, position);
    doc.text(grandTotal.toFixed(2), 590, position);

    
    doc.moveDown();
    doc.font('Helvetica');
    doc.text(`Amount in words: ${numberToWords(grandTotal)} only`);

    
    doc.moveDown();
    doc.text('For Seller Name:');
    doc.text('Authorised Signatory');

    doc.end();
}

module.exports = generateInvoice;
