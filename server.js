const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const generateInvoice = require('./invoiceGenerator');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/generate-invoice', (req, res) => {
    const invoiceData = req.body;

    const invoicesDir = path.join(__dirname, 'invoices');

    if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir);
    }

    const filePath = path.join(invoicesDir, `invoice-${invoiceData.invoiceNo}.pdf`);
    const stream = fs.createWriteStream(filePath);

    generateInvoice(invoiceData, stream);

    stream.on('finish', () => {
        res.download(filePath, `invoice-${invoiceData.invoiceNo}.pdf`, (err) => {
            if (err) {
                console.log('Error sending the invoice PDF:', err);
            }
            fs.unlinkSync(filePath);
        });
    });

    stream.on('error', (err) => {
        console.log('Error generating invoice:', err);
        res.status(500).send('Error generating invoice');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
