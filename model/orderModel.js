const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    user_id : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    user_name : {
        type : String,
        required : true
    },
    order_Address : {
        type : String,
        required : true
    },
    order_date : {
        type : Date,
        required : true
    },
    delivery_status : {
        type : String,
        required : true
    },
    totalprice: {
        type : Number,
        required : true
    },
    payment_type : {
        type : String,
        required : true
    },
    orders : [{
        product_id : {
            type : mongoose.Types.ObjectId,
            required : true
        },
        product_name : {
            type : String,
            required : true
        },
        product_price : {
            type : Number,
            required : true
        },
        product_qauntity : {
            type : Number,
            required : true
        },
        product_image : {
            type : String,
            required : true
        }
    }]
})

module.exports = mongoose.model('Order',orderSchema)