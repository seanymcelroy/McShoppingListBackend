const express = require('express');
const app = express();
const http= require('http').createServer(app)
const io = require('socket.io')(http,{
    cors: {origin: '*'}
})
var AWS = require("aws-sdk");
require('dotenv').config()
const PORT = process.env.PORT || 3000;

AWS.config.update({
    region: "eu-west-1",
    endpoint: 'dynamodb.eu-west-1.amazonaws.com',
// Should hide these keys
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_key
  });


const dynamodb = new AWS.DynamoDB()
var docClient = new AWS.DynamoDB.DocumentClient();

let items=[]
let items2=[]

let validKeys=[]
let searchText=''

console.log(generateCode(8))

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
    socket.on('call_roomkeydb', entry=>{
        // Query database for valid keys
        const params = {
            TableName: "room_codes",
        
        };
        
        docClient.scan(params, onScan);
        var count = 0;
        
        function onScan(err, data) {
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                validKeys=[]        
                console.log("Scan succeeded.");
                data.Items.forEach(function(room) {
                    validKeys.push(room.code);
                 });
                console.log(validKeys)
                // continue scanning if we have more items
                if (typeof data.LastEvaluatedKey != "undefined") {
                    console.log("Scanning for more...");
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    docClient.scan(params, onScan);
                }
            }
        }
       
        // Set valid keys
    })
    socket.on('valid_key', entry=>{
        const isValid=validKeys.includes(entry)
        io.to(socket.id).emit('isValidCode', isValid)
        // console.log(validKeys)
        console.log(entry)
    })
    socket.on('generate_key', entry=>{
        const nuCode=generateCode(8)
        // Store key in database
        io.to(socket.id).emit('gimme_key', nuCode)
        // Set valid keys
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

function generateCode(length){
    let possibleChars = '';
    possibleChars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    possibleChars += '0123456789';
        
    let result = '';
    for (var i = length; i > 0; --i) {
        result += possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }
    return result;
    
}
http.listen(PORT, ()=> console.log('Listening on port: ' + PORT))