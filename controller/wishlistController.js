const Wishlist = require("../model/wishlistModel");
const User = require("../model/userModel");
const Product = require("../model/productModel");

const addToWishlist = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const product_id = req.query.id;
    const product = await Product.findById({ _id: product_id });
    const wishlist_items = {
      product_id: product_id,
      product_name: product.product_name,
      ideal_for: product.ideal_for,
      offer_price: product.offer_price,
      image: product.image[0],
    };
    const findwishlist = await Wishlist.findOne({ user_id: user_id });
    if (findwishlist) {
      const existItem = await findwishlist.wishlist_items.find((item) => {
        return item.product_id.toString() === product_id.toString();
      });
      if (existItem) {
        res.json({wishStatus : true})
      } else {
        findwishlist.wishlist_items.push(wishlist_items);
        await findwishlist.save();
        res.json({wishStatus : true})
      }
    } else {
      const newitem = new Wishlist({
        user_id: user_id,
        wishlist_items: [],
      });
      newitem.wishlist_items.push(wishlist_items);
      await newitem.save();
      res.json({wishStatus : true})
    }
  } catch (error) {
    console.log(error);
  }
};

const loadwishlist = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const wishlist = await Wishlist.findOne({ user_id: user_id });
    if (!wishlist || wishlist.length === 0) {
      res.render("wishlist", { wishlist });
    } else {
      res.render("wishlist", {
        wishlist: wishlist.wishlist_items,
        user_id: user_id,
        wishlistid: wishlist._id,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const removeItem = async(req,res) => {
  try {
    const user_id = req.session.user_id;
    const id = req.query.id;
  
    const wishlist = await Wishlist.findOneAndUpdate(
      { user_id: user_id },
      { $pull: { wishlist_items: { product_id: id } } },
      { new: true }
    );
  
    if (wishlist) {
      res.json({status : true});
    } else {
      res.send("not found");
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  addToWishlist,
  loadwishlist,
  removeItem
};
