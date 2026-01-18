const mailSender = require('../../../shared/utils/email/emailSender');
const { contactUsEmail } = require('../../../shared/utils/email/templates/contactFormRes');

/**
 * Handle Contact Us Form Submission
 * @param {Object} contactData - Form data
 * @returns {Object} Success message
 */
exports.contactUs = async (contactData) => {
  const { email, firstname, lastname, message, phoneNo, countrycode } = contactData;

  // Send email to user
  await mailSender(
    email,
    "Your Data sent successfully",
    contactUsEmail(email, firstname, lastname, message, phoneNo, countrycode)
  );
  
  // Optionally send email to admin (not implemented here but good practice)

  return { message: "Email sent successfully" };
};
