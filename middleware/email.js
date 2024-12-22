const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const ejs = require("ejs");
const path = require("path");

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, subject, templatePath, templateData) => {
    try {
        const template = await ejs.renderFile(
            path.join(__dirname, "../views", templatePath),
            templateData
        );

        // console.log("Rendered Template:", template);

        const msg = {
            to,
            from: "Digital Doctor", 
            subject,
            html: template,
        };

        await sgMail.send(msg);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};
