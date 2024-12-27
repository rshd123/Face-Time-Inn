import mongoose from "mongoose";
const Schema = mongoose.Schema;
// const meeting = require("./MeetingModel.js");

const userSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
    },
    // meeting:[
    //     {
    //         type : Schema.Types.ObjectId,
    //         ref : "MeetingModel"
    //     }
    // ]
});

const user = mongoose.model("user",userSchema);
export default user;