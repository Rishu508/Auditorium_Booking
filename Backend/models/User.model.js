const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    Firstname: {
        type : String , 
        required  : true
    },
    Lastname : {
        type : String , 
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    } , 
    password : {
        type : String , 
        required : false 
    } ,
    googleId : {
        type : String , 
        default : null
    } ,
    Role : {
        type : String ,
        default : "User"
    } ,
    refreshtoken : {
        type : [String],
        default : []
    } ,
    resetPasswordToken  : {
        type : String
    },
    resetPasswordTokenExp :{
        type : Date
    },
    emailverificationtoken : {
        type : String ,
        default : null
    } ,
    emailverificationtokenExpiry : {
        type : Date ,
        default : null
    } ,
    isverified : {
        type : Boolean , 
        default : false
    }
}, {timestamps : true})


module.exports = mongoose.model("User" , UserSchema)