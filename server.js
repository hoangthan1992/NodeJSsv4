import { Server } from "socket.io"; 
const io = new Server(3001);

io.on("connection",(socket)=>
{    
    console.log("connection"); 
    socket.on("t",data=>
    {
        console.log(data);
        socket.emit("t",data);
        console.log(data);
    });
    socket.on("spin", (data) =>
    {
        console.log(data);
        socket.emit("spin",  data);     
    });
    socket.on("disconnect",data=>
    {
        console.log("Disconnect");
    });
});
console.log("Server Start");