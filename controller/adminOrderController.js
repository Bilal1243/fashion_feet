const mongoose = require("mongoose");
const Order = require("../model/orderModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");

const loadOrderPage = async (req, res) => {
  try {
    const order = await Order.find({});
    order.reverse()
    const itemsperpage = 5;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(order.length / 5);
    const currentproduct = order.slice(startindex,endindex);
    res.render("orderHistory", { order: currentproduct , totalpages , currentpage});
  } catch (error) {
    console.log(error);
  }
};

const loadOrderDetails = async (req, res) => {
  try {
    const order_id = req.query.orderid;
    const user_id = req.query.userid;
    const findUser = await User.findOne({ _id: user_id });
    if (findUser) {
      const order = await Order.findOne({ _id: order_id });
      const address_id = await order.order_Address;
      const address = await findUser.addresses.find((address_find) => {
        return address_find._id.toString() === address_id.toString();
      });
      const formattedDate = new Date().toLocaleDateString();
      res.render("orderDetails", {
        user: findUser,
        address: address,
        order: order,
        product: order.orders,
        date: formattedDate,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const changeStatus = async (req, res) => {
  try {
    const status = req.body.status;
    const orderid = req.params.id;
    const userid = req.params.userid;
    const findUser = await User.findOne({ _id: userid });
    if (findUser) {
      const updatedOrder = await Order.updateOne(
        {
          _id: orderid,
        },
        {
          $set: { "delivery_status": status },
        }
      );
      res.redirect("/admin/order-manage");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadOrderPage,
  loadOrderDetails,
  changeStatus,
};
