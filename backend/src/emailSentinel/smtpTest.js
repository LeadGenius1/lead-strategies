// SMTP connection test (port from lib/email-smtp/smtp-handler)
const nodemailer = require('nodemailer');

async function testSmtpConnection(config) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: { user: config.username, pass: config.password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified successfully' };
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error.message || 'Unknown error'}`,
      details: { code: error.code, command: error.command },
    };
  }
}

module.exports = { testSmtpConnection };
