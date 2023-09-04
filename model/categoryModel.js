const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    category_name : {
        type : String,
        required : true
    },
    category_logo : {
        type : String,
        required : true
    },
    is_listed : {
        type : Boolean,
        required : true
    },
    offer : {
        type : Number,
        default : 0
    }
})

module.exports = mongoose.model('Category',categorySchema)