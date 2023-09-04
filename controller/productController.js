const User = require("../model/userModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");

const loadaddProduct = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("add-product", { categories });
  } catch (error) {
    console.log(error);
  }
};

const addproduct = async (req, res) => {
  try {
    if (
      req.body.brand_name === " " ||
      req.body.product_name === " " ||
      req.body.og_price === " " ||
      req.body.offer_price === " " ||
      req.body.model_name === " " ||
      req.body.outer_material === " " ||
      req.body.ideal_for === " "||
      req.body.stock === " "
    ) {
      return res.render("add-product", {
        productmessage: "product adding failed",
      });
    }
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      images.push(req.files[i].filename);
    }
    // const uploadedImages = req.files.map(file => file.path);

    const existed = await Category.findOne({
      category_name: { $regex: req.body.brand_name, $options: "i" }
    }); 
    let offer_price = 0
    if(existed.offer > 0){
      offer_price = req.body.og_price - (req.body.og_price * existed.offer / 100);
    }
    else{
      offer_price = req.body.offer_price
    }
    const product = new Product({
      brand_name: req.body.brand_name,
      product_name: req.body.product_name,
      og_price: req.body.og_price,
      offer_price: offer_price,
      model_name: req.body.model_name,
      outer_material: req.body.outer_material,
      ideal_for: req.body.ideal_for,
      stock : req.body.stock,
      description: req.body.description,
      image: images,
      is_listed: true,
    });

    const product_details = await product.save();
    if (product_details) {
      res.redirect("/admin/add-product");
    } else {
      return res.render("add-product", {
        productmessage: "product adding failed",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadProductList = async (req, res) => {
  try {
    const products = await Product.find({});
    if(req.query.pid){
      const product = await Product.findByIdAndUpdate({_id : req.query.pid},{$set : {is_listed : false}})
      res.render("products-list", { products ,message : 'product category is not found'});
    }
    if(req.query.is){
      res.render("products-list", { products ,message : 'product listing is not possible..product category is missing'});
    }
    res.render("products-list", { products });
  } catch (error) {
    res.send(`Error fetching products from the database: ${error.message}`);
  }
};


const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    req.session.temp_id = id;
    const productData = await Product.findById({ _id: id });
    const categories = await Category.find({});
    const brand = await Category.findOne({
      category_name: productData.brand_name,
    });
    if(brand){
      res.render("edit-product", { productData, categories, brand });
    }
    else{
      res.redirect(`/admin/product-list?pid=${id}`);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateProduct = async (req, res) => {
  try {
    if (
      req.body.brand_name === " " ||
      req.body.product_name === " " ||
      req.body.og_price === " " ||
      req.body.offer_price === " " ||
      req.body.model_name === " " ||
      req.body.outer_material === " " ||
      req.body.ideal_for === " " ||
      req.body.stock === " "
    ) {
      return res.render("product-list", {
        productmessage: "product editing failed",
      });
    }
    const images = [];
    for (let i = 0; i < req.files.length; i++) {
      images.push(req.files[i].filename);
    }
    const findProduct = await Product.findOne({_id : req.session.temp_id})
    if(images.length === 0){
      for (let i = 0; i < findProduct.image.length; i++) {
        images.push(findProduct.image[i]);
      }
    }
    const updated = await Product.findByIdAndUpdate(
      { _id: req.session.temp_id },
      {
        $set: {
          brand_name: req.body.brand_name,
          product_name: req.body.product_name,
          og_price: req.body.og_price,
          offer_price: req.body.offer_price,
          model_name: req.body.model_name,
          outer_material: req.body.outer_material,
          ideal_for: req.body.ideal_for,
          stock : req.body.stock,
          description: req.body.description,
          image: images,
          is_listed: true,
        },
      }
    );
    if (updated) {
      res.redirect("/admin/product-list");
    } else {
      return res.render("add-product", {
        productmessage: "product is updating failed",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const listproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.find({_id : id})
    const findcat = await Category.findOne({category_name : product[0].brand_name})
    if(findcat.is_listed === true){
      const finded = await Product.updateOne(
        { _id: id },
        { $set: { is_listed: true } }
      );
      return res.json({status : true})
    }
    else{
      return res.json({status : false})
    }
  } catch (error) {
    return res.send('server error')
  }
};

const unlistproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.find({_id : id})
      const finded = await Product.updateOne(
        { _id: id },
        { $set: { is_listed: false } }
      );
      return res.json({status : true})

  } catch (error) {
    console.log(error);
  }
};

const deleteImage = async (req, res) => {
  try {
    const product_id = req.query.product_id;
    const removeimage = req.query.image;
    const categories = await Category.find({});
    const findProduct = await Product.findOne({ _id: product_id });
    const brand = await Category.findOne({
      category_name: findProduct.brand_name,
    });
    if (findProduct) {
      const imageIndex = findProduct.image.findIndex(
        (image) => image === removeimage
      );
      if (imageIndex !== -1) {
        findProduct.image.splice(imageIndex, 1);
        await findProduct.save()
      }
    }
    res.render("edit-product", { productData : findProduct, categories, brand });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadaddProduct,
  addproduct,
  loadProductList,
  loadEditProduct,
  updateProduct,
  listproduct,
  unlistproduct,
  deleteImage,
};
