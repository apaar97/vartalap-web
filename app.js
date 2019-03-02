var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var fs = require('fs-extra');
var WaveFile = require('wavefile');
var WavDecoder = require("wav-decoder");
var Queue = require('better-queue');
var exec = require('child_process').exec;
var debug = require('debug');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var debug = debug('accenttranslatorvoip-web:io');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var queue = new Queue(function (input, callback) {
    let { packetNo, socketId, wavFilePathOriginal } = input

    let command = "python3 accent_translation/inference.py --wave_path='" + wavFilePathOriginal + "' --socket_id='" + socketId + "' --packet_no=" + packetNo;

    exec(command, function (err, stdout, stderr) {
        if (err) {
            callback(err, null);
        } else {
            let wavFilePathConverted = './temp/audio_' + socketId + '/converted' + '/output' + packetNo + '.wav';
            callback(null, wavFilePathConverted);
        }
    });
});

io.on('connect', function (socket) {
    debug('a new connection is established');

    socket.on('disconnect', function () {
        debug('connection destroyed');
    });

    socket.on('data-original', function (data) {
        debug('incoming data');
        let wav = new WaveFile();

        let packetNo = data['packet-no']
        let socketId = data['socket-id'];
        let audioBuffer = data['audio-buffer'];

        let userWavDir = './temp/audio_' + socketId;
        if (!fs.existsSync(userWavDir)) {
            fs.mkdirSync(userWavDir);
            fs.mkdirSync(userWavDir + '/original');
            fs.mkdirSync(userWavDir + '/converted');
        }
        let wavFilePathOriginal = userWavDir + '/original/output' + packetNo + '.wav';
        wav.fromScratch(2, 44100, '64', audioBuffer);
        fs.writeFileSync(wavFilePathOriginal, wav.toBuffer());

        queue.push({ packetNo, socketId, wavFilePathOriginal }, function (err, wavFilePathConverted) {
            if (err) {
                debug(err);
            } else {
                console.log(wavFilePathConverted);

                const readFile = function (filepath) {
                    return new Promise(function (resolve, reject) {
                        fs.readFile(filepath, function (err, buffer) {
                            if (err) return reject(err);
                            return resolve(buffer);
                        });
                    });
                };

                readFile(wavFilePathConverted).then(function (buffer) {
                    return WavDecoder.decode(buffer);
                }).then(function (audioData) {
                    socket.broadcast.emit('data-converted', packetNo, socketId, audioData.channelData[0]);
                    // socket.emit('data-converted', packetNo, socketId, audioData.channelData[0]);
                    console.log('data broadcasted');
                    fs.remove(wavFilePathOriginal, function (err) {
                        if (err) console.error(err);
                        else console.log('user original audio removed');
                    });
                    fs.remove(wavFilePathConverted, function (err) {
                        if (err) console.error(err);
                        else console.log('user converted audio removed');
                    });
                }).catch(function (err) {
                    console.error(err);
                    socket.emit('error', 'Some error occurred');
                });
            }
        });
    });
});

module.exports = { app, server };
