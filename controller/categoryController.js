const mongoose = require("mongoose");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");

const loadAddCategory = async (req, res) => {
  try {
    res.render("add-category");
  } catch (error) {}
};

const addCategory = async (req, res) => {
  try {
    const existed = await Category.findOne({
        category_name: { $regex: req.body.category_name, $options: "i" }
      }); 
    if (existed) {
      return res.render("add-category", {
        categorymessage: "category is already existed",
      });
    }
    const category = new Category({
      category_name: req.body.category_name,
      category_logo: req.file.filename,
      is_listed : true,
      offer : req.body.offer
    });
    const newCategory = await category.save();
    if (newCategory) {
      res.render("add-category", { categorymessage: "new category added" });
    } else {
      res.render("add-category", { categorymessage: "failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadCategoryList = async (req, res) => {
  try {
    const Categories = await Category.find({});
    res.render("category-list", { Categories });
  } catch (error) {
    console.log(error);
  }
};

const unlistCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const findcat = await Category.findOne({ _id: id });
    const matchproduct = await Product.updateMany(
      { brand_name: findcat.category_name },
      { $set: { is_listed: false } }
    );
    const dlt = await Category.updateOne({ _id: id },{$set : {is_listed : false}});
    res.json({status : true})
  } catch (error) {
    console.log(error);
  }
};


const listCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const findcat = await Category.findOne({ _id: id });
    const matchproduct = await Product.updateMany(
      { brand_name: findcat.category_name },
      { $set: { is_listed: true } }
    );
    const dlt = await Category.updateOne({ _id: id },{$set : {is_listed : true}});
    res.json({status : true})
  } catch (error) {
    console.log(error);
  }
};

const loadeditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    req.session.ctemp = id
    const category = await Category.findById({ _id: id });
    res.render("edit-category", { category});
  } catch (error) {
    console.log(error);
  }
};

const updateCategory = async (req, res) => {
  try {
    const existed = await Category.findOne({
      _id: { $ne: req.session.ctemp }, // Exclude the current editing category
      category_name: { $regex: req.body.category_name, $options: "i" }
    });    
      const category = await Category.findById({ _id: req.session.ctemp });
      if (existed) {
        return res.render("edit-category", {
          categorymessage: "category is already existed",
          category
        });
      }
    const findcat = await Category.findOne({_id: req.session.ctemp});
    const images = [];
    if (req.file !== undefined) {
        images.push(req.file.filename);
    }
    else{
        images.push(findcat.category_logo)
    }
    const findProducts = await Product.find({brand_name : findcat.category_name})
      for (const product of findProducts) {
        // Calculate the new offer_price based on the offer percentage
        const newOfferPrice = product.og_price - (product.og_price * req.body.offer / 100);
      
        await Product.findByIdAndUpdate(product._id, {
          $set: {
            brand_name: req.body.category_name,
            offer_price: newOfferPrice, // Update the offer_price field
          },
        });
    }

    const updating = await Category.findByIdAndUpdate(
        { _id: req.session.ctemp }, 
        {
          $set: {
            category_name: req.body.category_name,
            category_logo: images[0],
            offer : req.body.offer
          },
        }
      );
    if (updating) {
      res.redirect("/admin/category-list");
    } else {
      return res.render("edit-category", {
        categorymessage: "category updating is failed",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadCategoryList,
  loadAddCategory,
  addCategory,
  unlistCategory,
  listCategory,
  loadeditCategory,
  updateCategory,
};
