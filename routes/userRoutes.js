const express = require('express')
const userRoute = express()
const path = require('path')
const nocache = require('nocache')
const bodyparser = require('body-parser')


userRoute.use(nocache())


userRoute.use(bodyparser.json())
userRoute.use(bodyparser.urlencoded({extended:true}))

userRoute.use(express.static(path.resolve('./public/assets')))
userRoute.use(express.static(path.resolve('./public/css')))
userRoute.use(express.static(path.resolve('./public/assets/banner'))) 
userRoute.use(express.static(path.resolve('./public/assets/product')))
userRoute.use(express.static(path.resolve('./public/assets/brand')))
userRoute.use(express.static(path.resolve('./public/assets/features')))
userRoute.use(express.static('public'))

userRoute.set('view engine','ejs')
userRoute.set('views','./views/user')

const auth = require('../middleware/user-auth')

const userController = require('../controller/user_Controller')
const userCart = require('../controller/usercart')
const updatequantity = require('../controller/quantityupdateController')
const paymentController = require('../controller/paymentController')
const profileController = require('../controller/profileController')
const wishlistController = require('../controller/wishlistController')


userRoute.get('/',auth.is_Logout,userController.loginload)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/home',auth.is_Login,userController.loadHome)

userRoute.get('/register',auth.is_Logout,userController.loadregister)
userRoute.post('/register',userController.insertuser)

userRoute.post("/new-reg",userController.newUser)
userRoute.post('/ref/user/validate/referal',userController.refCheck)

userRoute.get('/forgot',auth.is_Logout,userController.loadforgotNum)
userRoute.post('/forgot',auth.is_Logout,userController.forgotPhoneVerify)
userRoute.get('/otp-page',auth.is_Logout,userController.loadOtpPage)
userRoute.post('/set-pass',auth.is_Logout,userController.setnewPass)
userRoute.post('/pass-update',auth.is_Logout,userController.updatepass)


userRoute.get('/shop',auth.is_Login,auth.is_blocked,userController.loadAllCat)
userRoute.get('/product-details',auth.is_Login,auth.is_blocked,userController.loadproductDetails)

userRoute.get('/category-filter',auth.is_Login,auth.is_blocked,userController.filterProduct)


userRoute.get('/add-to-cart',auth.is_Login,auth.is_blocked,userCart.addToCart)
userRoute.get('/addtocart',auth.is_Login,auth.is_blocked,userCart.loadAddToCart)
userRoute.delete('/delete-cart-item',auth.is_Login,auth.is_blocked,userCart.dltCartItem)
userRoute.post('/update-quantity/:id',auth.is_Login,auth.is_blocked,updatequantity.updatecart);

userRoute.get('/loadOrderAdressPage',auth.is_Login,auth.is_blocked,userCart.loadOrderAdress)
userRoute.get('/load-add-address',auth.is_Login,auth.is_blocked,userCart.loadAddAddress)
userRoute.post('/add-address',auth.is_Login,auth.is_blocked,userCart.addingAddress)
userRoute.get('/edit-address',auth.is_Login,auth.is_blocked,userCart.loadEditAddress)
userRoute.put('/edited-address',auth.is_Login,auth.is_blocked,userCart.editAddress)

userRoute.get('/loadPaySelection',auth.is_Login,auth.is_blocked,paymentController.loadPaymentSelect)
userRoute.get('/apply/wallet/discount',auth.is_Login,auth.is_blocked,paymentController.applyWallet)
userRoute.get('/apply/coupon/discount',auth.is_Login,auth.is_blocked,paymentController.applyCoupon)
userRoute.post('/verify-payment',auth.is_Login,paymentController.verifyPayment)
userRoute.post('/paymentSuccess',auth.is_Login,auth.is_blocked,paymentController.order)
userRoute.get('/loadOrder-Detail',auth.is_Login,auth.is_blocked,paymentController.loadOrderSummary)

userRoute.get('/my-profile',auth.is_Login,auth.is_blocked,profileController.loadProfile)
userRoute.get('/edit-profile',auth.is_Login,auth.is_blocked,profileController.loadEditprofile)
userRoute.put('/user/editedProfile/new-Profile',auth.is_Login,auth.is_blocked,profileController.setupNewUserProfile)
userRoute.get('/my-profile/change-password',auth.is_Login,auth.is_blocked,profileController.loadchangepass)
userRoute.put('/change-password/update-pass',auth.is_Login,auth.is_blocked,profileController.updatepass)
userRoute.get('/manage-address',auth.is_Login,auth.is_blocked,profileController.loadManageAddress)
userRoute.get('/manage-address/edit-address',auth.is_Login,auth.is_blocked,profileController.loadEditAddress)
userRoute.put('/manage-address/edited-address',auth.is_Login,auth.is_blocked,profileController.editAddress)
userRoute.get('/home-add-address',auth.is_Login,auth.is_blocked,profileController.loadAddAddress)
userRoute.post('/manage-address/add-address',auth.is_Login,auth.is_blocked,profileController.addingAddress)
userRoute.patch('/manage-address/remove-address',auth.is_Login,auth.is_blocked,profileController.removeAddress)
userRoute.get('/load-Orders',auth.is_Login,auth.is_blocked,profileController.loadOrderDetails)
userRoute.get('/view-order',auth.is_Login,auth.is_blocked,profileController.loadOrderSummary)
userRoute.get('/invoice/downloadInvoice/orderSummary',auth.is_Login,auth.is_blocked,profileController.downloadInvoice)
userRoute.patch('/cancel-order',auth.is_Login,auth.is_blocked,profileController.cancelOrder)
userRoute.patch('/return-order',auth.is_Login,auth.is_blocked,profileController.returnProduct)
userRoute.get('/load-Wallet',auth.is_Login,auth.is_blocked,profileController.loadwallet)
userRoute.get('/wallet/show-wallet-history',auth.is_Login,auth.is_blocked,profileController.showWalletHistory)

userRoute.get('/add-to-wishlist',auth.is_Login,auth.is_blocked,wishlistController.addToWishlist)
userRoute.get('/wishlist',auth.is_Login,auth.is_blocked,wishlistController.loadwishlist)
userRoute.delete('/delete-wishlist-item',auth.is_Login,auth.is_blocked,wishlistController.removeItem)

userRoute.post('/search',auth.is_Login,userController.searchProduct)

userRoute.get('/:bname/shop',auth.is_Login,userController.loadbrandpage)

userRoute.get('/contact',auth.is_Login,auth.is_blocked,userController.loadContact)


userRoute.get('/logout',auth.is_Login,userController.logout)


module.exports = userRoute