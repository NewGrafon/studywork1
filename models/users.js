const mongoose = require("mongoose"),
    ObjectId = mongoose.Schema.Types.ObjectId,
    PassportLocalStrategy = require('passport-local').Strategy;


const passportLocalMongoose = require("passport-local-mongoose");

const users = new mongoose.Schema({
    firstName: {
        type:String,
        required:true,
        unique: false
    },
    lastName: {
        type:String,
        required:true,
        unique: false
    },
    patronymic: {
        type:String,
        required:false,
        unique: false,
        default: "-"
    },
    password: {
        type:String,
        required:true,
        unique: false
    },
    email: {
        type:String,
        required:true,
        unique: true,
        index: true
    },
    telephone: {
        type:String,
        required:false,
        sparse: true,
        unique: true,
        index: true
    },
    logo: {
        type: Object,
        required: false
    },
    accountType: {
      type:Number,
      required:true,
      default: 1,
      index: true
    },
    created: {
        type: Date,
        default: Date.now,
        unique: false
    }
});
users.plugin(passportLocalMongoose);

module.exports = mongoose.model("users",users);