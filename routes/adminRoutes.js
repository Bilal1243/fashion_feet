const express = require('express');
const admin_route = express()
const multer = require('multer')
const nocache = require('nocache')
admin_route.use(nocache())


admin_route.use(express.urlencoded({ extended: true })); 
admin_route.use(express.json()); 


admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

admin_route.use(express.static('public'))

const auth = require('../middleware/admin_auth')
const admincontroller = require('../controller/adminController')
const productcontroller = require('../controller/productController')
const categorycontroller = require('../controller/categoryController')
const orderController = require('../controller/adminOrderController')
const couponContoller = require('../controller/couponController')
const bannerController = require('../controller/bannerController')
const salesController = require('../controller/salesController')

const productStorage = multer.diskStorage({
    destination: (req,file,callback)=>{
        callback(null,'./public/admin-assets/uploads')
    },
  
    //extention
    filename: (req,file,callback)=>{
        callback(null,Date.now()+file.originalname)
    }
  })
  
  //upload parameters for multer
  const uploadPrdt = multer({
    storage: productStorage,
    limits:{
        fieldSize: 1024*1024*5
    }
  })


admin_route.get('/',auth.is_logout,admincontroller.loadlogin)
admin_route.post('/login',admincontroller.verifyLogin)

admin_route.get('/home',auth.is_login,admincontroller.loadhome)
admin_route.get('/monthly-report',auth.is_login,admincontroller.monthlyreport)

admin_route.get('/user-list',auth.is_login,admincontroller.loadUserList)
admin_route.get('/unblockuser',auth.is_login,admincontroller.unblockUser)
admin_route.get('/blockuser',auth.is_login,admincontroller.blockUser)


admin_route.get('/product-list',auth.is_login,productcontroller.loadProductList)
admin_route.get('/add-product',auth.is_login,productcontroller.loadaddProduct)
admin_route.post('/add-product',auth.is_login,uploadPrdt.array('image1',Infinity),productcontroller.addproduct)
admin_route.get('/edit-product',auth.is_login,productcontroller.loadEditProduct)
admin_route.post('/edit-product',auth.is_login,uploadPrdt.array('image1', Infinity),productcontroller.updateProduct)
admin_route.put('/list-product',auth.is_login,productcontroller.listproduct)
admin_route.put('/unlist-product',auth.is_login,productcontroller.unlistproduct)
admin_route.get('/delete-image',auth.is_login,productcontroller.deleteImage)


// admin_route.get('/logout',auth.is_login,admincontroller.logout)
admin_route.get('/category-list',auth.is_login,categorycontroller.loadCategoryList)
admin_route.get('/add-category',auth.is_login,categorycontroller.loadAddCategory)
admin_route.post('/add-category',auth.is_login,uploadPrdt.single('category_logo'),categorycontroller.addCategory)
admin_route.get('/edit-category',auth.is_login,categorycontroller.loadeditCategory)
admin_route.post('/edit-category',auth.is_login,uploadPrdt.single('category_logo'),categorycontroller.updateCategory)
admin_route.get('/unlist-category',auth.is_login,categorycontroller.unlistCategory)
admin_route.get('/list-category',auth.is_login,categorycontroller.listCategory)


admin_route.get('/order-manage',auth.is_login,orderController.loadOrderPage)
admin_route.get('/order-details',auth.is_login,orderController.loadOrderDetails)
admin_route.post('/change-status/:id&:userid',auth.is_login,orderController.changeStatus)

admin_route.get('/load-coupons',auth.is_login,couponContoller.loadCoupons)
admin_route.get('/Add-coupon',auth.is_login,couponContoller.loadAddCoupon)
admin_route.post('/add-coupon',auth.is_login,couponContoller.addCoupoon)

admin_route.get('/Add-Banner',auth.is_login,bannerController.loadAddBanner)
admin_route.post('/new-banner/add-banner',auth.is_login,uploadPrdt.single('bannerImg'),bannerController.addNewBanner)
admin_route.get('/load-Banners',auth.is_login,bannerController.loadBanners)
admin_route.get('/unlist-banner',auth.is_login,bannerController.unlistBanner)
admin_route.get('/list-banner',auth.is_login,bannerController.listBanner)

admin_route.get('/report/salesReport',auth.is_login,salesController.SalesReport)
admin_route.post('/salesReport',auth.is_login,salesController.dateReport)

admin_route.get('/admin-logout',auth.is_login,admincontroller.adminLogout)

module.exports = admin_route