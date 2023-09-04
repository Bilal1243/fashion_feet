const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    brand_name : {
        type : String,
        required : true
    },
    product_name : {
        type : String,
        required : true
    },
    og_price : {
        type : Number,
        required : true
    },
    offer_price : {
        type : Number,
        required : true
    }, 
    model_name : {
        type : String,
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    outer_material : {
        type : String,
        required : true
    },
    ideal_for : {  
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    image : {
        type : Array
    },
    is_listed : {
        type : Boolean,
        required : true
    }
})

module.exports = mongoose.model('Product',productSchema)