const express = require("express");
const { fork } = require('child_process');
const https = require("https");
const fs = require('fs');
const Primus = require('primus');
const dotenv = require('dotenv');

dotenv.config();
const options = {
  key: fs.readFileSync(process.env.SSLKEY),
  cert: fs.readFileSync(process.env.SSLCERT)
};

const app = express();
const server = https.createServer(options, app);
const primus = new Primus(server, { pingInterval: false });

primus.on('connection', function (spark) {
  spark.on("data", function message(message){
    const primitiveFork = fork('primitive.js');
    if(message.event == "start") primitiveFork.send({evt: "start", data: message.opt});
    primitiveFork.on('message', forkmsg => {
      if(forkmsg.evt == "result") spark.write({
        event: "result", 
        data: forkmsg.data
      });
      if(forkmsg.evt == "step") spark.write({
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