const express = require('express');
const app = express();
const http= require('http').createServer(app)
const io = require('socket.io')(http,{
    cors: {origin: '*'}
})

let items=[{name: 'cheese', check: false},
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
        const prefix=message.substr(0,message.indexOf(' '))
        const postfix=message.substr(message.indexOf(' ')+1);
        console.log(postfix)
        switch(prefix){
            case 'search':
                // console.log("searching for" + msg_arr[1])
                const text=postfix
                searchText=text
                socket.broadcast.emit('searchText', text);
                break;
            case 'add':
                console.log('adding')
                const nuItem=JSON.parse(postfix)
                if(isItemUnique(nuItem.name)){
                    items=[nuItem,...items]
                    io.sockets.emit('nuItem', nuItem);
                }
        }

    })

})

function isItemUnique(nueName){
    for (let item of items) {
        if (nueName.toLowerCase().trim() === item.name.toLowerCase().trim()){
            return false
        }
    }
    return true
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, ()=> console.log('Listening on port: ' + PORT))