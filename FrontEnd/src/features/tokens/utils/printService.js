/**
 * Centrally manages queue token prints using an isolated hidden iframe
 * targeted for standard 80mm (3-inch) thermal receipt papers.
 */

export const getDisplayToken = (token) => {
  if (!token) return '';
  const docName = token.doctor?.username || 'DOC';
  const prefix = docName.substring(0, 2).toUpperCase();
  const paddedNum = String(token.tokenNumber).padStart(3, '0');
  return `${prefix}-${paddedNum}`;
};

export const printTokenReceipt = (token) => {
  if (!token) return;

  const displayToken = getDisplayToken(token);
  const patientName = token.patient?.name || 'Walk-in Patient';
  const patientCode = token.patient?.patientCode || '-';
  const doctorName = token.doctor?.username ? `Dr. ${token.doctor.username.charAt(0).toUpperCase() + token.doctor.username.slice(1)}` : 'General Practitioner';
  const dateStr = new Date(token.tokenDate || new Date()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = new Date(token.createdAt || new Date()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Token Receipt - ${displayToken}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          width: 72mm;
          margin: 0 auto;
          padding: 5mm 0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          text-align: center;
        }
        .header {
          font-weight: bold;
          font-size: 16px;
          border-bottom: 1px dashed #000;
          padding-bottom: 2mm;
          margin-bottom: 3mm;
          text-transform: uppercase;
        }
        .token-box {
          border: 2px solid #000;
          padding: 3mm;
          margin: 3mm 0;
        }
        .token-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .token-num {
          font-size: 32px;
          font-weight: bold;
          margin: 1mm 0;
        }
        .details {
          text-align: left;
          margin: 4mm 0;
          font-size: 11px;
        }
        .details-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1mm;
        }
        .details-label {
          font-weight: bold;
        }
        .footer {
          border-top: 1px dashed #000;
          padding-top: 2mm;
          margin-top: 3mm;
          font-size: 10px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        Health Clinic ERP
      </div>
      <div class="token-box">
        <div class="token-title">Consultation Token</div>
        <div class="token-num">${displayToken}</div>
        <div class="token-title">Queue Status: Waiting</div>
      </div>
      <div class="details">
        <div class="details-row">
          <span class="details-label">Patient:</span>
          <span>${patientName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Patient ID:</span>
          <span>${patientCode}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Provider:</span>
          <span>${doctorName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Type:</span>
          <span>${token.consultationType || 'New'}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Date:</span>
          <span>${dateStr}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Issued At:</span>
          <span>${timeStr}</span>
        </div>
      </div>
      <div class="footer">
        Please wait for your turn.<br>
        Thank you for choosing us!
      </div>
      <script>
        window.onload = function() {
          window.focus();
          window.print();
          setTimeout(function() {
            window.parent.document.body.removeChild(window.frameElement);
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  // Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(receiptHtml);
  doc.close();
};
