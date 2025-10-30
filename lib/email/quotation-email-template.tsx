import * as React from 'react'

interface QuotationEmailProps {
  clientName: string
  quotationNumber: string
  quotationTitle: string
  projectName: string
  totalAmount: number
  validUntil: string | null
  viewUrl: string
}

export const QuotationEmail: React.FC<QuotationEmailProps> = ({
  clientName,
  quotationNumber,
  quotationTitle,
  projectName,
  totalAmount,
  validUntil,
  viewUrl,
}) => {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Your Quotation from PASADA Interiors</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header p {
            color: #FEF3C7;
            margin: 8px 0 0 0;
            font-size: 14px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            color: #18181b;
            font-size: 18px;
            margin: 0 0 20px 0;
            font-weight: 600;
          }
          .message {
            color: #52525b;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 30px 0;
          }
          .quotation-card {
            background-color: #fafafa;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            padding: 24px;
            margin: 30px 0;
          }
          .quotation-detail {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e4e4e7;
          }
          .quotation-detail:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #71717a;
            font-size: 14px;
            font-weight: 500;
          }
          .detail-value {
            color: #18181b;
            font-size: 14px;
            font-weight: 600;
          }
          .total-amount {
            background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .total-label {
            color: #78716c;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
          }
          .total-value {
            color: #EAB308;
            font-size: 32px;
            font-weight: 700;
            margin: 0;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
          }
          .button:hover {
            box-shadow: 0 6px 16px rgba(234, 179, 8, 0.4);
          }
          .note {
            background-color: #f4f4f5;
            border-left: 4px solid #EAB308;
            padding: 16px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .note p {
            color: #52525b;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
          }
          .footer {
            background-color: #18181b;
            padding: 30px;
            text-align: center;
          }
          .footer-text {
            color: #a1a1aa;
            font-size: 13px;
            line-height: 1.6;
            margin: 0 0 16px 0;
          }
          .footer-link {
            color: #EAB308;
            text-decoration: none;
          }
          .social-links {
            margin: 20px 0 0 0;
          }
          .social-links a {
            color: #a1a1aa;
            text-decoration: none;
            margin: 0 10px;
            font-size: 13px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1>PASADA INTERIORS</h1>
            <p>Tailored Furniture & Interior Design Services</p>
          </div>

          {/* Content */}
          <div className="content">
            <p className="greeting">Hello {clientName},</p>
            
            <p className="message">
              Thank you for your interest in PASADA Interiors. We're pleased to send you 
              the quotation for your project <strong>{projectName}</strong>.
            </p>

            <p className="message">
              Please find the detailed quotation attached to this email. We've carefully 
              prepared this proposal based on your requirements and specifications.
            </p>

            {/* Quotation Card */}
            <div className="quotation-card">
              <div className="quotation-detail">
                <span className="detail-label">Quotation Number</span>
                <span className="detail-value">{quotationNumber}</span>
              </div>
              <div className="quotation-detail">
                <span className="detail-label">Title</span>
                <span className="detail-value">{quotationTitle}</span>
              </div>
              <div className="quotation-detail">
                <span className="detail-label">Project</span>
                <span className="detail-value">{projectName}</span>
              </div>
              {validUntil && (
                <div className="quotation-detail">
                  <span className="detail-label">Valid Until</span>
                  <span className="detail-value">
                    {new Date(validUntil).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="total-amount">
              <p className="total-label">Total Amount</p>
              <p className="total-value">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>

            {/* View Online Button */}
            <div className="button-container">
              <a href={viewUrl} className="button">
                View Quotation Online
              </a>
            </div>

            {/* Note */}
            <div className="note">
              <p>
                <strong>Note:</strong> This quotation is valid until the date mentioned above. 
                If you have any questions or would like to discuss any details, please don't 
                hesitate to contact us.
              </p>
            </div>

            <p className="message">
              We look forward to working with you on this project!
            </p>

            <p className="message">
              Best regards,<br />
              <strong>PASADA Interiors Team</strong>
            </p>
          </div>

          {/* Footer */}
          <div className="footer">
            <p className="footer-text">
              <strong>PASADA INTERIORS</strong><br />
              Email: <a href="mailto:contact@pasada.in" className="footer-link">contact@pasada.in</a><br />
              Phone: <a href="tel:+919876543210" className="footer-link">+91 98765 43210</a><br />
              Website: <a href="https://www.pasada.in" className="footer-link">www.pasada.in</a>
            </p>
            
            <div className="social-links">
              <a href="https://facebook.com/pasadainteriors">Facebook</a>
              <a href="https://instagram.com/pasadainteriors">Instagram</a>
              <a href="https://www.pasada.in">Website</a>
            </div>

            <p className="footer-text" style={{ marginTop: '20px', fontSize: '12px' }}>
              © 2024 PASADA Interiors. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

export default QuotationEmail
