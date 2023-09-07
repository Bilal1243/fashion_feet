const mongoose = require("mongoose");
const User = require("../model/userModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const Wallet = require("../model/walletModel");
const Product = require("../model/productModel");
const Helper = require("../Helpers/helper");
const bcrypt = require("bcrypt");
const easyinvoice = require("easyinvoice");

const securepassword = async (password) => {
  try {
    const securedpassword = await bcrypt.hash(password, 10);
    return securedpassword;
  } catch (error) {
    console.log(error);
  }
};

const loadProfile = async (req, res) => {
  try {
    const finduser = await User.findOne({ _id: req.session.user_id });
    if (finduser) {
      res.render("user-profile", { user: finduser });
    } else {
      res.status(404).send("user not found.");
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
};

const loadManageAddress = async (req, res) => {
  try {
    const finduser = await User.findOne({ _id: req.session.user_id });
    const nonDeletedAddresses = finduser.addresses.filter(
      (address) => !address.is_deleted
    );
    if (finduser) {
      res.render("manage-address", { addresses: nonDeletedAddresses });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadAddAddress = async (req, res) => {
  try {
    res.render("profile-add-address");
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
      return res.render("profile-add-address", {
        message: "Numbers not allowed in name",
      });
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(req.body.address_number)) {
      return res.render("profile-add-address", {
        message: "Mobile Number should be 10 digit",
      });
    }
    if (nonDeletedAddresses) {
      if (nonDeletedAddresses.length === 2) {
        return res.render("profile-add-address", {
          message: "please remove one address to add another",
        });
      } else {
        userFind.addresses.push(values);
        await userFind.save();
        res.redirect("/manage-address");
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
    req.session.edit_Address = address_id;
    const user_id = req.session.user_id;
    const finduser = await User.findOne({ _id: user_id });
    const getaddress = finduser.addresses.find(
      (address) => address._id.toString() === address_id
    );
    if (getaddress) {
      res.render("profile-edit-address", { address: getaddress });
    } else {
      res.send("error");
      res.end();
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
        return address._id.toString() === req.session.edit_Address.toString();
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
      return res.json({ status: true });
      // res.redirect('/manage-address');
    } else {
      res.send("error to load page");
      res.end();
    }
  } catch (error) {
    console.log(error);
  }
};

const removeAddress = async (req, res) => {
  try {
    const address_id = req.query.id;
    const user_id = req.session.user_id;
    const findUser = await User.findOne({ _id: user_id });
    const finduser = await User.findOne({ _id: user_id });
    const findorder = await Order.find({ user_id: user_id });
    const matchAddress = findorder.filter((order) => {
      return order.order_Address.toString() === address_id.toString();
    });
    const address = await User.findOneAndUpdate(
      { _id: user_id, "addresses._id": address_id },
      { $set: { "addresses.$.is_deleted": true } },
      { new: true }
    );
    res.json({ status: true });
  } catch (error) {
    console.log(error);
  }
};

const loadchangepass = async (req, res) => {
  try {
    res.render("change-password");
  } catch (error) { }
};

const updatepass = async (req, res) => {
  try {
    const password = await securepassword(req.body.password);
    const oldpassword = req.body.currentPass;
    if (req.body.password === " ") {
      return res.render("change-password", { fmessage: "Enter new password" });
    }
    if (req.body.currentPass === " ") {
      return res.render("change-password", { fmessage: "Enter old password" });
    }
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.render("change-password", {
        fmessage: "password must contain 8character",
      });
    }
    const matchuser = await User.findOne({ _id: req.session.user_id });
    if (matchuser) {
      const passwordMatch = await bcrypt.compare(
        oldpassword,
        matchuser.password
      );
      if (passwordMatch) {
        const userData = await User.updateOne(
          { _id: req.session.user_id },
          { $set: { password: password } }
        );
        return res.json({ status: true });
        // res.redirect("/my-profile");
      } else {
        res.render("change-password", { fmessage: "old password is wrong!!" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const loadOrderDetails = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const order = await Order.find({ user_id: user_id });
    const itemsperpage = 5;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    const totalpages = Math.ceil(order.length / 5);
    const currentproduct = order.slice(startindex, endindex);
    if (!order || order.length === 0) {
      res.render("orderDetails", { order });
    } else {
      res.render("orderDetails", {
        order: currentproduct,
        totalpages,
        currentpage,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadOrderSummary = async (req, res) => {
  try {
    const orderid = req.query.orderId;
    const address_id = req.query.addressId;
    const findorder = await Order.findOne({ _id: orderid });
    const user = await User.findOne({ _id: req.session.user_id });
    const findAddress = await user.addresses.find((item) => {
      return item._id.toString() === address_id.toString();
    });
    if (findorder) {
      const order = findorder.orders;
      res.render("profile-order-view", {
        order_id: findorder._id,
        product: order,
        user,
        address: findAddress,
        Order: findorder,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const { Readable } = require("stream");

const downloadInvoice = async (req, res) => {
  try {
    const id = req.query.id;
    const userId = req.session.user_id;
    const result = await Order.findOne({ _id: id });
    const user = await User.findOne({ _id: userId });

    const address = user.addresses.find(
      (element) => element._id.toString() === result.order_Address.toString()
    );

    const order = {
      id: id,
      total: result.totalprice,
      date: result.order_date, // Use the formatted date
      paymentMethod: result.payment_type,
      orderStatus: result.delivery_status,
      name: address.order_name,
      number: address.address_number,
      pincode: address.pincode,
      locality: address.locality,
      place: address.place,
      state: address.state,
      address: address.address,
      product: result.orders,
    };
    //set up the product
    const products = order.product.map((product) => ({
      quantity: parseInt(product.product_qauntity),
      description: product.product_name,
      price: parseInt(product.product_price),
      total: parseInt(product.product_price * product.product_qauntity),
      "tax-rate": 0,
    }));
    const isoDateString = order.date;
    const isoDate = new Date(isoDateString);

    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = isoDate.toLocaleDateString("en-US", options);
    const data = {
      customize: {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The invoice background
        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      // Your own data
      sender: {
        company: "Fashion Feet",
        address: "Fashion Feet Hub Kalamassery",
        city: "Kochi",
        country: "India",
      },
      client: {
        company: "Customer Address",
        "zip": order.pincode,
        "city": order.locality,
        "address": order.name,
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
      },
      information: {
        // Invoice number
        number: "order" + order.id,
        // ordered date
        date: formattedDate,
      },
      products: products,
      "bottom-notice": "Happy shoping and visit Fashion Feet again",
    };

    const pdfResult = await easyinvoice.createInvoice(data);
    const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");

    // Set HTTP headers for the PDF response
    res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
    res.setHeader("Content-Type", "application/pdf");

    // Create a readable stream from the PDF buffer and pipe it to the response
    const pdfStream = new Readable();
    pdfStream.push(pdfBuffer);
    pdfStream.push(null);

    pdfStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order_id = req.query.orderid;
    const findorder = await Order.findOne({ _id: order_id });
    if (findorder) {
      const price = findorder.totalprice;
      const updatedOrder = await Order.updateOne(
        {
          _id: order_id,
        },
        {
          $set: { delivery_status: "Cancelled" },
        }
      );
      for (let i = 0; i < findorder.orders.length; i++) {
        let orderProductId = findorder.orders[i].product_id;
        let product = await Product.findOne({ _id: orderProductId });
        product.stock += findorder.orders[i].product_qauntity;
        await product.save();
      }
      res.json({ status: true });
    }
  } catch (error) { }
};

const returnProduct = async (req, res) => {
  try {
    const order_id = req.query.orderid;
    const findorder = await Order.findOne({ _id: order_id });

    if (!findorder) {
      return res.json({ status: false, message: "Order not found." });
    }

    const price = findorder.totalprice;
    const history = {
      from: findorder._id,
      price: "+₹" + price,
      date: new Date(),
    };

    const findWallet = await Wallet.findOne({ user_id: req.session.user_id });

    if (findWallet) {
      findWallet.balance += price;
      findWallet.history.push(history);
      await findWallet.save();
    } else {
      const newwallet = new Wallet({
        user_id: req.session.user_id,
        balance: price,
        ref_code: await Helper.generateRef(req.session.user_id),
        history: [history],
      });
      await newwallet.save();
    }

    // Update the delivery status and product stock
    if (
      (findorder.delivery_status === "Delivered" &&
        (findorder.payment_type === "Razorpay" ||
          findorder.payment_type === "Wallet")) ||
      (findorder.delivery_status === "Delivered" &&
        findorder.payment_type === "cod")
    ) {
      await Order.updateOne(
        { _id: order_id },
        { $set: { delivery_status: "Returned" } }
      );

      for (let i = 0; i < findorder.orders.length; i++) {
        let orderProductId = findorder.orders[i].product_id;
        let product = await Product.findOne({ _id: orderProductId });
        product.stock += findorder.orders[i].product_qauntity;
        await product.save();
      }
    } else {
      await Order.updateOne(
        { _id: order_id },
        { $set: { delivery_status: "Cancelled" } }
      );

      for (let i = 0; i < findorder.orders.length; i++) {
        let orderProductId = findorder.orders[i].product_id;
        let product = await Product.findOne({ _id: orderProductId });
        product.stock += findorder.orders[i].product_qauntity;
        await product.save();
      }
    }

    return res.json({ status: true });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: "An error occurred." });
  }
};

const loadwallet = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const findWallet = await Wallet.findOne({ user_id: req.session.user_id });

    if (!findWallet) {
      const newwallet = new Wallet({
        user_id: req.session.user_id,
        balance: 0,
        ref_code: await Helper.generateRef(userid),
        history: [],
      });
      await newwallet.save();
      res.render("wallet", {
        wallet: newwallet,
      });
    } else {
      findWallet.history.reverse();
      res.render("wallet", {
        wallet: findWallet,
        history: findWallet.history,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const showWalletHistory = async (req, res) => {
  try {
    const findwallet = await Wallet.findOne({ user_id: req.session.user_id });
    if (findwallet) {
      const reverse = findwallet.history.reverse();
      res.render("showWallet", { wallet: reverse });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadEditprofile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.query.id })
    res.render('edit-profile', { user })
  } catch (error) {
    res.send('oops..server error')
  }
}

const setupNewUserProfile = async (req, res) => {
  try {
    const { name, email, mobile, id } = req.body
    const findeduser = await User.findOne({_id : id})
    if (!name || name.trim().length === 0) {
      return res.json({ status: false ,user : id,message : 'enter valid name'})
    }
    if (/\d/.test(name) || /\d/.test(name)) {
      return res.json({ status: false ,user : id,message : 'enter valid name'})
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ status: false ,user : id,message : 'enter valid email'})
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobile)) {
      return res.json({ status: false ,user : id,message : 'enter valid mobile'})
    }

    const user = await User.findByIdAndUpdate({ _id: id }, { name: name, email: email, mobile: mobile })

    return res.json({ status: true })


  } catch (error) {
    res.send('unexpected server error')
  }
}

module.exports = {
  loadProfile,
  loadManageAddress,
  loadAddAddress,
  addingAddress,
  loadEditAddress,
  editAddress,
  removeAddress,
  loadchangepass,
  updatepass,
  loadOrderDetails,
  loadOrderSummary,
  cancelOrder,
  returnProduct,
  loadwallet,
  showWalletHistory,
  downloadInvoice,
  loadEditprofile,
  setupNewUserProfile
};
