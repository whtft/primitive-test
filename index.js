const express = require("express");
const { fork } = require('child_process');
const http = require("http");
const Primus = require('primus');

const app = express();
const server = http.createServer(app);
const primus = new Primus(server, { pingInterval: false });

primus.on('connection', function (spark) {
  spark.on("data", function message(message){
    const primitiveFork = fork('primitive.js');
    if(message.event == "start") primitiveFork.send({evt: "start", data: message.opt});
    primitiveFork.on('message', forkmsg => {
      forkmsg.evt == "result" && spark.write({
        event: "result", 
        data: forkmsg.data
      });
      forkmsg.evt == "step" && spark.write({
        event: "step", 
        data: {
          progress: forkmsg.data.progress,
          svg: forkmsg.data.svg 
        } 
      });
    });
  });
});

app.use("/", express.static(__dirname+"/www"));

server.listen(7777);