const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    mobile : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    is_block : {
        type : String,
        required : true
    },
    is_admin : {
        type : String,
        required : true
    },
    addresses : [{
        order_name : {
            type : String,
            required : true
        },
        address_number : {
            type : Number,
            required : true
        },
        pincode : {
            type : Number,
            required : true
        },
        locality : {
            type : String,
            required : true
        },
        place : {
            type : String,
            required : true
        },
        state : {
            type : String,
            required : true
        },
        address : {
            type : String,
            required : true
        },
        is_deleted : {
            type : Boolean,
            required : true
        }
    }]
})

module.exports = mongoose.model('User',userSchema)