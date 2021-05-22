const express = require('express');
const app = express();
const http= require('http').createServer(app)
const io = require('socket.io')(http,{
    cors: {origin: '*'}
})

const items=[{name: 'cheese', check: false},
{name: 'dunkin doughnuts', check: false},
{name: 'toast', check: true},
{name: 'poptart', check: false}]

let searchText='Cheese'

app.get('/', (req, res)=>{
    res.send("Hello world3")
})

io.on('connection', (socket)=>{
    console.log('socket connecxted' + socket.id)

    socket.emit('items', items)
    socket.emit('searchText', searchText)

    socket.on('message', (message)=>{
        console.log(message)
        msg_arr =message.split(" ");
        console.log(msg_arr)
        switch(msg_arr[0]){
            case 'search':
                console.log("searching for" + msg_arr[1])
                searchText=msg_arr[1]
                socket.broadcast.emit('searchText', searchText);
                break;
        }

    })

})

const PORT = process.env.PORT || 3000;
http.listen(PORT, ()=> console.log('Listening on port: ' + PORT))