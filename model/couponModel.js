const mongoose = require('mongoose')

const coupunSchema = mongoose.Schema({
    coupon : {
        type : String,
        required : true
    },
    start : {
        type : Date,
        default :  Date.now(),
        required : true
    },
    validity : {
        type : Date,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    used_by : {
        type : [String]
    },
    offer : {
        type : Number,
        required : true
    },
    min_price : {
        type : Number,
        required : true
    },
    max_price : {
        type : Number,
        required : true
    }
})

module.exports = mongoose.model('Coupons',coupunSchema)