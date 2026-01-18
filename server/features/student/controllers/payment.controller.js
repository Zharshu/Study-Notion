const paymentService = require('../services/payment.service');
const { successResponse } = require('../../../shared/utils/responseHandler');

/**
 * Capture Payment Controller
 * Initiate Razorpay order for course purchase
 */
exports.capturePayment = async (req, res, next) => {
  try {
    const { courses } = req.body;
    const userId = req.user.id;
    
    const result = await paymentService.capturePayment(courses, userId);
    return successResponse(res, 200, 'Order created successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Payment Controller
 * Verify Razorpay payment signature and enroll student
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courses } = req.body;
    const userId = req.user.id;
    
    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    
    const result = await paymentService.verifyPayment(paymentData, courses, userId);
    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Send Payment Success Email Controller
 * Send confirmation email after successful payment
 */
exports.sendPaymentSuccessEmail = async (req, res, next) => {
  try {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;
    
    const paymentInfo = { orderId, paymentId, amount };
    await paymentService.sendPaymentSuccessEmail(paymentInfo, userId);
    
    return successResponse(res, 200, 'Payment success email sent');
  } catch (error) {
    next(error);
  }
};
