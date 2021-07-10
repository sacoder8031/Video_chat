const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);
// const io2 = require('socket.io')(server);


// importing library uuid for generating random room id
const {v4 : uuidv4} = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug : true
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

roomidList = [];

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
    //  res.render('index');
});

// app.get('/chat', (req, res) => {
//     res.render('chat');
// });

app.get('/:room' , (req, res) => {
    res.render('room', { roomId: req.params.room})
});


const users = {};

// const video_users = {};
// const socketToRoom = {};

const video_users = {}
const user_name = {}
const user_id = {}


io.on('connection', socket => {
    // #############
    // socket.on('new-user-joined', name => {
    //     console.log("new user", name);
    //     users[socket.id] = name;
    //     socket.broadcast.emit('user-joined', name);
    // })

    // socket.on('send', message => {
    //     socket.broadcast.emit('receive', {
    //         message: message, name: users[socket.id]
    //     })
    // })

    // socket.on('disconnect', message => {
    //     socket.broadcast.emit('left', users[socket.id]);
    //     delete users[socket.id];
    // })

    // ##############

    socket.on('join-room', (roomId, userId, name1) => {
       
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        // broadcast - to everyone in the room
        video_users[socket.id] = roomId
        user_name[socket.id] = name1;
        user_id[socket.id] = userId
    })

    socket.on('message', (message) => {
        io.to(video_users[socket.id]).emit('createMessage', message, user_name[socket.id]);
    })

    socket.on('disconnect', () => {
        socket.to(video_users[socket.id]).emit('user-disconnected', user_id[socket.id])
        delete video_users[socket.id]
        delete user_name[socket.id]
        delete user_id[socket.id]
    })


});



server.listen(process.env.PORT || 3030);