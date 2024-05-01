const router = require('express').Router();
const User = require('../model/user')

const bcrypt = require('bcrypt');
const saltRounds = 10;

const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
dotenv.config();

router.post("/new/user",async(req,res)=>{
    try {
        const{email,password,username,profile} = req.body;


        let user = await User.findOne({email:req.body.email});
        if(user){
            return res.status(400).json({error:"User already exists"});
        }else{
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(password, salt);
            user = await User.create({email:email,password:password,username:username,profile:profile});
            const accessToken = jwt.sign({
                id:user._id,
                username:user.username, 
            },process.env.JWT_SECRET);
    
    
            res.status(200).json({user,accessToken});
        }

      
    } catch (error) {
        return res.status(400).json({error:"Server Error"});
    }
})


router.get("/login",async(req,res)=>{
    try {
        let user = await User.findOne({email:req.body.email});
        if(user){
            const comparePassword = bcrypt.compare(req.body.password,user.password);
            if(!comparePassword){
                return res.status(400).json({error:"Invalid Password"});
            }
            const accessToken = jwt.sign({
                id:user._id,
                username:user.username, 
            },process.env.JWT_SECRET);
            
            const {password, ...others}=User._doc;
            return res.status(200).json({others,accessToken});   
        }

      
    } catch (error) {
        return res.status(400).json({error:"Server Error"});
    }
})

module.exports = router;