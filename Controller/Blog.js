// const cafeSchema = require('../models/Cafe')
// const dishSchema = require('../models/Dishes')
const mongoose = require('mongoose')
// const commentSchema = require('../models/Comments')
// const UserSchema = require('../../models/User')
const jwt = require('jsonwebtoken')
// var cryptojs = require('crypto-js')
// const MediaSchema = require('../models/Media')
const BlogSchema = require('../Models/Blog')
// const actionSchema = require('../models/Action')
const tagSchema = require("../Models/Tags")
const Blog = require('../Models/Blog')
// const NotificationSchema = require('../models/Notification')
// const sendEmail = require('../functions/SendEmail')
const fhost = process.env.FRONTENDLINK
const fetchBlogs = async (req, res) => {
  const pageNo = req.body.pageNo || 1;
  const searchText = req.body.searchText || "";
  console.log(searchText);

  const psize = 10;
  const skip = (pageNo - 1) * psize;

  try {
    let blogs;

    if (searchText === "") {
      blogs = await BlogSchema.find({ approved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(psize);
    } else {
      blogs = await BlogSchema.find(
        {
          approved: true,
          $text: { $search: searchText },
        },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(psize);
    }

    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ msg: "Error in fetching blogs" });
  }
};

const fetchByTitle = async (req,res)=>{
  const title = req.body.title
  console.log('this is title ',title)
  let blog
  console.log(title.slice(0,7),title.slice(6))
  try {
    if(title.slice(0,7)==='ititled'){
       blog = await BlogSchema.aggregate([

        { $match: {  _id: new mongoose.Types.ObjectId(title.slice(7)) ,approved:true} },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorDetails'
          }
        },
        { $unwind: '$authorDetails' },
        {
          $project: {
            title: 1,
            body: 1,
            thumbnail: 1,
            tags: 1,
            likeCount: 1,
            commentCount:1,
            createdAt: 1,
            status: 1,
            'authorDetails.username': 1,
            'authorDetails.image': 1,
            'authorDetails.email': 1
          }
        }
      ]);
      
    }
    else{
       blog = await BlogSchema.aggregate([
        { $match: {  title: title,approved:true } },
        {
          $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'authorDetails'
          }
        },
        { $unwind: '$authorDetails' },
        {
          $project: {
            title: 1,
            body: 1,
            thumbnail: 1,
            tags: 1,
            likeCount: 1,
            commentCount:1,
            createdAt: 1,
            status: 1,
            'authorDetails.username': 1,
            'authorDetails.image': 1,
            'authorDetails.email': 1
          }
        }
      ]);
      
    }
   const resp2 = await BlogSchema.updateOne({title:title.slice(7)},{$inc: { views: 1 } })
    res.status(200).json(blog)
  } catch (error) {
    console.log(error)
    res.status(300).json({msg:'error in fetching single blog'})
  }

}
// const checkIsClapped = async(req,res)=>{
//   const email = req.user.email
//   const title = req.query.title
//   try {
//     const result = await BlogSchema.findOne({title:title});
//     if(result.likesArray.includes(email)){
//       res.status(200).json(true)  
//     }
//     else{
//       res.status(200).json(false)  
//     }
 
    
//   } catch (error) {
//     res.status(300).json({mag:'eror in checking is clapped'})
//   }

// }
// const like = async (req, res) => {
//   const email = req.user.email;
//   const id = req.body.bid;
//   const isClapped = req.body.isClapped;

  
  
  
//   try {

//     const user = await UserSchema.findOne({email:req.user.email})
//     const blog = await  BlogSchema.findOne({_id:id})

//     const author = await UserSchema.findOne({_id:blog.author})
//     let subject =  `You are getting Viral 😍😍 on CafesClub`
//     let text = `You have a notification in your CafesClub account`
//     let html=`
//     ${text} </br>
//     <a href='${fhost}/notifications'>check now</a>
//     `
//     await sendEmail(author.email,subject,text,html)

//     const notification = {
//       userid:blog.author,
//       performerid:user._id,
//       action:'like',
//       content:'blog',
//       contentid:id,
//       url:`/blog/${blog.title}`
//     }
   
   
//       const action = {
//          userid:user._id,
//          action:'like',
//          content:'blog',
//          contentid:id,
//          url:`/blog/${blog.title}`
//       }
    
//     // Update the likeCount
//     const updateCountResult = await BlogSchema.updateOne(
//       { _id: id },
//       { $inc: { likeCount: isClapped ? -1 : 1 } }
//     );

//     // Update the likesArray
//     let updateLikesResult;
//     if (isClapped) {
//       notification.action = 'unlike'
//       action.action = 'unlike'
//       updateLikesResult = await BlogSchema.updateOne(
//         { _id: id },
//         { $pull: { likesArray: email } }
//       );
//     } else {
//       updateLikesResult = await BlogSchema.updateOne(
//         { _id: id },
//         { $addToSet: { likesArray: email } } // Using $addToSet to avoid duplicates
//       );
//     }
    
