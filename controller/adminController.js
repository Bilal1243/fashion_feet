const session = require('express-session')
const User = require('../model/userModel')
const Product = require('../model/productModel')
const Order = require('../model/orderModel')
const Categories = require('../model/categoryModel')
const bcrypt = require('bcrypt')
const moment = require('moment')

const loadlogin = async (req,res)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/home')
        }
        else{
            res.render('page-account-login')
        }
    } catch (error) {
        console.log(error)
    }
}

const verifyLogin = async(req,res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({email : email})

        if(userData){
            const passwordMatch = await  bcrypt.compare(password,userData.password)
            if(passwordMatch){
                if(userData.is_admin===0){
                    res.render('page-account-login',{loginmessage : "you are not an admin"})
                }
                else{
                    req.session.admin_name = userData.name
                    res.redirect('/admin/home')
                }
            }else{
                res.render('page-account-login',{loginmessage : "password is incorrect"})
            }
        }else{
            res.render('page-account-login')
        }
    } catch (error) {
        console.log(error)
    }
}

const loadhome = async(req,res) =>{
    try {
        if(req.session.admin_name){
            const orders = await Order.find({})
            const products = await Product.find({})
            const categories = await Categories.find({})
            const total = await Order.aggregate([
                {$group : {
                    _id : {},
                    total : {$sum: "$totalprice"}
                }}
            ])
            res.render('index',{orders,products,categories,total})
        }
        else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error)
    }
}

const monthlyreport=async(req,res)=>{
  try {
    const start = moment().subtract(30, 'days').startOf('day'); // Data for the last 30 days
    const end = moment().endOf('day');

    const orderSuccessDetails = await Order.find({
      order_date: { $gte: start, $lte: end },
      delivery_status: 'Delivered' 
    });

    const monthlySales = {};

    orderSuccessDetails.forEach(order => {
      const monthName = moment(order.order_date).format('MMMM');
      if (!monthlySales[monthName]) {
        monthlySales[monthName] = {
          revenue: 0,
          productCount: 0,
          orderCount: 0,
          codCount: 0,
          razorpayCount: 0,
        };
      }
      monthlySales[monthName].revenue += order.totalprice;
      monthlySales[monthName].productCount += order.orders.length;
      monthlySales[monthName].orderCount++;

      if (order.payment_method=== 'cod') {
        monthlySales[monthName].codCount++;
      } else if (order.payment_method === 'Razorpay') {
        monthlySales[monthName].razorpayCount++;
      } 
    });

    const monthlyData = {
      labels: [],
      revenueData: [],
      productCountData: [],
      orderCountData: [],
      codCountData: [],
      razorpayCountData: [],
    };

    for (const monthName in monthlySales) {
      if (monthlySales.hasOwnProperty(monthName)) {
        monthlyData.labels.push(monthName);
        monthlyData.revenueData.push(monthlySales[monthName].revenue);
        monthlyData.productCountData.push(monthlySales[monthName].productCount);
        monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
        monthlyData.codCountData.push(monthlySales[monthName].codCount);
        monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
      }
    }

    return res.json(monthlyData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
  }
}

const loadUserList = async(req,res) =>{
    try {
        var search = ''
        if(req.query.search){
            search = req.query.search
        }
        const usersData = await User.find({
            is_admin : 0,
            $or:[
                {name : {$regex : '.*' + search + '.*'}},
                {email : {$regex : '.*' + search + '.*'}},
            ]
        })
        res.render('user-list',{user : usersData})
    } catch (error) {
        console.log(error)
    }
}

const blockUser = async(req,res)=>{
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({_id : id},{$set : {is_block : 1}})
        res.redirect('/admin/user-list')
    } catch (error) {
        console.log(error)
    }
}

const unblockUser = async(req,res)=>{
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({_id : id},{$set : {is_block : 0}})
        res.redirect('/admin/user-list')
    } catch (error) {
        console.log(error)   
    }
}

const adminLogout = async(req,res)=>{
    try {
        req.session.admin_name = false
        res.redirect('/admin')
    } catch (error) {
        console.log(error)
    }
}
  

module.exports = {
    loadlogin,
    verifyLogin,
    loadhome,
    monthlyreport,
    loadUserList,
    blockUser,
    unblockUser,
    adminLogout
}