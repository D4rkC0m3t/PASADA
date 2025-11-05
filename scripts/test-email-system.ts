/**
 * PASADA CRM - Email System Test Script
 * Run this to test the complete email system functionality
 * 
 * Usage: 
 * node --loader ts-node/esm scripts/test-email-system.ts
 * OR
 * tsx scripts/test-email-system.ts
 */

import { sendEmail, processTemplate, getEmailLogs } from '../lib/email/service';

// ================================================
// TEST CONFIGURATION
// ================================================

const TEST_CONFIG = {
  // Change this to your test email
  testEmail: 'your-email@example.com',
  
  // Mock data for testing
  mockData: {
    client: {
      name: 'Test Client',
      email: 'test-client@example.com',
    },
    project: {
      name: 'Test Modern Kitchen',
      id: '00000000-0000-0000-0000-000000000001',
    },
    quotation: {
      number: 'PASADA-2025-TEST-001',
      total: '₹2,50,000',
      valid_until: '30 days',
      id: '00000000-0000-0000-0000-000000000002',
    },
    lead: {
      name: 'Test Lead',
      email: 'test-lead@example.com',
      service: 'Modular Kitchen Design',
      id: '00000000-0000-0000-0000-000000000003',
    },
  },
};

// ================================================
// TEST FUNCTIONS
// ================================================

async function testTemplateProcessing() {
  console.log('\n📋 TEST 1: Template Processing');
  console.log('================================');

  try {
    const result = await processTemplate({
      template_name: 'Quotation Email',
      merge_tags: {
        client: { name: TEST_CONFIG.mockData.client.name },
        project: { name: TEST_CONFIG.mockData.project.name },
        quotation: {
          number: TEST_CONFIG.mockData.quotation.number,
          total: TEST_CONFIG.mockData.quotation.total,
          valid_until: TEST_CONFIG.mockData.quotation.valid_until,
        },
      },
    });

    console.log('✅ Template processed successfully');
    console.log('Subject:', result.subject);
    console.log('HTML length:', result.html.length, 'characters');
    console.log('Template name:', result.template_name);
    
    return true;
  } catch (error: any) {
    console.error('❌ Template processing failed:', error.message);
    return false;
  }
}

async function testEmailSending() {
  console.log('\n📧 TEST 2: Email Sending');
  console.log('================================');

  try {
    const result = await sendEmail(
      {
        to: TEST_CONFIG.testEmail,
        subject: 'PASADA CRM - Test Email',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1 style="color: #d4af37;">Test Email</h1>
              <p>This is a test email from PASADA CRM Email System.</p>
              <p>If you received this, the email system is working correctly! 🎉</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                Sent at: ${new Date().toLocaleString('en-IN')}
              </p>
            </body>
          </html>
        `,
        text: 'This is a test email from PASADA CRM Email System.',
        email_type: 'custom',
        tags: ['test', 'system_check'],
      },
      {
        trigger_action: 'manual',
      }
    );

    if (result.success) {
      console.log('✅ Email sent successfully');
      console.log('Email ID:', result.email_id);
      console.log('Resend ID:', result.resend_id);
      return result.email_id;
    } else {
      console.error('❌ Email sending failed:', result.error);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Email sending error:', error.message);
    return null;
  }
}

async function testQuotationEmail() {
  console.log('\n💰 TEST 3: Quotation Email Template');
  console.log('================================');

  try {
    const emailContent = await processTemplate({
      template_name: 'Quotation Email',
      merge_tags: {
        client: { name: TEST_CONFIG.mockData.client.name },
        project: { name: TEST_CONFIG.mockData.project.name },
        quotation: {
          number: TEST_CONFIG.mockData.quotation.number,
          total: TEST_CONFIG.mockData.quotation.total,
          valid_until: TEST_CONFIG.mockData.quotation.valid_until,
        },
        portal: {
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://pasada.in/client/dashboard',
        },
      },
    });

    const result = await sendEmail(
      {
        to: TEST_CONFIG.testEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        quotation_id: TEST_CONFIG.mockData.quotation.id,
        project_id: TEST_CONFIG.mockData.project.id,
        email_type: 'quotation',
        tags: ['test', 'quotation'],
      },
      {
        trigger_action: 'manual',
      }
    );

    if (result.success) {
      console.log('✅ Quotation email sent successfully');
      console.log('Email ID:', result.email_id);
      return true;
    } else {
      console.error('❌ Quotation email failed:', result.error);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Quotation email error:', error.message);
    return false;
  }
}

async function testLeadFollowUpEmail() {
  console.log('\n👋 TEST 4: Lead Follow-up Email Template');
  console.log('================================');

  try {
    const emailContent = await processTemplate({
      template_name: 'Lead Follow-up',
      merge_tags: {
        lead: {
          name: TEST_CONFIG.mockData.lead.name,
          service: TEST_CONFIG.mockData.lead.service,
        },
        company: {
          name: 'PASADA Interior Design',
          email: 'pasada.groups@gmail.com',
          phone: '+91 7090004948',
        },
      },
    });

    const result = await sendEmail(
      {
        to: TEST_CONFIG.testEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        lead_id: TEST_CONFIG.mockData.lead.id,
        email_type: 'follow_up',
        tags: ['test', 'lead_follow_up'],
      },
      {
        trigger_action: 'manual',
      }
    );

    if (result.success) {
      console.log('✅ Lead follow-up email sent successfully');
      console.log('Email ID:', result.email_id);
      return true;
    } else {
      console.error('❌ Lead follow-up email failed:', result.error);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Lead follow-up email error:', error.message);
    return false;
  }
}

async function testEmailLogs() {
  console.log('\n📊 TEST 5: Email Logs Retrieval');
  console.log('================================');

  try {
    const logs = await getEmailLogs({
      limit: 10,
    });

    console.log('✅ Email logs retrieved successfully');
    console.log('Total logs:', logs.length);
    
    if (logs.length > 0) {
      console.log('\nRecent emails:');
      logs.slice(0, 5).forEach((log, index) => {
        console.log(`${index + 1}. ${log.to_email} - ${log.subject} [${log.status}]`);
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Email logs retrieval failed:', error.message);
    return false;
  }
}

// ================================================
// RUN ALL TESTS
// ================================================

async function runAllTests() {
  console.log('\n🚀 PASADA CRM - Email System Tests');
  console.log('====================================');
  console.log('Test email:', TEST_CONFIG.testEmail);
  console.log('====================================');

  const results = {
    templateProcessing: await testTemplateProcessing(),
    emailSending: await testEmailSending(),
    quotationEmail: await testQuotationEmail(),
    leadFollowUpEmail: await testLeadFollowUpEmail(),
    emailLogs: await testEmailLogs(),
  };

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================================');
  console.log('Template Processing:', results.templateProcessing ? '✅ PASS' : '❌ FAIL');
  console.log('Email Sending:', results.emailSending ? '✅ PASS' : '❌ FAIL');
  console.log('Quotation Email:', results.quotationEmail ? '✅ PASS' : '❌ FAIL');
  console.log('Lead Follow-up Email:', results.leadFollowUpEmail ? '✅ PASS' : '❌ FAIL');
  console.log('Email Logs:', results.emailLogs ? '✅ PASS' : '❌ FAIL');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  console.log('\n================================');
  console.log(`Tests Passed: ${passedTests}/${totalTests}`);
  console.log('================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Email system is fully operational.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }

  return passedTests === totalTests;
}

// ================================================
// EXECUTE
// ================================================

if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { runAllTests };
