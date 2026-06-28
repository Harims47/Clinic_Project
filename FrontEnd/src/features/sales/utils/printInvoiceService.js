/**
 * Isolated Iframe Thermal Printer Service for Pharmacy Billing Invoice
 * Outputs a compact, clean 80mm receipt format suitable for retail thermal printers.
 */
export const printInvoiceReceipt = (invoice) => {
  const printFrameId = 'thermal-invoice-print-frame';
  let iframe = document.getElementById(printFrameId);

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = printFrameId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();

  const formattedDate = new Date(invoice.createdAt || new Date()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const patientName = invoice.patient?.name || 'Walk-In Customer';
  const patientCode = invoice.patient?.patientCode || 'N/A';
  const cashier = invoice.creator?.username || 'Pharmacist';

  const itemsHtml = (invoice.items || []).map((item, index) => {
    const prodName = item.product?.productName || 'Medicine';
    const mrp = Number(item.unitPrice).toFixed(2);
    const qty = item.quantity;
    const total = Number(item.itemTotal).toFixed(2);

    return `
      <tr>
        <td style="padding: 4px 0; text-align: left; vertical-align: top; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${index + 1}. ${prodName}
        </td>
        <td style="padding: 4px 0; text-align: center; vertical-align: top;">${qty}</td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top;">${mrp}</td>
        <td style="padding: 4px 0; text-align: right; vertical-align: top;">${total}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <html>
      <head>
        <title>Invoice Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 72mm;
            margin: 0 auto;
            padding: 4mm 2mm;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .double-divider {
            border-top: 2px double #000;
            margin: 6px 0;
          }
          .header-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 0.5px;
          }
          .meta-table, .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          .meta-table td {
            padding: 2px 0;
          }
          .items-table th {
            border-bottom: 1px dashed #000;
            padding: 4px 0;
            font-size: 10px;
          }
          .summary-table {
            width: 100%;
            margin-top: 6px;
            font-size: 10px;
          }
          .summary-table td {
            padding: 2px 0;
          }
          .footer {
            margin-top: 12px;
            font-size: 9px;
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h2 class="header-title">CLINIC ERP PHARMACY</h2>
          <span style="font-size: 9px;">Main Road, Bengaluru, India</span>
        </div>

        <div class="divider"></div>

        <table class="meta-table">
          <tr>
            <td class="bold">Invoice:</td>
            <td>${invoice.invoiceNumber}</td>
          </tr>
          <tr>
            <td class="bold">Date:</td>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <td class="bold">Patient:</td>
            <td>${patientName} (${patientCode})</td>
          </tr>
          <tr>
            <td class="bold">Cashier:</td>
            <td>${cashier}</td>
          </tr>
        </table>

        <div class="divider"></div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="text-align: left; width: 45%;">Item</th>
              <th style="text-align: center; width: 15%;">Qty</th>
              <th style="text-align: right; width: 20%;">MRP</th>
              <th style="text-align: right; width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <table class="summary-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">₹${Number(invoice.subTotal || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>GST Tax Amt:</td>
            <td class="text-right">₹${Number(invoice.taxAmount || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total Disc:</td>
            <td class="text-right">₹${Number(invoice.discountAmount || 0).toFixed(2)}</td>
          </tr>
          <tr class="bold" style="font-size: 11px;">
            <td>NET AMOUNT:</td>
            <td class="text-right">₹${Number(invoice.netAmount || 0).toFixed(2)}</td>
          </tr>
        </table>

        <div class="double-divider"></div>

        <table class="meta-table">
          <tr>
            <td class="bold">Payment Mode:</td>
            <td class="text-right">${invoice.paymentMode}</td>
          </tr>
          <tr>
            <td class="bold">Status:</td>
            <td class="text-right">${invoice.paymentStatus || 'Paid'}</td>
          </tr>
        </table>

        <div class="divider"></div>

        <div class="text-center footer">
          <span class="bold">THANK YOU! GET WELL SOON.</span><br/>
          <span>Prescribed medications, keep out of children's reach.</span>
        </div>
      </body>
    </html>
  `;

  doc.write(htmlContent);
  doc.close();

  // Trigger browser print spooler
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 100);
};

export default printInvoiceReceipt;
