const express = require("express");
const primitive = require("primitive");
const http = require("http");
const Primus = require('primus')

const app = express();
const server = http.createServer(app);
const primus = new Primus(server);

app.use(express.json({limit:"10mb", extended: true}));
app.use("/", express.static(__dirname+"/www/"));

let steps, step;
app.post("/primitive", async (req,res)=>{
  if(!req.body.image) return res.sendStatus(400);
  res.sendStatus(200);
  steps = step = req.body.steps || 10;
  primitive({
    input: req.body.image,
    numSteps: steps,
    onStep: onStepCallback
  }).then(primed=>{
    return primed.toSVG()
  }).then(svg=>{
    primus.write({event: "result", data: svg});
  });
});

const onStepCallback = ()=>{
  step--;
  const progress = (1 - step / steps) * 100;
  primus.write({event: "step", data: progress});
}

server.listen(7777);