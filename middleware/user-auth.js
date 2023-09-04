const mongoose = require('mongoose')
const User = require('../model/userModel')

const is_Login = async(req,res,next) => {
    try {
        if(req.session.user_id){
            next()
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
}
const is_Logout = async(req,res,next) => {
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }
        else{
            next()
        }
    } catch (error) {
        console.log(error)
    }
}

const is_blocked = async(req,res,next) => {
    try {
        const finduser  = await User.findOne({_id : req.session.user_id})
        if(finduser.is_block === '0'){
            req.session.block = 0
            next()
        }else{
            req.session.block = 1
            req.session.user_id = null
            res.redirect('/')
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    is_Login,
    is_Logout,
    is_blocked
}