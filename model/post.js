const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    title:{
        type: String,
    },
    image:{
        type:String,
    },
    likes:{
        type:Array,
    },
    comments:[
                {
                    user:{
                        type:mongoose.Schema.Types.ObjectId,
                        required:true,
                    },
                    username:{
                        type:String,
                        required:true,
                    },
                    profile:{
                        type:String,
                        required:true,
                    },
                    comment:{
                        type:String,
                        required:true,
                    }
                }
            ],
    weight:{
        type:Number,
    }
  
},{timestamps:true})

module.exports = mongoose.model('Post',PostSchema);
