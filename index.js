const express = require('express');
const app = express();
const http= require('http').createServer(app)
const io = require('socket.io')(http,{
    cors: {origin: '*'}
})
const PORT = process.env.PORT || 3000;

let items=[]
let items2=[]

let validKeys=[
    'ABC',
    'DEF'
]
let searchText=''

app.get('/', (req, res)=>{
    res.send("Hello world on port: " +PORT)
})

io.on('connection', (socket)=>{
    console.log('socket connecxted' + socket.id)

    // socket.emit('items', items)
    // socket.emit('searchText', searchText)

    socket.on('message', (message)=>{
        console.log(message)
        const prefix=message.substr(0,message.indexOf(' '))
        const postfix=message.substr(message.indexOf(' ')+1);
        console.log(prefix)
        switch(prefix){
            case 'search':
                // console.log("searching for" + msg_arr[1])
                const text=postfix
                searchText=text
                socket.broadcast.emit('searchText', text);
                break;
            case 'add':
                console.log(postfix)
                socket.broadcast.emit('nuItem', postfix);
                const nuItem={'name':postfix, 'check': false}
                nuItem.name=nuItem.name.toLowerCase()
                items=[nuItem,...items]
                break;
            case 'check':
                // changeStatus(itm, nustatus)
                
                // socket.broadcast.emit('changeStatus', 'text');
                socket.broadcast.emit('changeStatus', postfix);
                updatedItem=JSON.parse(postfix)
                changeStatus(updatedItem.name, updatedItem.check)
                // console.log(updatedItem)
                // Update data
                break;
            case 'refresh':
                console.log("refreshing")
                io.to(socket.id).emit('refresh', items)
                // 
                break;
            case 'delete':
                socket.broadcast.emit('delete', postfix);
                items=[]
            }
// 
    })
    socket.on('valid_key', entry=>{
        // Query database for valid keys
        const isValid=validKeys.includes(entry)
        io.to(socket.id).emit('isValidCode', isValid)
        console.log(entry)
    })

})

function changeStatus(name, status){
    for (let item of items) {
        if (name.toLowerCase().trim() === item.name.toLowerCase().trim()){
            item.check=status
            return
        }
    }
}
http.listen(PORT, ()=> console.log('Listening on port: ' + PORT))