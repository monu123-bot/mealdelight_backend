const { Cashfree } = require("cashfree-pg");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const axios = require('axios');

// Import models
const User = require("../models/User");
const PaymentOrder = require("../Models/PaymentOrder");

const createOrder = async (req, res) => {
  Cashfree.XClientId = `${process.env.CASHFREE_CLIENT_ID_TEST}`;
  Cashfree.XClientSecret = `${process.env.CASHFREE_CLIENT_SECRET_TEST}`;
  Cashfree.XEnvironment = `${process.env.CASHFREE_ENVIRONMENT}`;

  var request = req.body;

  try {
    const resp = await Cashfree.PGCreateOrder("2023-08-01", request);
    const orderToSave = {
      order_amount: request.order_amount,
      order_currency: request.order_currency,
      order_id: request.order_id,
      customer_id: request.customer_details.customer_id,
      order_meta: request.order_meta,
      order_expiry_time: request.order_expiry_time
    };

    const data = new PaymentOrder(orderToSave); // Use the correct model name
    const resp1 = await data.save();
    return res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Error in creating payment order" });
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
      'x-client-id': process.env.CASHFREE_CLIENT_ID_TEST,
      'x-client-secret': process.env.CASHFREE_CLIENT_SECRET_TEST,
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

module.exports = { createOrder, updateOrderStatus };
