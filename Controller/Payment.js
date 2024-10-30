const { Cashfree } = require("cashfree-pg");

const axios = require('axios');

// Import models
const User = require("../Models/User");
const PaymentOrder = require("../Models/PaymentOrder");
const { sentOtp } = require("./Phone");
const createOrder = async (req, res) => {
  const options = {
    method: 'POST',
    url: process.env.CASHFREE_PORT,
    headers: {
      accept: 'application/json',
      'x-api-version': '2023-08-01',
      'content-type': 'application/json',
      'x-client-id': process.env.CASHFREE_CLIENT_ID,
      'x-client-secret': process.env.CASHFREE_CLIENT_SECRET
    },
    data: {
      customer_details: {
        customer_id: req.body.customer_details.customer_id,
        customer_phone: req.body.customer_details.customer_phone,
        customer_name: req.body.customer_details.customer_name,
        customer_email: req.body.customer_details.customer_email
      },
      order_id: req.body.order_id,
      order_currency: req.body.order_currency,
      order_amount: req.body.order_amount,
      order_meta: {
        return_url: req.body.order_meta.return_url,
        notify_url: req.body.order_meta.notify_url,
        payment_methods: req.body.order_meta.payment_methods
      },
      order_expiry_time: req.body.order_expiry_time
    }
  };

  console.log('Order payload is ', options.data);

  try {
    // Make the request to Cashfree
    const resp = await axios.request(options);

    // Prepare data for saving to the database
    const orderToSave = {
      order_amount: options.data.order_amount,
      order_currency: options.data.order_currency,
      order_id: options.data.order_id,
      customer_id: options.data.customer_details.customer_id,
      order_meta: options.data.order_meta,
      order_expiry_time: options.data.order_expiry_time
    };

    // Save the order to the database
    const data = new PaymentOrder(orderToSave);
    await data.save();

    // Return response to the frontend
    return res.status(200).json(resp.data);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ msg: 'Error in creating payment order' });
  }
};

const updateBalance = async (user_id,amount)=>{
  try {
    // Update user's wallet balance by incrementing it with the specified amount
    const result = await User.updateOne(
      { _id: user_id },
      { $inc: { walletbalance: amount } }
    );

    if (result.nModified > 0) {
      console.log("User balance updated successfully.");
      return { success: true, message: "User balance updated successfully." };
    } else {
      console.log("No matching user found or no changes made.");
      return { success: false, message: "No matching user found or no changes made." };
    }
  } catch (error) {
    console.error("Error updating balance:", error.message);
    return { success: false, message: "Error updating balance." };
  }
}
const updateOrderStatus = async (req, res) => {
  console.log('update order status is running..');
  const orderId = req.body.orderId;
  console.log(orderId);

  try {
    const order = await PaymentOrder.findOne({ order_id: orderId }); // Use the correct model name
    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': process.env.CASHFREE_CLIENT_ID,
      'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
      'x-api-version': '2023-08-01'
    };

    // Make the request to Cashfree API
    const response = await axios.get(`${process.env.CASHFREE_PORT}/orders/${orderId}/payments`, {
      headers,
    });

    console.log(response.data);
    let resp1;
    let resp2;

    if (response.data[0].payment_status === 'SUCCESS') {
      resp1 = await PaymentOrder.updateOne(
        { order_id: orderId },
        { $set: { order_status: 'SUCCESS' } }
      );
      resp2 = await updateBalance(req.user,order.order_amount)
    } else {
      resp1 = await PaymentOrder.updateOne(
        { order_id: orderId },
        { $set: { order_status: 'FAILED' } }
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(401).json({ msg: 'Error in fetching order status' });
  }
};
const claimPayment = async (req, res) => {
  const orderId = req.body.order_id;

  try {
    // Find the payment order by order_id
    const order = await PaymentOrder.findOne({ order_id: orderId });

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is already claimed
    if (order.isClaimed) {
      return res.status(400).json({ message: 'Order has already been claimed' });
    }
    
    // Update the order to mark it as claimed and under review
    order.isClaimed = true;
    order.claim_status = 'Under review';
    await order.save();

    return res.status(200).json({ message: 'Claim submitted successfully', order });
  } catch (error) {
    console.error("Error in claiming payment:", error);
    return res.status(500).json({ message: 'Error in claiming payment' });
  }
};
module.exports = { createOrder, updateOrderStatus,claimPayment };
