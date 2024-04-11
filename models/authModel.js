const {model,Schema} = require('mongoose');
const mongoose = require('mongoose');

const registerSchema = new Schema({

     id:{
          type: String,
          required: true,
     },
     userName : {
          type : String,
          required : true
     },
     email : {
          type: String,
          required : true
     },
     password : {
          type: String,
          required : true,
          select : false
     },
     image : {
          type: String,
          // required : true
     }
},{timestamps : true});

module.exports = model('user',registerSchema);