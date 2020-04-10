

// npm run devStart puis => http://127.0.0.1:3000/


const express = require('express')
const app = express()
const server = require('http').Server(app)

const io = require('socket.io')(server)

//Initialisation EJS
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended:true }))

const rooms = {}

app.get('/', (req, res) => {
    res.render('index', { rooms: rooms})
})

app.post('/room', (req,res) => {
    if (rooms[req.body.room] != null) {
        return res.redirect('/')
    }
    rooms[req.body.room] = { users: {}}
    res.redirect(req.body.room)
    //Envoyer un message pour indiquer qu'un nouveau canal a été crée
    io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) => {
    //sécurité permettant de rediriger l'utilisateur à l'index.ejs si ce dernier est dirigé vers un canal qui n'existe pas
    if (rooms[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', {roomName: req.params.room})
})

server.listen(3000) //imposer l'écoute sur le bon port

io.on('connection', socket => {
    //Indiquer qu'un utilisateur s'est connecté
    socket.on('new-user', (room, name) => {
        socket.join(room)
        rooms[room].users[socket.id] = name
        //Le .to(room) permet l'envoi du message à l'utilisateur dans la même room, et pas dans une extérieure
        socket.to(room).broadcast.emit('user-connected', name)
    })

    socket.on('send-chat-message', (room, message) => {
        //Le .to(room) permet l'envoi du message à l'utilisateur dans la même room, et pas dans une extérieure
        socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] }) //envoyer le message à tous les clients connectés sur le serveur à l'exception de l'expéditeur
    })

    //Indiquer qu'un utilisateur s'est deconnecté
    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].users[socket.id])
            delete rooms[room].users[socket.id]
        })
      })
    })

    function getUserRooms(socket) {
        return Object.entries(rooms).reduce((names, [name, room]) => {
            if (room.users[socket.id] != null) names.push(name)
            return names
        }, [])
    }