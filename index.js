const express = require("express");
const primitive = require("primitive");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json({limit:"10mb", extended: true}));
app.use("/", express.static(__dirname+"/www/"));

app.post("/primitive", async (req,res)=>{
  if(!req.body.image) return res.sendStatus(400);
  res.sendStatus(200);
  const steps = req.body.steps || 10;
  const primed = await primitive({
    input: req.body.image
    ,numSteps: steps
    ,onStep: onStepCallback
  });
  const svg = await primed.toSVG();
  io.emit("result", svg);
});

const onStepCallback = foo=>{
  console.log(foo.score);
  io.emit("progress", foo.score);
}

server.listen(7777);