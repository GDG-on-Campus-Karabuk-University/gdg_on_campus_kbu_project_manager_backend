const { Server } = require("socket.io");

function socketSetup(io) {
    io.on("connection", (socket) => {
        console.log("Yeni bir kullanıcı bağlandı.");

        // Kullanıcı bir odaya katıldığında
        socket.on("joinRoom", (roomName) => {
            socket.join(roomName);
            console.log(`${socket.id} ${roomName} odasına katıldı`);
        });


        // Odaya mesaj gönderildiğinde
        socket.on("chatMessage", (msg, roomName) => {
            io.to(roomName).emit("chatMessage", msg);
        });


        // Kullanıcı bağlantıyı kapattığında
        socket.on("disconnect", () => {
            console.log("Bir kullanıcı bağlantıyı kapattı");
        })
    })
}

module.exports = socketSetup;