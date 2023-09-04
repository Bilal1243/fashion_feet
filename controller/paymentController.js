const mongoose = require("mongoose");
const User = require("../model/userModel");
const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const Order = require("../model/orderModel");
const Wallet = require("../model/walletModel");
const paymentHelper = require("../Helpers/paymentHelper");
const Coupons = require('../model/couponModel')

const loadPaymentSelect = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const address_id = req.query.id;
    const today = new Date();
    const price = parseFloat(req.query.price);
    const findCoupons = await Coupons.find({
      $and: [
        { min_price: { $lte: price } },
        { max_price: { $gte: price } },
        { start: { $lte: today } },
        { validity: { $gte: today } },
        { used_by: { $nin: [req.session.user_id] } }
      ],
    });
    let used = false
    if(req.query.useby){
      used = true
    }
    let cp = null
    if(req.query.coupon){
      cp = req.query.coupon
    }
   const findUser = await User.findOne({ _id: userid });
    let findwallet = await Wallet.findOne({ user_id: userid });
    if (!findwallet) {
      findwallet = null;
    }
    const finded = await findUser.addresses.find((address) => {
      return address._id.toString() == address_id.toString();
    });
    if (req.query.product_id) {
      const product_id = req.query.product_id;
      const findProduct = await Product.findOne({ _id: product_id });
      return res.render("paymentSelection", {
        address_details: finded,
        totalprice: req.query.price,
        cart: findProduct,
        wallet: findwallet,
        coupons : findCoupons,
        is_single: true,
        used,
        coupon : cp
     });
    }
    const findCart = await Cart.findOne({ user_id: userid });
    const cart = findCart.cart_items;
    const cartid = findCart._id;
    if (finded) {
      res.render("paymentSelection", {
        address_details: finded,
        cart,
        totalprice: req.query.price,
        wallet: findwallet,
        is_single: false,
        coupons : findCoupons,
        cartid,
        used,
        coupon : cp
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const applyWallet = async (req, res) => {
  try {
    let totalprice = parseFloat(req.query.price); // Convert to number
    const findWallet = await Wallet.findOne({ user_id: req.session.user_id });
    
    if (!findWallet) {
      return res.status(400).send("Wallet not found");
    }
    let remainingBalance = findWallet.balance;
      totalprice -= remainingBalance;
      findWallet.balance = 0;
    
    await findWallet.save();
    const redirectUrl = req.query.product_id
      ? `/loadPaySelection?product_id=${req.query.product_id}&price=${totalprice}&id=${req.query.id}`
      : `/loadPaySelection?price=${totalprice}&id=${req.query.id}`;
      
    res.redirect(redirectUrl);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const applyCoupon = async(req,res) => {
  try {
    let totalprice = parseFloat(req.query.price); // Convert to number
    const coupon = await Coupons.findOne({coupon : req.query.coupon})
    
    if (!coupon) {
      if(req.query.product_id){
        return res.json({nostatus : true,product_id : req.query.product_id,price : req.query.price,id : req.query.id});
      }
      else{
        res.json({nostatus : true,price : req.query.price,id : req.query.id});
      }
    }
    else{
      let used = false
      for(let i =0 ; i<coupon.used_by.length;i++){
        if(req.session.user_id === coupon.used_by[i]){
          used = true
          break
        }
      }
      if(used === true){
        if(req.query.product_id){
          return res.json({status : false,product_id : req.query.product_id,price : req.query.price,id : req.query.id});
        }
        else{
          res.json({status : false,price : req.query.price,id : req.query.id});
        }
      }
      else{
        totalprice -= coupon.offer
      if(req.query.product_id){
        return res.json({status : true,product_id : req.query.product_id,price : totalprice,id : req.query.id,useby : true,coupon : req.query.coupon});
      }
      else{
        res.json({status : true,price : totalprice,id : req.query.id,useby : true,coupon : req.query.coupon});
      }
      }
    }

  } catch (error) {
    
  }
}


const order = async (req, res) => {
  try {
    const a_id = req.query.aid;
    const user_id = req.session.user_id;
    const totalprice = req.query.total;
    const findUser = await User.findOne({ _id: user_id });
    const findAddress = await findUser.addresses.find((address) => {
      return address._id.toString() === a_id.toString();
    });
    if(req.body.coupon){
      const findCoupon = await Coupons.findOne({coupon : req.body.coupon})
      findCoupon.used_by.push(req.session.user_id)
      await findCoupon.save()
    }
    const date = new Date();
    var orderId;

    const formattedDate = new Date()
    if (req.body.product_id) {
      const id = req.body.product_id;
      const findProduct = await Product.findOne({ _id: id });
      if (findProduct) {
        if(findProduct.stock === 0){
          return res.json({poutOfStock : true,product : id})
        }
        const addOrder = {
          product_id: req.body.product_id,
          product_name: findProduct.product_name,
          product_price: findProduct.offer_price,
          product_qauntity: 1,
          product_image: findProduct.image[0],
        };
        const newadd = new Order({
          user_id: req.session.user_id,
          user_name: findUser.name,
          order_Address: findAddress._id,
          order_date: formattedDate,
          totalprice: totalprice,
          delivery_status: "Pending",
          payment_type: req.body.payment_type,
          orders: [],
        });
        newadd.orders.push(addOrder);
        await newadd.save();
        if (!(findProduct.stock <= 0)) {
          findProduct.stock -= 1
          await findProduct.save();
        } else {
          findProduct.stock = 0;
          await findProduct.save();
        }
        orderId = newadd._id;
      }
    }

    if (req.body.cart_id) {
      const id = req.body.cart_id;
      const findcart = await Cart.findOne({ _id: id });
      if (findcart) {
        if (!findcart) {
          console.log('Cart not found for the user.');
          return;
        }
    
        let foundOutOfStock = 0;
    
        for (const cartItem of findcart.cart_items) {
          const product = await Product.findById(cartItem.product_id);
          if (!product) {
            console.log(`Product with ID ${cartItem.product_id} not found.`);
            continue;
          }
    
          if (product.stock === 0 || cartItem.quantity > product.stock) {
            foundOutOfStock++;
            console.log(`Product '${product.product_name}' is out of stock.`);
          }
        }
        if(foundOutOfStock > 0){
          return res.json({outOfStock : true})
        }

        const ordersArray = [];

        for (const item of findcart.cart_items) {
          const addOrder = {
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.offer_price ,
            product_qauntity: item.quantity,
            product_image: item.image,
          };
          ordersArray.push(addOrder);
        }
        const newOrder = new Order({
          user_id: req.session.user_id,
          user_name: findUser.name,
          order_Address: findAddress._id,
          order_date: formattedDate,
          totalprice: totalprice,
          delivery_status: "Pending",
          payment_type: req.body.payment_type,
          orders: ordersArray,
        });
        // newOrder.orders.push()
        await newOrder.save();
        orderId = newOrder._id;
          for (const cartItem of findcart.cart_items) {
          const dcStock = await Product.updateOne({_id : cartItem.product_id},{$inc : {stock : -cartItem.quantity}});
          }
      }
      const findCart = await Cart.findOne({ user_id: req.session.user_id });
      req.session.cart = [];
      const cartItemsAsObjects = JSON.parse(
        JSON.stringify(findCart.cart_items)
      );
      req.session.cart.push(...cartItemsAsObjects);
      req.session.save();
      findCart.cart_items.splice(0, findCart.cart_items.length);
      await findCart.save();
    }

    if (req.body.payment_type === "Razorpay") {
      const order = await paymentHelper.generateRazorpay(orderId);
        res.json({
          order,
          findUser,
          Razorpay: true,
        });
      }
      else if (req.body.payment_type === "Wallet") {
        const history = {
          from: orderId,
          price: "-₹" + totalprice,
          date: new Date(),
        };
        const wallet = await Wallet.updateOne(
          { user_id: user_id },
          { $inc: { balance: -totalprice } }
        );
        const findWallet = await Wallet.findOne({ user_id: user_id });
        findWallet.history.push(history);
        await findWallet.save();
        res.json({
          codStatus: true,
          aid: req.query.aid,
          pay_type: req.body.payment_type,
          order_id: orderId,
          walletstatus : true
        });
      }else {
      res.json({
        codStatus: true,
        aid: req.query.aid,
        pay_type: req.body.payment_type,
        order_id: orderId,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { payment, order } = req.body;
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", "MOoTvJv0ybR9Tef0mrZZ6q09")
      .update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
      .digest("hex");

    if (hash === payment.razorpay_signature) {
      const findOrder = await Order.findOne({ _id: order.receipt });

      const user = await User.findOne({ _id: req.session.user_id });
      if (findOrder) {
        const address_id = findOrder.order_Address;
        const updatedOrder = await Order.updateOne(
          {
            _id: order.receipt,
          },
          {
            $set: { "delivery_status": "Confirmed" },
          }
        );
        res.json({
          output: true,
          orderid: findOrder._id,
          aid: address_id,
        });
      }
    } else {
      res.json({
        output: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadOrderSummary = async (req, res) => {
  try {
    const address_id = req.query.aid;
    const user = await User.findOne({ _id: req.session.user_id });
    const findAddress = await user.addresses.find((address) => {
      return address._id.toString() === address_id.toString();
    });
    if (req.query.status === true) {
      const findOrder = await Order.findOne({ _id: req.query.order_id });
      if (findOrder.orders[0].payment_type === "Wallet") {
        const updatedOrder = await Order.updateOne(
          {
            _id: req.query.order_id,
          },
          {
            $set: { "delivery_status": "Confirmed" },
          }
        );
      }
    }
    const findOrder = await Order.findOne({_id : req.query.order_id})
    if(findOrder){
      res.render('order-summary',{
        user : user,
        order : findOrder.orders,
        address : findAddress,
        pay_type : findOrder.payment_type,
        totalprice : findOrder.totalprice
      })
    }

  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadPaymentSelect,
  applyWallet,
  applyCoupon,
  order,
  loadOrderSummary,
  verifyPayment,
};
