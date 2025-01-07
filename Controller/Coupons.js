
const Coupon = require('../Models/Coupon');

const verifyCoupon = async (req, res) => {
    const name = req.query.name;

    try {
        // Find a coupon whose name matches the provided name
        const coupon = await Coupon.findOne({ name:name }); // case-insensitive prefix match

        if (coupon) {
            // If a coupon is found, return it without an error status
            return res.status(200).json(coupon);
        } else {
            // If no coupon is found, return a 404 status with a message
            return res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        // Log the error for debugging
        console.error('Error verifying coupon:', error.message);
        // Return a 500 status for internal server error
        return res.status(500).json({ message: 'Internal server error' });
    }
};

  module.exports = {verifyCoupon};
