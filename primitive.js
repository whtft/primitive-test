const primitive = require("primitive");

process.on('message', message => {
  const opt = message.data;
  let step = 0, steps = opt.steps || 10;
  primitive({
    input: opt.image,
    shapeType: opt.shape || "triangle",
    numSteps: steps,
    onStep: onStepCallback
  }).then(primed=>{
    return primed.toSVG()
  }).then(svg=>{
    process.send({ evt:"result", data: svg });
  });

  async function onStepCallback(model, s){
    let progress = Math.round((step++ / steps) * 1000) / 10;
    if(progress % 0.5 == 0){
      process.send({evt:"step", data: { 
        progress: progress,
        svg: model.toSVG()
      }});
    } 
  }
});