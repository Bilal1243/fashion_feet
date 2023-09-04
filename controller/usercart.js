const mongoose = require("mongoose");
const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");

const addToCart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const product_id = req.query.id;
    const product = await Product.findById({ _id: product_id });
    const cart_items = {
      product_id: product_id,
      product_name: product.product_name,
      ideal_for: product.ideal_for,
      offer_price: product.offer_price,
      quantity: 1,
      image: product.image[0],
    };
    const findCart = await Cart.findOne({ user_id: user_id });
    if (findCart) {
      const existItem = await findCart.cart_items.find((item) => {
        return item.product_id.toString() === product_id.toString();
      });
      if (existItem) {
        existItem.quantity += 1;
        await findCart.save();
        res.json({ output: true });
      } else {
        findCart.cart_items.push(cart_items);
        await findCart.save();
        res.json({ output: true });
      }
    } else {
      const newitem = new Cart({
        user_id: user_id,
        cart_items: [],
      });
      newitem.cart_items.push(cart_items);
      await newitem.save();
      res.json({ output: true });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadAddToCart = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const cartitems = await Cart.findOne({ user_id: user_id });
    if (!cartitems || cartitems.length === 0) {
      res.render("cart", { cartitems });
    } else {
      res.render("cart", {
        cartitems: cartitems.cart_items,
        user_id: user_id,
        cartid: cartitems._id,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const dltCartItem = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const id = req.query.id;

    const cart = await Cart.findOneAndUpdate(
      { user_id: user_id },
      { $pull: { cart_items: { product_id: id } } },
      { new: true }
    );

    if (cart) {
      return res.json({status : true})
    } else {
      res.send("not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const loadOrderAdress = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const totalprice = req.query.tprice;
    req.session.totalPrice = totalprice;
    const userid = req.session.user_id;
    const cart = await Cart.findOne({ user_id: userid });
    const finduser = await User.findOne({ _id: userid });
    const nonDeletedAddresses = finduser.addresses.filter(
      (address) => !address.is_deleted
    );

    if (req.query.id) {
      const product_id = req.query.id;
      const findProduct = await Product.findOne({ _id: product_id });
      if (!nonDeletedAddresses || nonDeletedAddresses.length === 0) {
        return res.render("order-address", {
          addressmsg: "please add address",
          addresses: nonDeletedAddresses,
          totalPrice: findProduct.offer_price,
          product_id: findProduct._id,
          is_single: true,
        });
      } else {
        return res.render("order-address", {
          totalPrice: findProduct.offer_price,
          addresses: nonDeletedAddresses,
          product_id: findProduct._id,
          is_single: true,
        });
      }
    }
    // single conditions ended

    if (!cart) {
      console.log("Cart not found for the user.");
      return;
    }

    let foundOutOfStock = 0;

    for (const cartItem of cart.cart_items) {
      const product = await Product.findById(cartItem.product_id);

      if (!product) {
        continue;
      }
      if (product.stock <= 0 || cartItem.quantity > product.stock) {
        foundOutOfStock++;
        console.log(`Product '${product.product_name}' is out of stock.`);
      }
    }

    if (foundOutOfStock === 0) {
      console.log("All products in the cart are in stock.");
      if (!nonDeletedAddresses || nonDeletedAddresses.length === 0) {
        return res.render("order-address", {
          addressmsg: "please add address",
          addresses: nonDeletedAddresses,
          totalPrice: req.session.totalPrice,
          is_single: false,
        });
      } else {
        res.render("order-address", {
          totalPrice: req.session.totalPrice,
          addresses: nonDeletedAddresses,
          is_single: false,
        });
      }
    } else {
      return res.render("cart", {
        stockMessage: "Some Product is Out Of Stock",
        cartitems: cart.cart_items,
        user_id: user_id,
        cartid: cart._id,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    if (req.query.product_id) {
      res.render("add-address", {
        cart: req.query.product_id,
        is_single: true,
        price: req.query.price,
      });
    } else {
      res.render("add-address", {
        cart: null,
        is_single: false,
        price: req.query.price,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const addingAddress = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const values = {
      order_name: req.body.order_name,
      address_number: req.body.address_number,
      pincode: req.body.pincode,
      locality: req.body.locality,
      place: req.body.place,
      state: req.body.state,
      address: req.body.address,
      is_deleted: false,
    };
    if (
      req.body.order_name === " " ||
      req.body.address_number === " " ||
      req.body.pincode === " " ||
      req.body.locality === " " ||
      req.body.place === " " ||
      req.body.state === " " ||
      req.body.address === " "
    ) {
      return;
    }
    const userFind = await User.findOne({ _id: user_id });
    const nonDeletedAddresses = userFind.addresses.filter(
      (address) => !address.is_deleted
    );
    if (/\d/.test(req.body.order_name) || /\d/.test(req.body.order_name)) {
      if (req.body.product_id) {
        return res.render("add-address", {
          message: "Numbers not allowed in name",
          is_single: true,
          cart: req.query.product_id,
        });
      } else {
        return res.render("add-address", {
          message: "Numbers not allowed in name",
          is_single: false,
          cart: null,
        });
      }
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(req.body.address_number)) {
      if (req.body.product_id) {
        return res.render("add-address", {
          message: "Mobile Number should be 10 digit",
          is_single: true,
          cart: req.query.product_id,
        });
      } else {
        return res.render("add-address", {
          message: "Mobile Number should be 10 digit",
          is_single: false,
          cart: null,
        });
      }
    }
    if (userFind) {
      if (nonDeletedAddresses.length === 2) {
        return res.render("add-address", {
          message: "please remove one address to add another",
        });
      } else {
        userFind.addresses.push(values);
        await userFind.save();
        if (req.body.product_id) {
          const findproduct = await Product.findOne({
            _id: req.body.product_id,
          });
          res.redirect(
            `/loadOrderAdressPage?tprice=${req.body.price}&cart=${findproduct._id}&is_single=true`
          );
        } else {
          res.redirect(`/loadOrderAdressPage?tprice=${req.body.price}`);
        }
      }
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log(error);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const address_id = req.query.id;
    req.session.address_id = address_id;
    const user_id = req.session.user_id;
    const finduser = await User.findOne({ _id: user_id });
    const getaddress = finduser.addresses.find(
      (address) => address._id.toString() === address_id
    );
    if (req.query.product_id) {
      const findproduct = await Product.findOne({ _id: req.query.product_id });
      if (getaddress) {
        res.render("edit-address", {
          address: getaddress,
          price: req.query.price,
          cart: findproduct._id,
          is_single: true,
        });
      }
    } else {
      if (getaddress) {
        res.render("edit-address", {
          address: getaddress,
          price: req.query.price,
          cart: null,
          is_single: false,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const finduser = await User.findOne({ _id: user_id });
    if (finduser) {
      const findAddress = await finduser.addresses.find((address) => {
        return address._id.toString() === req.session.address_id.toString();
      });
      if (findAddress) {
        findAddress.order_name = req.body.order_name;
        findAddress.address_number = req.body.address_number;
        findAddress.pincode = req.body.pincode;
        findAddress.locality = req.body.locality;
        findAddress.place = req.body.place;
        findAddress.state = req.body.state;
        findAddress.address = req.body.address;
        findAddress.is_deleted = false;
        await finduser.save();
      }
      if (req.body.product_id) {
        const findproduct = await Product.findOne({ _id: req.body.product_id });
        return res.json({status : true,tprice : findproduct.offer_price,id : findproduct._id})
        // res.render("order-address", {
        //   totalPrice: findproduct.offer_price,
        //   product_id: findproduct._id,
        //   addresses: finduser.addresses,
        //   is_single: true,
        // });
      } else {
        return res.json({cstatus : true,tprice : req.session.totalPrice})
        // res.render("order-address", {
        //   totalPrice: req.session.totalPrice,
        //   is_single: false,
        //   addresses: finduser.addresses,
        // });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addToCart,
  loadAddToCart,
  dltCartItem,
  loadOrderAdress,
  loadAddAddress,
  addingAddress,
  // removeAddress,
  loadEditAddress,
  editAddress,
};
