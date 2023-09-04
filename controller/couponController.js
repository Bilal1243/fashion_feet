const mongoose = require("mongoose");
const Coupons = require("../model/couponModel");

const loadCoupons = async (req, res) => {
  try {
    const coupons = await Coupons.find({});
    res.render("coupon-list", { coupons });
  } catch (error) {
    console.log(error);
  }
};

const loadAddCoupon = async (req, res) => {
  try {
    res.render("add-coupon");
  } catch (error) {
    console.log(error);
  }
};

const addCoupoon = async (req, res) => {
  try {
    if (
      req.body.coupon === " " ||
      req.body.start === " " ||
      req.body.validity === " " ||
      req.body.description === " " ||
      req.body.offer === " " ||
      req.body.min_price === " " ||
      req.body.max_price === " "
    ) {
      return res.render("add-coupon", {
        productmessage: "coupon adding failed",
      });
    }

    const start = new Date(req.body.start).toLocaleDateString();;      
    const expire = new Date(req.body.validity).toLocaleDateString();;
    const today = new Date().toLocaleDateString();;                    


    const newCoupon = new Coupons({
      coupon: req.body.coupon,
      start: req.body.start,
      validity: req.body.validity,
      description: req.body.description,
      offer: req.body.offer,
      min_price: req.body.min_price,
      max_price: req.body.max_price,
    });
    await newCoupon.save();
    res.redirect("/admin/load-coupons");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCoupons,
  loadAddCoupon,
  addCoupoon,
};
