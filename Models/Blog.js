const mongoose = require('mongoose');

// Schema for blog post

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: [
        
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    thumbnail:{
        type:String,
        default:'#'
    },
    tags: [],
    likeCount:{
        type:Number,
        default:0
    },
    commentCount:{
        type:Number,
        default:0
    },
    likesArray: [{
        type: String,
        required:true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    views:{
        type:Number,
        default:0
    },
    approved:{
        type:Boolean,
        default:false
    }
});

blogPostSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Blog = mongoose.model('blog', blogPostSchema);

module.exports = Blog;
