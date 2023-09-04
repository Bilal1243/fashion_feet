const mongoose = require('mongoose')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Cart = require('../model/cartModel')


const updatecart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    // console.log(userid);
    const productId = req.params.id;
    //  console.log(productId);
    const newquantity = req.body.quantity;
    // console.log(newquantity);

    const product = await Product.findOne({ _id: productId });
    // console.log(product);

    const cart = await Cart.findOne({ user_id : userid });
    // console.log(cart);
    let sum = 0;
    const existingcartitem = await cart.cart_items.find((items) => {
      return items.product_id.toString() === product._id.toString();
    });
    let price = existingcartitem.quantity * existingcartitem.offer_price;
    let cartT = 0
    cart.cart_items.forEach((item) => {
      cartT += item.quantity * item.offer_price;
    });
    // console.log(existingcartitem);
    if(newquantity > product.stock){
      return res.send({ status: false,totalPrice : price,cartTotal : cartT});
    }

    if (existingcartitem) {
      existingcartitem.quantity = newquantity;
      await cart.save();
    } else {
      console.log("no item");
    }
    var stock = true
    if(product.stock < existingcartitem.quantity){
      stock = false
    }
    else{
      stock = true
    }
    await product.save()
    //  console.log(existingcartitem);
    const totalPrice = existingcartitem.quantity * existingcartitem.offer_price;
   
    let cartTotal = 0;

    cart.cart_items.forEach((item) => {
      cartTotal += item.quantity * item.offer_price;
    });

    res.send({ status: true, totalPrice: totalPrice, cartTotal: cartTotal ,stock : stock});
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  updatecart
};
