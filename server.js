require("dotenv").config();
const mongoose = require('mongoose')
mongoose.connect(process.env.mongose)


const express = require('express')
const app = express()
const session = require('express-session');

app.use(session({
    secret: process.env.config,
    saveUninitialized : true,
    resave : false
  }));

const userroute = require('./routes/userRoutes')

const adminroute = require('./routes/adminRoutes')

app.use('/admin',adminroute)

app.use('/',userroute)

app.listen(process.env.port,()=>{
    console.log('http://localhost:3000')
})