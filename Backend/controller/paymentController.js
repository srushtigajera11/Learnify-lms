const instance = require('../utils/razorpayInstance');
exports.createOrder = async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount * 100,  // Convert to paise
            currency: 'INR',  // Assuming INR, change if needed
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        console.log("Order created:", order);
        res.status(200).json({ success: true, order});
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getKey  = async (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
}
