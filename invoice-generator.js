const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate professional PDF invoice
function generateInvoicePDF(orderData, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Create new PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                info: {
                    Title: `Invoice - ${orderData.order_number}`,
                    Author: 'WinterSolace',
                    Subject: 'Order Invoice',
                    Creator: 'WinterSolace Order System'
                }
            });

            // Pipe to file
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Colors - Black and White Theme
            const colors = {
                primary: '#000000',
                secondary: '#ffffff',
                dark: '#000000',
                gray: '#666666',
                lightGray: '#f8f9fa',
                success: '#000000',
                danger: '#000000'
            };

            // Header Section with Logo
            // Add logo image (you'll need to add the logo file path)
            // For now, keeping text-based header
            doc.fontSize(32)
               .fillColor(colors.primary)
               .text('WINTERSOLACE', 50, 50, { align: 'left' });

            doc.fontSize(12)
               .fillColor(colors.gray)
               .text('Premium Winter Apparel', 50, 85);

            // Invoice title
            doc.fontSize(24)
               .fillColor(colors.dark)
               .text('INVOICE', 50, 120, { align: 'left' });

            // Invoice details
            doc.fontSize(10)
               .fillColor(colors.gray)
               .text('Invoice Number:', 50, 160)
               .text('Date:', 50, 175)
               .text('Due Date:', 50, 190);

            doc.fontSize(10)
               .fillColor(colors.dark)
               .text(orderData.order_number || 'N/A', 150, 160)
               .text(new Date().toLocaleDateString(), 150, 175)
               .text(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), 150, 190);

            // Customer Information
            doc.fontSize(14)
               .fillColor(colors.dark)
               .text('Bill To:', 350, 160);

            doc.fontSize(10)
               .fillColor(colors.dark)
               .text(orderData.customer_name || 'Customer', 350, 180);

            if (orderData.shipping_address) {
                const addr = orderData.shipping_address;
                doc.text(addr.street || '', 350, 195)
                   .text(`${addr.city || ''} ${addr.state || ''} ${addr.zip || ''}`, 350, 210)
                   .text(addr.country || 'United States', 350, 225);
            }

            // Line separator
            doc.moveTo(50, 250)
               .lineTo(550, 250)
               .strokeColor(colors.primary)
               .lineWidth(2)
               .stroke();

            // Items table header
            doc.fontSize(12)
               .fillColor(colors.dark)
               .text('Description', 50, 270)
               .text('Size', 250, 270)
               .text('Qty', 320, 270)
               .text('Unit Price', 380, 270)
               .text('Total', 480, 270);

            // Line under header
            doc.moveTo(50, 290)
               .lineTo(550, 290)
               .strokeColor(colors.dark)
               .lineWidth(2)
               .stroke();

            // Items
            let yPosition = 300;
            const items = orderData.items || [];
            
            items.forEach((item, index) => {
                // Item name
                doc.fontSize(10)
                   .fillColor(colors.dark)
                   .text(item.name || 'Product', 50, yPosition);

                // Size
                doc.text(item.size || 'N/A', 250, yPosition);

                // Quantity
                doc.text((item.quantity || 1).toString(), 320, yPosition);

                // Unit price
                doc.text(`$${(item.price || 0).toFixed(2)}`, 380, yPosition);

                // Total
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                doc.text(`$${itemTotal.toFixed(2)}`, 480, yPosition);

                // SKU (smaller text)
                if (item.sku) {
                    doc.fontSize(8)
                       .fillColor(colors.gray)
                       .text(`SKU: ${item.sku}`, 50, yPosition + 15);
                }

                yPosition += 35;
            });

            // Summary section
            const summaryY = Math.max(yPosition + 20, 450);
            
            // Subtotal
            doc.fontSize(10)
               .fillColor(colors.dark)
               .text('Subtotal:', 400, summaryY)
               .text(`$${((orderData.total_amount || 0) * 0.9).toFixed(2)}`, 480, summaryY);

            // Shipping
            doc.text('Shipping:', 400, summaryY + 20)
               .text(`$${((orderData.total_amount || 0) * 0.05).toFixed(2)}`, 480, summaryY + 20);

            // Tax
            doc.text('Tax:', 400, summaryY + 40)
               .text(`$${((orderData.total_amount || 0) * 0.05).toFixed(2)}`, 480, summaryY + 40);

            // Total line
            doc.moveTo(400, summaryY + 60)
               .lineTo(550, summaryY + 60)
               .strokeColor(colors.dark)
               .lineWidth(1)
               .stroke();

            // Total
            doc.fontSize(14)
               .fillColor(colors.dark)
               .text('Total:', 400, summaryY + 70)
               .text(`$${(orderData.total_amount || 0).toFixed(2)}`, 480, summaryY + 70);

            // Payment status
            doc.fontSize(12)
               .fillColor(colors.success)
               .text('✅ Payment Status: PAID', 50, summaryY + 100);

            // Tracking information
            if (orderData.tracking_number) {
                doc.fontSize(12)
                   .fillColor(colors.dark)
                   .text('Tracking Number:', 50, summaryY + 130)
                   .fillColor(colors.dark)
                   .text(orderData.tracking_number, 180, summaryY + 130);
            }

            // Footer
            const footerY = 750;
            doc.fontSize(8)
               .fillColor(colors.gray)
               .text('Thank you for your business!', 50, footerY, { align: 'center' })
               .text('WinterSolace - Premium Winter Apparel', 50, footerY + 15, { align: 'center' })
               .text('For support, visit: http://localhost:3000/contact.html', 50, footerY + 30, { align: 'center' });

            // Finalize PDF
            doc.end();

            stream.on('finish', () => {
                console.log('PDF invoice generated successfully:', outputPath);
                resolve(outputPath);
            });

            stream.on('error', (error) => {
                console.error('Error generating PDF:', error);
                reject(error);
            });

        } catch (error) {
            console.error('Error creating PDF:', error);
            reject(error);
        }
    });
}

module.exports = { generateInvoicePDF };