//     const nnotificaition = new NotificationSchema(notification)
//     const resp1 = await nnotificaition.save() 
   
//     const naction = new actionSchema(action)
//     const resp = await naction.save()
//     res.status(200).json({ msg: 'Like status updated successfully' });
//   } catch (error) {
//     console.error('Error updating like status:', error);
//     res.status(500).json({ msg: 'Error updating like status' });
//   }
// };

// new functions
const fetchTags = async (req,res)=>{
  const prefix = req.query.tname
  try {
    const regex = new RegExp(`^${prefix}`, 'i'); // 'i' for case-insensitive matching
    const query = { name: { $regex: regex } };
    const tags = await tagSchema.find(query)
    res.status(200).json(tags)
  } catch (error) {
    res.status(300).json({msg:'error in fetching tags backend'})
  }
}

const checkTitle = async (req,res)=>{
  const tname = req.query.tname
  try {
    const tlist =await BlogSchema.find({title: { $regex: `^${tname}$`, $options: 'i' },approved:true})
    res.status(200).json(tlist)
  } catch (error) {
    res.status(300).json({msg:'error in fetching title backend'})
  }
}
const sendBlogNotification = async (title, authorId) => {
  const text = 'Explore the world of cafes with CafesClub';
  const html = `
    💡💡 Read this fantastic blog by <a href='${fhost}/user?id=${authorId}'>${authorId}</a><br/>
    <a href='${fhost}/blog/${title}'>${title}</a>
  `;

  try {
    // Fetch all users
    const userList = await UserSchema.find({}, 'email'); // Fetch only the email field

    // Send emails to all users
    const emailPromises = userList.map(user => sendEmail(user.email, title, text, html));
    await Promise.all(emailPromises);

    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error sending blog notification emails:', error);
  }
};

const add = async (req,res)=>{
   const title = req.body.title
   const body = req.body.body
   const status = req.body.status
   const tags = req.body.tags
   const thumbnail = req.user.image
   const extractedTags = []
   
   
    //  sendBlogNotification(title,req.user.firstName)
  

   for(let d of tags){
    extractedTags.push(d.value)
   }
   console.log('tags are ',extractedTags,tags)
   try {
    
   
    const blog = {
      title:title,body:body,status:status,tags:extractedTags,thumbnail:thumbnail,author:req.user,thumbnail:'#'
    }
    const newBlog = new BlogSchema(blog)
    const resp = await newBlog.save()
    res.status(200).json(resp)
   } catch (error) {
    console.log(error)
    res.status(300).json(error)
   }
}

const decrypt = async(text)=>{
  return text
}
// const fetchBlogsWithAuthor = async (req,res)=>{
//   const authoremail =await decrypt(req.query.em)
//   try {
//     const user =await UserSchema.findOne({email:authoremail})
//     // console.log("user are",user)
//     const resp =await BlogSchema.find({author:user._id}).limit(3)

//     res.status(200).json(resp)
//   } catch (error) {
//     // console.log(error)
//     res.status(300).json({msg:'error in fetching blog with author yes'})
//   } 
// }

const fetchBlogsWithTags = async (req,res)=>{
  const tags = req.body.tags
  try {
    const result = await BlogSchema.aggregate([
      {
        $addFields: {
          tagMatchCount: {
            $size: {
              $filter: {
                input: "$tags",
                as: "tag",
                cond: {
                  $or: tags.map(tag => ({
                    $regexMatch: {
                      input: "$$tag",
                      regex: new RegExp(tag, "i") // Case-insensitive partial match
                    }
                  }))
                }
              }
            }
          }
        }
      },
      {
        $match: {
          tagMatchCount: { $gt: 0 },approved:true
        }
      },
      {
        $sort: {
          tagMatchCount: -1
        }
      },
      {
        $limit: 3
      }
    ]);
    res.status(200).json(result)
  } catch (error) {
    res.status(300).json({msg:'error in fetching tags blogs backend'})

  }
}

const getHomeBlogs =async (req,res)=>{
  try {
    // Fetch 5 latest approved blogs sorted by creation date
    const blogs = await Blog.find({ approved: true })
        .sort({ createdAt: -1 })
        .limit(5);

    res.status(200).json(blogs);
} catch (error) {
    console.error("Error fetching home blogs:", error);
    res.status(500).json({ message: "Error fetching blogs" });
}

}

module.exports = {
    fetchBlogs,
    fetchByTitle,
    // checkIsClapped,
    // like,
    fetchTags,
    checkTitle,
    add,
    // fetchBlogsWithAuthor,
    fetchBlogsWithTags,
    getHomeBlogs
}