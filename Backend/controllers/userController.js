import bcrypt,{hash} from 'bcrypt';
import user from '../Models/UserModel.js';
import { HttpStatusCode } from 'axios';
import crypto from'crypto';

const login = async(req,res)=>{
    const {username,password} = await req.body;
    if(!username || !password){
        return res.status(400).json({message:'Incomplete Username / Password'});
    }
    try{
        const User = await user.findOne({username});
        if(!User){
            return res.status(HttpStatusCode.NotFound).json({message:'user not found'});
        }

        const match = await bcrypt.compare(password, User.password);
        if(match){
            let token = crypto.randomBytes(20).toString('hex');
            User.token = token;
            await User.save();
            return res.status(HttpStatusCode.Ok).json({token: token, message:'Logged in successfully'});
        }else{
            return res.status(HttpStatusCode.Unauthorized).json({message:'Invalid Username or password'});
        }
    }
    catch(e){
        return res.status(500).json({message:`${e}`});  
    }
}


const signUp = async (req,res)=>{
    const {username,email,password} = req.body;
    try{
        const existingUser = await user.findOne({username});
        if(existingUser){
            return res.status(HttpStatusCode.Found).json({message:"User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        
        const newUser = new user({
            username:username,
            email:email,
            password:hashedPassword,
        });

        await newUser.save()
        res.status(HttpStatusCode.Created).json({message:"User registered successfully"});
    }catch(e){
        res.json({message:`${e}`})
    }
}

export {signUp,login};