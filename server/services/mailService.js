import nodemailer from "nodemailer";
import SmtpConfig from "../models/SmtpConfig.js";
import EmailLog from "../models/EmailLog.js";
import { decryptPassword } from "../utils/smtpCrypto.js";
import { renderTemplate } from "../utils/templateRenderer.js";

/**
 * Mail Service to handle sending emails using project-specific SMTP settings.
 */
class MailService {
  /**
   * Send a templated email.
   * @param {Object} options
   * @param {string} options.projectId
   * @param {string} options.to
   * @param {Object} options.template - EmailTemplate model instance
   * @param {Object} options.variables
   */
  async sendTemplatedEmail({ projectId, to, template, variables = {} }) {
    const smtpConfig = await SmtpConfig.findOne({ project: projectId, isActive: true });

    if (!smtpConfig) {
      throw new Error("No active SMTP configuration found for this project.");
    }

    const decryptedPassword = decryptPassword({
      encryptedPassword: smtpConfig.encryptedPassword,
      iv: smtpConfig.iv,
      tag: smtpConfig.tag,
    });

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: decryptedPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const renderedHtml = renderTemplate(template.html, variables);
    const renderedSubject = renderTemplate(template.subject, variables);

    const log = new EmailLog({
      project: projectId,
      template: template._id,
      to,
      subject: renderedSubject,
      variables,
      status: "pending",
    });

    try {
      const info = await transporter.sendMail({
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
        to,
        subject: renderedSubject,
        html: renderedHtml,
      });

      log.status = "sent";
      log.messageId = info.messageId;
      await log.save();

      return { success: true, messageId: info.messageId };
    } catch (error) {
      log.status = "failed";
      log.error = error.message;
      await log.save();

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send a direct email without a template.
   * @param {Object} options
   */
  async sendDirectEmail({ projectId, to, subject, html }) {
    const smtpConfig = await SmtpConfig.findOne({ project: projectId, isActive: true });

    if (!smtpConfig) {
      throw new Error("No active SMTP configuration found for this project.");
    }

    const decryptedPassword = decryptPassword({
      encryptedPassword: smtpConfig.encryptedPassword,
      iv: smtpConfig.iv,
      tag: smtpConfig.tag,
    });

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.username,
        pass: decryptedPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const log = new EmailLog({
      project: projectId,
      to,
      subject,
      status: "pending",
    });

    try {
      const info = await transporter.sendMail({
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
        to,
        subject,
        html,
      });

      log.status = "sent";
      log.messageId = info.messageId;
      await log.save();

      return { success: true, messageId: info.messageId };
    } catch (error) {
      log.status = "failed";
      log.error = error.message;
      await log.save();
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }


  /**
   * Test SMTP connection.
   * @param {Object} config - Raw SMTP configuration
   */
  async testConnection(config) {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      await transporter.verify();
      return { success: true, message: "SMTP connection successful" };
    } catch (error) {
      throw new Error(`SMTP connection failed: ${error.message}`);
    }
  }
}

export default new MailService();
