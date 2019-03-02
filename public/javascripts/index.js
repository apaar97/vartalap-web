$(function () {

    var conn = io('/namespace',{ transports: ['websocket'] });

    conn.on('connect',function(){});

    $('#addroom').click(function () {
        conn.emit('add_room',{
            roomid : $('#room1').val(),
            pwd : $('#pwd1').val()
        })
    })

    $('#adduser').click(function () {
        conn.emit('add_user',{
            userid : $('#user1').val(),
            username : $("#username").val(),
            email : $('#email').val(),
            pwd : $('#pwd2').val()
        })
    })

    $('#join').click(function () {
        conn.emit("join_room", {
            roomid : $('#room2').val(),
            userid : $('#user2').val()
        })
    })
    



})