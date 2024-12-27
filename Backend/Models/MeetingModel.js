const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const meetingSchema = new Schema({
    meetingCode:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now,
        required:true
    }
});

const meeting = mongoose.model("meeting",meetingSchema);
module.exports = meeting;