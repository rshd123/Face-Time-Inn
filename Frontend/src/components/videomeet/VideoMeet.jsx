import React, { useRef, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { TextField, Button, iconButtonClasses } from '@mui/material';
import { Router } from 'react-router-dom';

const server_url = "http://localhost:3000";
var connections = {};

const peerConnectionConfig = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
    ]
};

export default function VideoMeet() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localStreamRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(false);
    let [audioAvailable, setAudioAvailable] = useState(false);

    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();

    let [screenSharing, setScreenSharing] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState(false);

    let [modal, setModal] = useState();

    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState('');
    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState('');

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    const getPermissions = async () => {

        //Video Permission
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            }
        } catch (err) {
            console.error("Video Error: " + err);
        }

        //Audio Permission
        try {
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            }
        } catch (err) {
            console.error("Audio Error: " + err);
        }

        //screen permission
        // try {
        //     const screenPermission = await navigator.mediaDevices.getDisplayMedia({video:true});
        //     if(screenPermission){
        //         setScreenAvailable(true);
        //     }
        // } catch (err) {
        //     console.error('Screen Error: '+err);
        // }

        try {
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable })
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localStreamRef.current) {
                        localStreamRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getPermissions();
    });


    let silence = () => {
        let context  = new AudioContext();
        let oscillator = context.createOscillator();

        let dst = oscillator.connect(context.createMediaStreamDestination());

        oscillator.start();
        context.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
    }

    let black = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement('canvas'),{width, height});

        canvas.getContext('2d').fillRect(0,0,width,height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled:false});
    }

    //TODO: get user media success
    let  getUserMediaSuccess = (stream)=>{
        try {
            window.localStream.getTracks().forEach(track=> track.stop());
        } catch (err) {
            console.error(err);
        }

        window.localStream = stream;
        localStreamRef.current.srcObject = stream;

        for(let id in connections){

            if(id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer()
                .then((description)=>{
                    // console.log(description);
                    connections[id].setLocalDescription(description) 
                        .then(()=>{
                            // console.log(socketRef);
                            socketRef.current.emit('signal', id, JSON.stringify({'sdp':connections[id].localDescription}))
                        })
                        .catch(err => console.error('Create Descriptions error: '+err));
                })
                .catch(err => console.error('Create Offer error: '+err));
        } 

        stream.getTracks().forEach(track => track.onended = () => {
            setAudio(false);
            setVideo(false);

            try {
                let tracks =  localStreamRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop());  
            } catch (err) {
                console.error(err);
            }

            //TODO: BLACKSILENCE

            let blackSilence = (...args) => new MediaStream([silence(), black(...args)]);
            window.localStream = blackSilence();
            localStreamRef.current.srcObject = window.localStream;

            for(let id in connections){
                connections[id].addStream(window.localStream);
                connections[id].createOffer()
                    .then((description)=>{
                        connections[id].setLocalDescription(description)
                            .then(()=>{
                                socketIdRef.current.emit('signal', id, JSON.stringify({'sdp':connections[id].localDescription}));
                            })
                            .catch(err => console.error('Create Descriptions error: '+err));
                    })
            }
        })

    }


    let getUserMedia = () => {
        if ((video && videoAvailable) && (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(getUserMediaSuccess) //TODO: get user succces
                .then((stream) => { })
                .catch((err) => { console.error(err) });
        } else {
            try {
                    let tracks = localStreamRef.current.srcObject.getTracks()
                    tracks.forEach(track => { track.stop() })
            } catch (err) {
                console.error(err);
            }
        }
    }

    
    const gotMessageFromServer = (fromId, message) => {
        // console.log(`Id: ${fromId} Message: ${message}`);

        var signal = JSON.parse(message);
        
        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(()=>{
                        if(signal.sdp.type === 'offer'){
                            connections[fromId].createAnswer()   
                                .then((description)=>{
                                    connections[fromId].setLocalDescription(description)
                                        .then(()=>{
                                            socketRef.current.emit(('signal', fromId, JSON.stringify({'sdp':connections[fromId].localDescription})))
                                        })
                                        .catch(err => console.error('Create Descriptions error: '+err))
                                })
                                .catch(err => console.error('Create Answer error: '+err))
                        }
                    })
                    .catch(err => console.error('Set Remote Descriptions error: '+err)) 
            }
            setTimeout(100,()=>{
                if(signal.ice){
                    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                        .catch(err => console.error(err))
                }
            })
        }
    }

    const addMessage = (data, sender, socketIdSender) => {

    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('user-left', (id) => {
                //TODO : remove video
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConnectionConfig);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate !== null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }


                    connections[socketListId].onaddStream = (event) => {

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId)

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            }


                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });

                        }
                    };

                    if (window.localStream !== null && window.localStream !== undefined) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        //TODO: BLACKSILENCE

                        let blackSilence = (...args) => new MediaStream([silence(), black(...args)]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }

                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (error) {
                            console.error('Add Stream: '+error);
                        }

                        connections[id2].createOffer()
                            .then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                    })
                                    .catch(err => console.error('Create Offer/Descriptions error: '+err));
                            }) 
                    }
                }

            })


        })
    }


    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    useEffect(() => {
        if(video !== undefined && audio !== undefined){
            getUserMedia();
        }
    }, [audio, video]);


    let connect = ()=>{
        setAskForUsername(false);
        getMedia();
    }

    return (
        <div className='VideoMeet'>
            {
                askForUsername === true ?
                    <div>
                        <h2>Enter Lobby: </h2>
                        <TextField
                            id="outlined-basic"
                            label="Username"
                            variant="outlined"
                            onChange={(e) => { setUsername(e.target.value) }}
                            value={username}
                        />
                        <Button variant="contained" onClick={connect}>connect</Button>
                        <div>
                            <video
                                ref={localStreamRef}
                                autoPlay
                                muted
                            ></video>
                        </div>
                    </div>
                    :
                    <>
                        <video 
                            ref={localStreamRef} 
                            autoPlay 
                            muted
                        ></video>
                        {console.log(videos)}
                        {videos.map((video)=>(

                                <div key={video.socketId}>
                                    <h2>{video.socketId}</h2>
                                </div>
                        ))}
                    </>
            }
        </div>
    );
}

