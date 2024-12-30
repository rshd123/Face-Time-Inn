import { Server } from "socket.io";   

let connections = {};
let messages = {};
let timeOnline = {};

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        let socketId = socket.id;
        console.log("Something is Connected");
        socket.on('join-call', (path) => {

            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnline[socketId] = new Date();

            // If not working use For Loop
            connections[path].forEach(element => {
                io.to(element).emit("user-joined", socket.id, connections[path]);
            });

            if (messages[path] != undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socketId).emit('chat-message', 
                        messages[path][a]['data'],
                        messages[path][a]['sender'], 
                        messages[path][a]['socket-id-sender']
                    );
                }
            }
        });

        socket.on('signal', (toId, message) => {
            io.to(toId).emit('signal', socketId, message);
        });

        socket.on('chat-message', (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socketId)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];   
                }

                messages[matchingRoom].push({
                    'sender': sender,
                    'data': data, 
                    'socket-id-sender': socketId,
                });
                
                console.log('message', matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach((el) => {
                    io.to(el).emit('chat-message', data, sender, socketId);
                });
            }
        });

        socket.on('disconnect', () => {
            let diffTime = Math.abs(timeOnline[socketId] - new Date());
            let key;

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socketId) {
                        key = k;
                        for (let i = 0; i < connections[key].length; ++i) {
                            io.to(connections[key][i]).emit('user-left', socketId);
                        }

                        let index = connections[key].indexOf(socketId);

                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                }
            }
        });
    });
}

export default connectToSocket;