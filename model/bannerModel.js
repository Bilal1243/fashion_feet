const mongoose = require('mongoose')

const bannerSchema = mongoose.Schema({
    images : {
        type : String,
        required : true
    },
    is_listed : {
        type : Boolean,
        required : true
    }
})

module.exports = mongoose.model('Banners',bannerSchema)