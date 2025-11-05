/**
 * PASADA CRM - Lead Follow-up Email Template
 * Professional email template for following up with new leads
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

interface LeadFollowUpEmailProps {
  leadName: string;
  serviceType: string;
  leadMessage?: string;
  bookConsultationUrl?: string;
  portfolioUrl?: string;
}

export default function LeadFollowUpEmail({
  leadName = 'Valued Customer',
  serviceType = 'Interior Design Services',
  leadMessage = '',
  bookConsultationUrl = 'https://pasada.in/book-consultation',
  portfolioUrl = 'https://pasada.in/projects',
}: LeadFollowUpEmailProps) {
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
            <Heading style={h1}>Thank You for Reaching Out!</Heading>

            <Text style={text}>Hello {leadName},</Text>

            <Text style={text}>
              Thank you for contacting PASADA Interior Design. We received your inquiry about{' '}
              <strong>{serviceType}</strong> and are excited to help transform your space.
            </Text>

            {leadMessage && (
              <Section style={messageBox}>
                <Text style={messageLabel}>Your Message:</Text>
                <Text style={messageText}>"{leadMessage}"</Text>
              </Section>
            )}

            <Text style={text}>
              Our expert design team will review your requirements and get back to you within{' '}
              <strong>24 hours</strong> with a personalized consultation plan.
            </Text>

            {/* What's Next Section */}
            <Section style={stepsBox}>
              <Heading style={h2}>What Happens Next?</Heading>

              <Section style={step}>
                <Text style={stepNumber}>1</Text>
                <Text style={stepText}>
                  <strong>Initial Review</strong>
                  <br />
                  Our team reviews your requirements and project details
                </Text>
              </Section>

              <Section style={step}>
                <Text style={stepNumber}>2</Text>
                <Text style={stepText}>
                  <strong>Personalized Consultation</strong>
                  <br />
                  We'll contact you to schedule a detailed discussion
                </Text>
              </Section>

              <Section style={step}>
                <Text style={stepNumber}>3</Text>
                <Text style={stepText}>
                  <strong>Custom Quotation</strong>
                  <br />
                  Receive a tailored quotation based on your vision
                </Text>
              </Section>
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonContainer}>
              <Button style={primaryButton} href={bookConsultationUrl}>
                Book Free Consultation
              </Button>
              <Button style={secondaryButton} href={portfolioUrl}>
                View Our Portfolio
              </Button>
            </Section>

            <Text style={text}>
              In the meantime, explore our portfolio to see how we've helped clients create their
              dream spaces. From modern kitchens to elegant living rooms, we bring your vision
              to life.
            </Text>
          </Section>

          {/* Why Choose PASADA Section */}
          <Section style={featuresBox}>
            <Heading style={h2}>Why Choose PASADA?</Heading>

            <Section style={feature}>
              <Text style={featureIcon}>✓</Text>
              <Text style={featureText}>
                <strong>15+ Years Experience</strong> in interior design
              </Text>
            </Section>

            <Section style={feature}>
              <Text style={featureIcon}>✓</Text>
              <Text style={featureText}>
                <strong>100+ Projects</strong> delivered across Bangalore
              </Text>
            </Section>

            <Section style={feature}>
              <Text style={featureIcon}>✓</Text>
              <Text style={featureText}>
                <strong>End-to-End Service</strong> from design to installation
              </Text>
            </Section>

            <Section style={feature}>
              <Text style={featureIcon}>✓</Text>
              <Text style={featureText}>
                <strong>Premium Materials</strong> with manufacturer warranties
              </Text>
            </Section>
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
              {' | '}
              <Link href="tel:+917090004945" style={link}>
                +91 7090004945
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

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  marginBottom: '16px',
  marginTop: '0',
};

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const messageBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e8e8e8',
  borderLeft: '4px solid #d4af37',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const messageLabel = {
  color: '#8898aa',
  fontSize: '12px',
  fontWeight: '600',
  marginBottom: '8px',
};

const messageText = {
  color: '#525f7f',
  fontSize: '14px',
  fontStyle: 'italic',
  lineHeight: '20px',
  margin: '0',
};

const stepsBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const step = {
  display: 'flex' as const,
  alignItems: 'flex-start' as const,
  marginBottom: '16px',
};

const stepNumber = {
  backgroundColor: '#d4af37',
  color: '#ffffff',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: '700',
  marginRight: '12px',
  flexShrink: 0,
};

const stepText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingTop: '4px',
};

const featuresBox = {
  padding: '24px 32px',
  backgroundColor: '#f8f9fa',
};

const feature = {
  display: 'flex' as const,
  alignItems: 'flex-start' as const,
  marginBottom: '12px',
};

const featureIcon = {
  color: '#d4af37',
  fontSize: '20px',
  marginRight: '12px',
  flexShrink: 0,
};

const featureText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const primaryButton = {
  backgroundColor: '#d4af37',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  marginRight: '8px',
  marginBottom: '8px',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '2px solid #d4af37',
  borderRadius: '4px',
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 30px',
  marginLeft: '8px',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#e8e8e8',
  margin: '16px 0',
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
