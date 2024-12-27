import React, { useState} from 'react';
import {Link, Router} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import {
  Box,
  Button,
  CssBaseline,
  FormLabel,
  FormControl,
  TextField,
  Stack,
  Card as MuiCard,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';


const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
  },
}));

export default function Authentication() {

    const [username, setUserName] = useState();
    const [password,setPassword] = useState();
    const [email, setEmail] = useState();
    const [error,setError] = useState();
    const [msg,setMsg] = useState();
    const [open, setOpen] = useState(false);
    const [formState, setFormState ] = useState(0);

    const {handleRegister, handleLogin} = useContext(AuthContext);

    const navigate = useNavigate();

    let handleAuth = async ()=>{
      try {
        if(formState === 1){
          let res = await handleLogin(username, password);
          // console.log(res);
          setMsg(res);
          setOpen(true);  
          // navigate('/3030');
          setUserName('');
          setError('');
          setPassword('');
        }
        if(formState === 0){
          let res = await handleRegister(username, password, email);
          // console.log(res);
          setMsg(res);
          setOpen(true); 
          // navigate('/3030');
          setUserName('');
          setEmail('');
          setError('');
          setPassword('');
        }
      } catch (err) {
          let mesg = err.response.data.message;
          setError(mesg);
      }
    }


  return (
    <>
      <CssBaseline />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <p style={{textAlign:'center'}}><i>Select <b>Log In</b> for Dummy credentials</i></p>
            <div style={{textAlign:'center'}}>
                <Button
                    onClick={()=>setFormState(0)}
                    variant={formState===0 ? "contained" : ""}
                >Sign up</Button>
                <Button 
                    onClick={()=>setFormState(1)}
                    variant={formState===1 ? "contained" : ""}
                >Log In</Button>
            </div>
            <FormControl>
              <FormLabel htmlFor="username">Username</FormLabel>
              <TextField
                name="username"
                required
                fullWidth
                id="username"
                placeholder="username"
                value={username}
                onChange={(e)=>setUserName(e.target.value)}
              />
            </FormControl>
            {formState === 0 ? 
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                    required
                    fullWidth
                    id="email"
                    placeholder="your@email.com"
                    name="email"
                    autoComplete="email"
                    variant="outlined"
                    onChange={(e)=>setEmail(e.target.value)}
                    value={email}
                    />
                </FormControl> : ""
            }

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                variant="outlined"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
            </FormControl>
            <p style={{color:'red', textAlign:'center'}}><i>{error}</i></p>
            <Button
              type="button"
              fullWidth
              variant="contained"
              onClick={handleAuth}
            >
              Submit
            </Button>
          </Box>
          <Snackbar
            open={open}
            autoHideDuration={4000}
            message={msg}
            style={{textAlign:'center'}}
            onClose={()=>setOpen(false)}
          />
        </Card>
      </SignUpContainer>
    </>
  );
}
