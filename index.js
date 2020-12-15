const express = require('express');
const mongoose = require('mongoose');
const cors= require('cors');
const jwt=require('jasonwebtoken')
const app = express();
const crypto=require('crypto');
app.use(express.json());
app.use(cors());
mongoose.connect('mongodb://localhost/jwt-checking').then(() => console.log('Connected To mongodb'))
.catch((err) => console.log('Exception Occured ', err));
const schemaForData=new mongoose.Schema({
    _email:String,
    _pw:Number,
});
const users=mongoose.model('users',schemaForData);
app.post('/',(req,res)=>{
    users.find({_email:req.body.email},(err,data)=>{
        if(err){
            res.sendStatus(500);
        }else{
            if(data.length===0){
                res.send("there is no such account");
            }else{
                if(data._pw!==req.body.pw){
                    res.send("wrong password");
                }
                else{
                    const users={email:req.body.email, pw:req.body.pw};
                    jwt.sign({user},'secretkey', (err,key)=>{res.json({token})})
                }
            }
        }
    })

})

app.post('/post',verifyToken,(req,res)=>{
    jwt.verify(req.token,'secretkey',(err,data)=>{
        if(err){
            res.sendStatus(403);
        }else{
            res.send({msg:"post created"})
        }
    })
})

function verifyToken(req,res,next){
    const bearerHeader=req.headers['Authorisation'];
    if(typeof bearerHeader!=='undefined'){
        const bearer=bearerHeader.split(' ');
        const bearerToken=bearer[1];
        req.token=bearerToken;
        next();
    }else{
        res.sendStatus(403);
    }
}
app.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        user.findOne({_email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"User dont exists with that email"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                transporter.sendMail({
                    to:user._email,
                    from:"no-replay@insta.com",
                    subject:"password reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
                    `
                })
                res.json({message:"check your email"})
            })

        })
    })
})


app.post('/new-password',(req,res)=>{
   const newPassword = req.body.password
   const sentToken = req.body.token
   user.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
   .then(user=>{
       if(!user){
           return res.status(422).json({error:"Try again session expired"})
       }
       bcrypt.hash(newPassword,12).then(hashedpassword=>{
          user.password = hashedpassword
          user.resetToken = undefined
          user.expireToken = undefined
          user.save().then((saveduser)=>{
              res.json({message:"password updated success"})
          })
       })
   }).catch(err=>{
       console.log(err)
   })
})

app.listen(5000,()=>console.log("listening..."))
