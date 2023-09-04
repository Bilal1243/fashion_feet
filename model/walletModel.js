const mongoose = require('mongoose')

const walletSchema = mongoose.Schema({
    user_id : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    balance : {
        type : Number,
        required : true
    },
    ref_code : {
        type : String,
        required : true
    },
    history : [{
        from : {
            type : String,
            required : true
        },
        price : {
            type : String,
            required : true
        },
        date : {
            type : Date,
            required : true
        }
    }]
})

module.exports = mongoose.model('Wallet',walletSchema)