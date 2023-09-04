const Banners = require('../model/bannerModel')

const loadAddBanner = async (req,res) => {
    try {
        res.render('add-banner')
    } catch (error) {
        console.log(error)
    }
}


const addNewBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.render('add-banner', { bannermessage: 'Add image' });
        }

        const newBanner = new Banners({
            images: req.file.filename,
            is_listed : true
        });

        await newBanner.save();
        res.redirect('/admin/load-Banners');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while adding a new banner.');
    }
};


const loadBanners = async(req,res) => {
    try {
        const findBanners = await Banners.find()
        res.render('banners',{banners : findBanners})
    } catch (error) {
        console.log(error)
    }
}

const unlistBanner = async(req,res) => {
    try {
        const banner_id = req.query.bannerid
        const findbanner = await Banners.findByIdAndUpdate({_id : banner_id},{$set : {is_listed : false}})
        res.json({status : true})
    } catch (error) {
        console.log(error)
    }
}

const listBanner = async(req,res) => {
    try {
        const banner_id = req.query.bannerid
        const findbanner = await Banners.findByIdAndUpdate({_id : banner_id},{$set : {is_listed : true}})
        res.json({status : true})
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadAddBanner,
    addNewBanner,
    loadBanners,
    unlistBanner,
    listBanner
}