const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
    },
    profile:{
        type:String,
    },
    followers:{
        type:Array,
    },
    followings:{
        type:Array,
    },
    password:{
        type:String,
        required:true,
    },
  
},{timestamps:true})

module.exports = mongoose.model('User',UserSchema);
