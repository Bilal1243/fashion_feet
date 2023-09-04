const mongoose = require("mongoose");
const session = require("express-session");
const User = require("../model/userModel");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const Banners = require('../model/bannerModel')
const Wallet = require('../model/walletModel')
const Helper = require('../Helpers/helper')
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer')
const twilio = require("twilio");
const accountSid = process.env.accountSid
const authToken = process.env.authToken
const client = new twilio(accountSid, authToken);
const serviceSid = process.env.serviceSid

const securepassword = async (password) => {
  try {
    const securedpassword = await bcrypt.hash(password, 10);
    return securedpassword;
  } catch (error) {
    console.log(error);
  }
};

const loginload = async (req, res) => {
  try {
    if(req.session.rsuccess){
      res.render("login", {
        title: "login page",
        message: "password changed successfully",
      });
    }
    if (req.session.block === 1) {
      res.render("login", {
        title: "login page",
        message: "oops..you are blocked by admin",
      });
    }
    res.render("login", { title: "login page" });
  } catch (err) {
    console.log(err);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_block == 1) {
          res.render("login", {
            message: "you are blocked by admin",
            title: "sign in",
          });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/home");
        }
      } else {
        res.render("login", {
          message: "password is incorrect",
          title: "sign in",
        });
      }
    } else {
      res.render("login", { message: "email is incorrect", title: "sign in" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadHome = async (req, res) => {
  try {
    if (req.session.user_id) {
      const products = await Product.find({ is_listed: true }).limit(3);
      const categories = await Category.find({is_listed : true}).limit(4);
      const banners = await Banners.find({is_listed : true})
      res.render("home", { title: "Fashion Feet", products, categories ,banners});
    } else {
      res.send("authentication failed");
      res.end();
    }
  } catch (error) {
    console.log(error);
  }
};

const loadregister = async (req, res) => {
  try {
    res.render("register", { title: "register" });
  } catch (error) {
    console.log(error);
  }
};

const insertuser = async (req, res) => {
  try {
    const existed = await User.findOne({ email: req.body.email });
    // const numexisted = await User.findOne({ mobile: req.body.mobile });
    if (existed) {
      return res.render("register", {
        title: "sign up",
        message: "user already existed",
        title: "sign up",
      });
    }
    // if (numexisted) {
    //   return res.render("register", {
    //     title: "sign up",
    //     message: "user already existed",
    //     title: "sign up",
    //   });
    // }
    if (!req.body.name || req.body.name.trim().length === 0) {
      return res.render("registration", {
        title: "sign up",
        message: "Name is required",
      });
    }
    if (/\d/.test(req.body.name) || /\d/.test(req.body.name)) {
      return res.render("register", {
        title: "sign up",
        message: "Numbers not allowed in name",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.render("register", {
        title: "sign up",
        message: "Email Not Valid",
      });
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(req.body.mobile)) {
      return res.render("register", {
        title: "sign up",
        message: "Mobile Number should be 10 digit",
      });
    }
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.render("register", {
        title: "sign up",
        message:
          "Password Should Contain atleast 8 characters,one number and a special character",
      });
    }
    if (req.body.password !== req.body.repass) {
      return res.render("register", {
        title: "sign up",
        message: "password must be same",
      });
    }
    const toNumber = "+91" + req.body.mobile;
    req.session.toNumber = toNumber;
    const sendOTP = async (phoneNumber) => {
      try {
        const verification = await client.verify
          .services(serviceSid)
          .verifications.create({
            to: phoneNumber,
            channel: "sms",
          });
      } catch (error) {
        console.error(`Error sending OTP to ${phoneNumber}:`, error);
      }
    };
    sendOTP(toNumber);
    req.session.name = req.body.name;
    req.session.email = req.body.email;
    req.session.mobile = req.body.mobile;
    req.session.password = req.body.password;
    res.render("reg-otp", { title: "otp verify", number: req.body.mobile });
  } catch (error) {
    console.log(error);
  }
};

const newUser = async (req, res) => {
  const verifyOTP = async (phoneNumber, enteredOTP) => {
    try {
      const verificationCheck = await client.verify
        .services(serviceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: enteredOTP,
        });

      if (verificationCheck.status === "approved") {
        const spassword = await securepassword(req.session.password);
        const user = new User({
          name: req.session.name,
          email: req.session.email,
          mobile: req.session.mobile,
          password: spassword,
          is_block: 0,
          is_admin: 0,
        });
        const userData = await user.save();
        if (userData) {
          res.render("refferal", {
            title: "Referal Code"
          });
          console.log("OTP verification successful");
        } else {
          res.render("register", { message: "failed..!!", title: "sign up" });
        }
      } else {
        console.log("OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };
  verifyOTP(req.session.toNumber, req.body.rotp);
};

const refCheck = async(req,res) => {
  try {
    const code = req.body.ref_code
    let get_wallet
    const wallet = await Wallet.find()
    for(let get of wallet){
      if(get.ref_code === code){
        get_wallet = get
        break
      }
    }
    const history = {
      from : "referal bonus",
      price : "+₹250",
      date : new Date()
    }
    const findOwner = await User.findOne({_id : get_wallet.user_id})
    const findOwnerWallet = await Wallet.findOne({user_id : findOwner._id})
    findOwnerWallet.balance += 250
    findOwnerWallet.history.push(history)
    await findOwnerWallet.save()
    const getUser = await User.find({})
    getUser.reverse()
    const newUser = getUser[0]
    const newHistory = {
      from : "referal bonus",
      price : "+₹100",
      date : new Date()
    }
    const newWallet = new Wallet({
      user_id : newUser._id,
      balance : 100,
      ref_code : await Helper.generateRef(newUser._id),
      history : []
    })
    newWallet.history.push(newHistory)
    await newWallet.save()
    res.redirect("/")
  } catch (error) {  
    console.log(error)
  }
}

const loadforgotNum = async (req, res) => {
  try {
    res.render("forgot", { title: "forgot password" });
  } catch (error) {
    console.log(error);
  }
};

const forgotPhoneVerify = async (req, res) => {
  try {
    const mobile = req.body.mobile;
    if (req.body.mobile.length !== 10) {
      return res.render("forgot", {
        title: "forgot password",
        fmessage: "please give valid number",
      });
    }
    const userData = await User.findOne({ mobile: mobile });
    if (userData) {
      const toNumber = "+91" + req.body.mobile;
      req.session.passnumber = toNumber;
      req.session.forgotNumber = req.body.mobile
      const sendOTP = async (phoneNumber) => {
        try {
          const verification = await client.verify
            .services(serviceSid)
            .verifications.create({
              to: phoneNumber,
              channel: "sms",
            });
        } catch (error) {
          console.error(`Error sending OTP to ${phoneNumber}:`, error);
        }
      };
      sendOTP(toNumber);
      res.redirect("/otp-page");
    } else {
      res.render("forgot", {
        title: "forgot password",
        fmessage: "number is not registered with any accounts",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadOtpPage = async (req, res) => {
  try {
    res.render("forgot-otp", {
      title: "Otp",
      number: req.session.forgotNumber,
    });
  } catch (error) {
    console.log(error);
  }
};

const setnewPass = async (req, res) => {
  try {
    const verifyOTP = async (phoneNumber, enteredOTP) => {
      try {
        const verificationCheck = await client.verify
          .services(serviceSid)
          .verificationChecks.create({
            to: phoneNumber,
            code: enteredOTP,
          });

        if (verificationCheck.status === "approved") {
          console.log('success')
          return res.render("forgotpass", { title: "set new password" });
        } else {
          return res.render("forgot-otp", {
            title: "otp",
            omessage: "oops..otp is wrong",
          });
          console.log("OTP verification failed");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
      }
    };
    verifyOTP(req.session.passnumber, req.body.eotp);
  } catch (error) {
    console.log(error);
  }
};

const updatepass = async (req, res) => {
  try {
    const password = await securepassword(req.body.password);
    if (req.body.password === "" || req.body.reppass === "") {
      res.render("forgotpass", {
        title: "new password",
        fmessage: "fill the field",
        mobNum: req.session.forgotNumber,
      });
    }
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.render("forgotpass", {
        title: "sign up",
        fmessage:
          "Password Should Contain atleast 8 characters,one number and a special character",
      });
    }
    if (req.body.password === req.body.reppass) {
      const matchuser = await User.findOne({ mobile: req.session.forgotNumber });
      if (matchuser) {
        const userData = await User.updateOne(
          { mobile: req.session.forgotNumber },
          { $set: { password: password } }
        );
        req.session.rsuccess = true
        res.redirect("/home");
      }
    } else {
      res.render("forgotpass", {
        title: "new password",
        fmessage: "password must be same",
        mobNum: req.session.forgotNumber,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// all loading
const loadAllCat = async (req, res) => {
  try {
    const category = await Category.find({is_listed : true});
    const products = await Product.find({});
    res.render("shop", { category, products});
  } catch (error) {
    console.log(error);
  }
};

const loadbrandpage = async (req, res) => {
  try {
    const brand_id = req.query.cat_id;
    const findcategory = await Category.findOne({ _id: brand_id });
    if (findcategory) {
      const products = await Product.find({
        brand_name: findcategory.category_name,
      });
      res.render("brand", {
        title: findcategory.category_name,
        products,
        img: findcategory.category_logo,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadContact = async(req,res) => {
  try {
    res.render('contactUs')
  } catch (error) {
    console.log(error)
    res.send('internal server error')
  }
}


const loadproductDetails = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById({ _id: id });
    const products = await Product.find({
      $and: [
        { product_name: { $nin: product.product_name } },
        { ideal_for: product.ideal_for },
        { brand_name: product.brand_name },
      ],
    });
    res.render("product-details", {
      product,
      title: "product details",
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

const filterProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.find({});
    const categoryFind = await Category.findById({ _id: id });
    if(!categoryFind){
      const p = []
      return res.render("shop", { products : p});
    }
    const products = await Product.find({
      brand_name: categoryFind.category_name,
    });
    if (products) {
      res.render("shop", { products, category });
    }
  } catch (error) {
    console.log(error);
  }
};

const searchProduct = async (req, res) => {
  try {
    const firstPart = req.body.search; // Get the word from req.body
    const category = await Category.find({});
    const find = await Product.find({
      $or: [
        { product_name: { $regex: `^${firstPart}`, $options: "i" } },
        { brand_name: { $regex: firstPart, $options: "i" } },
        { ideal_for: { $regex: `^${firstPart}`, $options: "i" } },
      ],
    });
    if (find.length > 0) {
      res.render("shop", { products: find, category });
    } else {
      res.render("shop", { products: null, category: null });
    }
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  try {
    req.session.user_id = false;
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loginload,
  loadregister,
  insertuser,
  refCheck,
  loadforgotNum,
  loadOtpPage,
  setnewPass,
  updatepass,
  verifyLogin,
  loadHome,
  forgotPhoneVerify,
  newUser,
  loadAllCat,
  loadbrandpage,
  loadContact,
  loadproductDetails,
  filterProduct,
  searchProduct,
  logout,
};
