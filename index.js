const express = require("express");
const primitive = require("primitive");
const http = require("http");
const Primus = require('primus')

const app = express();
const server = http.createServer(app);
const primus = new Primus(server, { pingInterval: false });

primus.on('connection', function (spark) {
  spark.on("data", function message(message){
    message.event == "send" && makePrimitive(message.data, message.steps, spark);
  })
});

app.use("/", express.static(__dirname+"/www/"));

function makePrimitive(img, steps, spark){
  let step = 0;
  primitive({
    input: img,
    numSteps: steps || 10,
    onStep: onStepCallback
  }).then(primed=>{
    return primed.toSVG()
  }).then(svg=>{
    spark.write({event: "result", data: svg});
  });

  function onStepCallback(){
    step++, progress = Math.round((step / steps) * 1000) / 10;
    if(progress % 0.5 == 0) spark.write({event: "step", data: progress});
  }

}

server.listen(7777);