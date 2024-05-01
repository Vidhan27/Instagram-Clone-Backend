const router = require('express').Router();
const Post = require('../model/post');
const User = require('../model/user');
const verifyToken = require('./verifyToken');

router.post("/new/post",verifyToken,async(req,res)=>{
    try {
        const {title,image } = req.body;
        const post = await Post.create({
        title:title,
        image:image,
        user:req.user.id,
    })
    console.log(post);
    res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({error:"Server Error"});
    }
})

router.post("/all/post/by/user",verifyToken,async(req,res)=>{
    try {

       const post = await Post.findById({user:req.user.id});
       if(!post){
        return res.status(200).json("You dont have any post");
       }
       return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({error:"Server Error"});
    }
})

router.put("/:id/like",verifyToken,async(req,res)=>{
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.user.id)){
            await post.updateOne({$push:{likes:req.user.id}})
        }else{
            await post.updateOne({$pull:{likes:req.user.id}})
        }
        return res.status(200).json("You liked this post");
    } catch (error) {
        
    }
})

router.put("/comment/post",verifyToken,async(req,res)=>{
    try {
        const{comment,postid,profile} = req.body;
        const comments = {
            user:req.user.id,
            username:req.user.username,
            profile:profile,
            comment:comment,
        }

        const post = await Post.findById(postid);
        if(!post){
            return res.status(400).json("Not found");
        }
        post.comments.push(comment);
        await post.save();
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({error:"Server Error"});
    }
})

router.put("/:id/follow",verifyToken,async(req,res)=>{
    try {
        if(req.params.id !== req.user.id){
            const user = await User.findById(req.params.id);
            const otherUser = await User.findById(req.body.user);
            
            if(!user.followers.includes(req.body.user)){
                await user.updateOne({$push:{followings:req.body.user}});
                await otherUser.updateOne({$push:{followers:req.params.id}});
                return res.status(200).json("User has been followed");
            }else{
                await user.updateOne({$pull:{followings:req.body.user}});
                await otherUser.updateOne({$pull:{followers:req.params.id}});
                return res.status(200).json("User has been unfollowed");
            }
        }
    } catch (error) {
        return res.status(500).json({error:"Server Error"});
    }
})


//Ranking user post based on comments and like
//Trial
router.get("/flw/:id",verifyToken,async(req,res)=>{
   try {
    const user  = await User.findById(req.params.id);
    const followersPost = await Promise.all(
        user.followings.map((item)=>{
            return Post.find({user:item});
        })
    )

    const userPost = await Post.find({user:user._id});
    const filterProduct = userPost.concat(...followersPost);

    filterProduct.forEach((post)=>{
        const postAge = new Date - new Date(post.createdAt);
        const ageWeight = 1-postAge/(1000*60*60*24);
        const likeWeight = post.likes.length/100;
        const commentWeight = post.comments.length/100;
        post.weight = ageWeight + likeWeight + commentWeight;   
    })

    filterProduct.sort((a,b)=>b.weight - a.weight);

    return res.status(200).json(filterProduct);
   } catch (error) {
        return res.status(500).json({error:"Server Error"});
   }
})

// Get a user for follow

router.get("all/user/:id",verifyToken,async(req,res)=>{
    try {
        const allUser = await User.find();
        const user = await User.findById(req.params.id);
        const following = await Promise.all(
            user.followings.map((item)=>{
                return User.find({user:item});
            })
        )

        let userToFollow = allUser.filter((val)=>{
            return !followinguser.find((item)=>{
                return val._id.toString() === item;
            })
        })

        let filterUser = await Promise.all(
            userToFollow.map((item)=>{
                const {email,followers,followings,password,...others} = item._id;
                return others;
            })
        )

        res.status(200).json(filterUser);
    } catch (error) {
        
    }
})

router.put("/update/password/:id",verifyToken,async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json("User not found");
        }
    
        const isPasswordMatch = await bcrypt.compare(req.body.oldPassword,user.password);
        if(!isPasswordMatch){
            return res.status(400).json("Password is not correct");
        }
        if(req.body.newPassword !== req.body.confirmPassword){
            return res.status(400).json("Password is not match");
        }
    
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword,salt);
        await user.save();
        return res.status(200).json("Password has been updated");
    } catch (error) {
        return res.status(500).json({error:"Server Error"});   
    }
})

router.get("/get/search/user",verifyToken, async(req,res)=>{
    try {
        const keyword = req.query.search
        ?{
            $or:[
                {username:{$regex:req.query.search ,$options:"i"}},
                {email:{$regex:req.query.search ,$options:"i"}}
            ]
        }:{};
    
        const users = await User.find(keyword).find({_id:{$ne:req.user.id}})
        return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({error:"Server Error"});   
    }
})

//Explore Posts

router.get("/explore",verifyToken,async(req,res)=>{
    try {
        const user  = await User.findById(req.params.id);
 
        const userPost = await Post.find({user:user._id});
    
    
        userPost.forEach((post)=>{
            const postAge = new Date - new Date(post.createdAt);
            const ageWeight = 1-postAge/(1000*60*60*24);
            const likeWeight = post.likes.length/100;
            const commentWeight = post.comments.length/100;
            post.weight = ageWeight + likeWeight + commentWeight;   
        })
    
        userPost.sort((a,b)=>b.weight - a.weight);
    
        return res.status(200).json(userPost);
       } catch (error) {
            return res.status(500).json({error:"Server Error"});
       }
})

module.exports = router;