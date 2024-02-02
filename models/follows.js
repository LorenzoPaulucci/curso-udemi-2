const {Schema, model} = require("mongoose");

const FollowSchema = Schema({
    user: {type:String, ref:"User"},
    followed: {type:String, ref:"User"},
    created_at: {type:Date,default:Date.now}
    
});

module.exports = model("Follow", FollowSchema, "follows");