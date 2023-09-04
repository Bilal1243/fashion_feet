const express = require("express");
const Order = require('../model/orderModel')
const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_nlgPsMqEBJ4P3a",
  key_secret: "MOoTvJv0ybR9Tef0mrZZ6q09",
});

const generateRazorpay = async (orderid) => {
  try {
    const findOrder = await Order.findOne({_id : orderid})
    const price = findOrder.totalprice
    const order = await instance.orders.create({
      amount: price * 100,
      currency: "INR",
      receipt: ""+orderid,
    });
    return order
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  generateRazorpay,
};
