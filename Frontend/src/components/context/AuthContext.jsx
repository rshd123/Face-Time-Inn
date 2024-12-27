import { createContext, useContext, useState } from "react";
import axios, { HttpStatusCode } from 'axios';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL:"http://localhost:3000/users"
});

export const AuthProvider = ({children})=>{
    const authContext = useContext(AuthContext);

    const [userData, setUserData] = useState(authContext);
    // const navigate = useNavigate();

    const handleRegister = async (username, password, email)=>{
        try {
            let req = await client.post("/signup",{
                username: username,
                email: email,
                password: password
            })
            if(req.status === HttpStatusCode.Created){
                // console.log(req.data.message)
                return req.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password)=>{
        try {
            let req = await client.post('/login',{
                username: username,
                password: password
            })

            if(req.status === HttpStatusCode.Ok){   
                localStorage.setItem("token",req.data.token);
                return req.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const data ={
        userData, setUserData, handleRegister, handleLogin
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
}