// var mongoose = require('mongoose');
//
// var mongoDB = 'mongodb://127.0.0.1/my_database';
// mongoose.connect(mongoDB, { useNewUrlParser: true });
//
// mongoose.Promise = global.Promise;
//
// var db = mongoose.connection;
//
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//
// var UserSchema = new mongoose.Schema({
//
//     roomid : {type:String, required:true},
//     users : {type:[String], required:true}
// });
//
// var SomeModel = mongoose.model('SomeModel', UserSchema );
//
// var instance = new SomeModel({ roomid: 'room1', users : ['aa','bb','cc'] });
//
// instance.save(function (err) {
//     if (err) return handleError(err);
//
// });
//
// module.exports = {
//     db

// var redis = require('redis');
// var client = redis.createClient({port : 6378, host : '120.0.0.1'});
//
// const { exec } = require('child_process');
//
//
// client.on('connect', function() {
//     console.log('Redis client connected');
// });
//
// client.on('error', function (err) {
//     console.log('Something went wrong ' + err);
// });
//
// function setvalues() {
//
//     exec('$ cd redis-4.0.9', (err, stdout, stderr) => {
//         if (err) {
//             // node couldn't execute the command
//             return;
//         }
//         console.log('here')
//         console.log(`stdout: ${stdout}`);
//         console.log(`stderr: ${stderr}`);
//     });
//     exec('$ make', (err, stdout, stderr) => {
//         if (err) {
//             // node couldn't execute the command
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         console.log(`stderr: ${stderr}`);
//     });
//     exec('src/redis-server', (err, stdout, stderr) => {
//         if (err) {
//             // node couldn't execute the command
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         console.log(`stderr: ${stderr}`);
//     });
//
//     exec('src/redis-cli', (err, stdout, stderr) => {
//         if (err) {
//             // node couldn't execute the command
//             return;
//         }
//         console.log(`stdout: ${stdout}`);
//         console.log(`stderr: ${stderr}`);
//     });
//
//
//
//     // client.set('room1', "aa", function(err, reply) {
//     //     console.log(reply);
//     // });
//
//     // client.set('room1', "aa", redis.print);
//     // console.log('hey hey')
//     // client.get('room1', function (error, result) {
//     //     if (error) {
//     //         console.log(error);
//     //         throw error;
//     //     }
//     //     console.log('GET result ->' + result);
//     // });
//     // client.set('room2', ['aaa', 'bbb', 'ccc'], redis.print);
// }
//
// function show() {
//     console.log('inside db')
//     setvalues();
//     console.log("back")
// }
//
// module.exports={
//     client,show
// }

const mysql = require('mysql');

const dbconf = {
    host: "localhost",
    user: "rooms",
    password: "rooms",
    database: "sih2019"
};

function addroom(info,done) {

    let conn = mysql.createConnection(dbconf);
    conn.connect();

    q = "insert into roominfo values(" + info.roomid + ",'" + info.pwd + "');";
    console.log(q)
    conn.query(q, function (err, rows, fields) {
        if (err) throw err;

        done(rows);
    })
}

function adduser(info,done) {

    let conn = mysql.createConnection(dbconf);
    conn.connect();

    console.log(info);
    q = "insert into userinfo values(" + info.userid + ",'" + info.username + "','" + info.email + "','" + info.pwd + "');"
    console.log(q);
    conn.query(q, function (err, rows, fields) {
        if (err) throw err;

        done(rows);
    })
}

function joinroom(info,done) {
    let conn = mysql.createConnection(dbconf);
    conn.connect();

    conn.query("insert into joinroom values(" + info.roomid + "," + info.userid + ");", function (err, rows, fields) {
        if (err) throw err;

        done(rows);
    })
}

module.exports={
    addroom,
    adduser,
    joinroom
}
