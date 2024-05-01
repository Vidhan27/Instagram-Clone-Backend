const jwt = require('jsonwebtoken');

const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.token;
    if(authHeader){
        const token = authHeader;
        jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
            if(err) return res.status(401).json("Token is not valid!");
            req.user = user;
            next();
        })
    }else{
        return res.status(401).json("You are not authenticated!");
    }
}

module.exports = verifyToken;