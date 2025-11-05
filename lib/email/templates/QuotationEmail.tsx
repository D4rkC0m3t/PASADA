/**
 * PASADA CRM - Quotation Email Template
 * Professional email template for sending quotations to clients
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
  Img,
  Link,
} from '@react-email/components';

interface QuotationEmailProps {
  clientName: string;
  projectName: string;
  quotationNumber: string;
  quotationTotal: string;
  validUntil: string;
  dashboardUrl?: string;
}

export default function QuotationEmail({
  clientName = 'Valued Client',
  projectName = 'Your Project',
  quotationNumber = 'PASADA-2025-0001',
  quotationTotal = '₹2,50,000',
  validUntil = '30 days',
  dashboardUrl = 'https://pasada.in/client/dashboard',
}: QuotationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://pasada.in/images/pasada-logo.png"
              alt="PASADA Interior Design"
              width="150"
              height="50"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Your Quotation is Ready!</Heading>

            <Text style={text}>Dear {clientName},</Text>

            <Text style={text}>
              Thank you for your interest in PASADA Interior Design. We are excited to present
              your custom quotation for <strong>{projectName}</strong>.
            </Text>

            {/* Quotation Details Box */}
            <Section style={quotationBox}>
              <Text style={quotationLabel}>Quotation Number</Text>
              <Text style={quotationValue}>{quotationNumber}</Text>

              <Hr style={divider} />

              <Text style={quotationLabel}>Total Amount</Text>
              <Text style={quotationAmount}>{quotationTotal}</Text>

              <Hr style={divider} />

              <Text style={quotationLabel}>Valid Until</Text>
              <Text style={quotationValue}>{validUntil}</Text>
            </Section>

            <Text style={text}>
              Please find the detailed quotation attached as a PDF document. You can also view
              and manage your quotation through our client portal.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View in Dashboard
              </Button>
            </Section>

            <Text style={text}>
              If you have any questions or would like to discuss the quotation, please don't
              hesitate to reach out. We're here to help!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={divider} />

            <Text style={footerText}>
              <strong>PASADA Interior Design</strong>
              <br />
              No 47 LBS Nagar 1st cross K Narayanapura
              <br />
              Bangalore 560077, India
            </Text>

            <Text style={footerText}>
              Email:{' '}
              <Link href="mailto:pasada.groups@gmail.com" style={link}>
                pasada.groups@gmail.com
              </Link>
              <br />
              Phone:{' '}
              <Link href="tel:+917090004948" style={link}>
                +91 7090004948
              </Link>
            </Text>

            <Text style={footerSmall}>
              © {new Date().getFullYear()} PASADA Interior Design. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '24px 32px',
  backgroundColor: '#1a1a1a',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '32px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  marginBottom: '24px',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const quotationBox = {
  backgroundColor: '#f8f9fa',
  border: '2px solid #e8e8e8',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const quotationLabel = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  marginBottom: '4px',
};

const quotationValue = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  marginTop: '0',
  marginBottom: '16px',
};

const quotationAmount = {
  color: '#d4af37',
  fontSize: '32px',
  fontWeight: '700',
  marginTop: '0',
  marginBottom: '16px',
};

const divider = {
  borderColor: '#e8e8e8',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#d4af37',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  padding: '32px',
  paddingTop: '16px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '12px',
};

const footerSmall = {
  color: '#aab7c4',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '16px',
};

const link = {
  color: '#d4af37',
  textDecoration: 'none',
};
