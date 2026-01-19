const {client,sender} = require("./mailtrap.js");
const { VERIFICATION_EMAIL_TEMPLATE} = require("./emailTemplates.js")
exports.sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    throw new Error(`error sending verification email : ${error.message}`);
  }
};

exports.sendWelcomeEmail = async (email, username) => {
  const recipients = [{ email }];

  try {
    const response = await client.send({
      from: sender,
      to: recipients,
      template_uuid: "dba2c838-01d0-4320-ba09-c65007a1abae",
      template_variables: {
        company_info_name: "Learnify",
        name: username,
      },
    });

    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error("Error sending welcome email", error);
    throw new Error("Error sending welcome email");
  }
};

