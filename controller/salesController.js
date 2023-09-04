const Order = require("../model/orderModel"); // Import your Order model here
const Product = require("../model/productModel"); // Import your Product model here
const User = require("../model/userModel"); // Import your User model here

module.exports = {

  SalesReport: async (req, res) => {
    try {
      const report = await Order.aggregate([
        {
          $match: {
            delivery_status: "Delivered",
          },
        },
      ]);
      res.render("saleReport", { orders: report });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send("An error occurred while generating the sales report.");
    }
  },

  dateReport: async (req, res) => {
    try {
      // Get the date strings from request body
      const startDateString = req.body.start;
      const endDateString = req.body.end;

      // Validate date inputs using a regular expression for the "YYYY-MM-DD" format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
      if (!dateRegex.test(startDateString) || !dateRegex.test(endDateString)) {
        // Handle invalid date inputs
        res.status(400).json({ error: 'Invalid date format in request' });
        return;
      }

      // Parse the valid date strings as JavaScript Date objects
      const startDate = new Date(startDateString);
      const endDate = new Date(endDateString);
      const today = new Date()
      

      if(req.body.start > today || req.body.end < req.body.start){
        res.status(500).send(
             "An error occurred while fetching orders within the date range.give valid date",
          );
          return
      }
      // Use Mongoose to find orders within the date range that are also 'Delivered'
      const ordersInRangeAndDelivered = await Order.aggregate([
        {
          $match: {
            $and: [
              { "delivery_status": "Delivered" },
              {
                "order_date": {
                  $gte: startDate,
                  $lte: new Date(endDate.getTime() + 86400000),
                },
              },
            ],
          },
        },
      ]).exec();

      res.render('saleReport',{ orders: ordersInRangeAndDelivered });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while fetching orders within the date range.",
      });
    }
  },
  
  

}