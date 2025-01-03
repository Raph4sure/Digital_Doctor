const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const ejs = require("ejs");
const path = require("path");

dotenv.config({ path: "./config.env" });

// Set SendGrid API Key
const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
    console.error("SENDGRID_API_KEY is not set in config.env");
}
sgMail.setApiKey(apiKey);

exports.sendEmail = async (to, subject, templatePath, templateData) => {
    try {
        // Logging the input parameters
        console.log("Sending email with params:", {
            to,
            subject,
            templatePath,
            templateData,
        });

        // Verifying sender email is configured
        const senderEmail = process.env.SENDER_EMAIL;
        if (!senderEmail) {
            throw new Error("SENDER_EMAIL is not configured in config.env");
        }

        // Render template
        const fullTemplatePath = path.join(__dirname, "../views", templatePath);
        console.log("Template path:", fullTemplatePath);

        const template = await ejs.renderFile(fullTemplatePath, templateData);

        const msg = {
            to: to,
            from: {
                email: senderEmail,
                name: "Digital Doctor",
            },
            subject: subject,
            html: template,
        };

        // Log the message being sent (excluding html content for brevity)
        console.log("Sending email message:", {
            to: msg.to,
            from: msg.from,
            subject: msg.subject,
        });

        const response = await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
        return response;
    } catch (error) {
        // Log detailed error information
        console.error("Email sending error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
            response: error.response?.body,
            stack: error.stack,
        });

        throw error; // Throw the original error to preserve error details
    }
};
