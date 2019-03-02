const express = require('express');
const index = require('./routes/index');
const path = require('path');
const app = express();
const http = require('http');
const server = http.Server(app);
const socket = require('socket.io');
const io = socket(server);
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');
const db = require('./db.js')

app.set('views', __dirname +'/views');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/', index.router);
app.use('/',express.static(__dirname + '/public'));

var array = []
var occupants = {}


app.post('/show',function (req,res) {
    console.log('server side')
    db.show();
})

io.of('/namespace').on('connection', function(conn) {

    conn.on('add_room', function(data) {
        // console.log(data.roomid)

        db.addroom(data,function (info) {
            console.log("room created")
        });

        // flag=false;
        // for(item in array){
        //
        //     if(item==data.roomid){
        //         flag=true;
        //         console.log("already exists")
        //         break;
        //     }
        // }
        // if(!flag){
        //     array.push(data.roomid)
        // }

    });

    conn.on('add_user', function(data) {
        // console.log(data.roomid)

        db.adduser(data, function (info) {
            console.log("user created")
        });
    });

    conn.on('join_room',function (data) {

        db.joinroom(data,function (info) {
            console.log("user joined room")
        })

        // socket.broadcast.to(info.roomid).emit('get_notification');

        // let flag=false;
        // for(item in array){
        //     if(array[item] === data.roomid){
        //         if(occupants[array[item]]===undefined) {
        //             occupants[array[item]] = [];
        //         }
        //         occupants[array[item]].push(data.name);
        //         flag=true;
        //         console.log(JSON.stringify(occupants));
        //         break;
        //     }
        // }
        //
        // if(!flag){
        //     console.log('No room exists')
        // }

    })

});

server.listen(6378, function () {
    console.log('Server started');
});
