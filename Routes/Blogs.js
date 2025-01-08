const express = require('express')
const bodyParser = require('body-parser')
const {  fetchBlogs,
    fetchByTitle,
    // checkIsClapped,
    // like,
    fetchTags,
    checkTitle,
    add,
    // fetchBlogsWithAuthor,
    fetchBlogsWithTags
} = require('../Controller/Blog')
// const { requiresAuth } = require('../Middleware/userAuth')
const { userAuth } = require('../Middleware/userAuth')

const BlogRouter = express.Router()

const jsonparser = bodyParser.json()

BlogRouter.post("/fetchwithinp",fetchBlogs)
BlogRouter.post("/fetchbytitle",fetchByTitle)
// BlogRouter.get("/checkisclapped",requiresAuth,checkIsClapped)
// BlogRouter.post("/like",requiresAuth,like)
BlogRouter.get("/fetchtags",userAuth,fetchTags)
BlogRouter.get("/checktitle",userAuth,checkTitle)
BlogRouter.post("/add",userAuth,add)
// BlogRouter.get("/authorblog",fetchBlogsWithAuthor)
BlogRouter.post("/tagblog",fetchBlogsWithTags)
module.exports = BlogRouter