import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import './App.css'
import LandingPage from './components/landingpage/Landing'
import Authentication from './components/auth/Register'
import { AuthProvider } from './components/context/AuthContext'
import VideoMeet from './components/videomeet/VideoMeet'
function App() {

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path='/register' element={<Authentication/>}/>
            <Route path='/:url' element={<VideoMeet/>}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
