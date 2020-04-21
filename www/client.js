const primus = Primus.connect("/"),
input = document.getElementById("file"),
output = document.getElementById("images"),
progress = document.getElementById("progress"),
progressbar = document.getElementById("progress-bar"),
progressPercent = document.getElementById("progress-percent");

input.addEventListener("change", async function(){
  let previousImages = output.querySelectorAll("img");
  if(previousImages.length) previousImages.forEach(e=>e.remove());
  progress.style["display"] = "block";
  progressbar.style["width"] = "0%";
  progressPercent.innerText = "0%";
  if(this.files[0].type.includes("image")){
    let steps = Number(prompt("Number of steps"));
    steps = isNaN(steps) ? 10 : steps;
    const b64 = await imageToBase64(this.files[0]);
    self.originalImg = new Image();
    self.originalImg.className = "originalImg";
    self.originalImg.src = b64;
    primus.write({event:"send", data:b64, steps: steps});
  }
});
output.addEventListener("mouseleave", function(){
  let svgImg = this.querySelector(".svgImg");
  if(svgImg) svgImg.style["clip-path"] = "";
});
output.addEventListener("mousemove", function(evt){
  let svgImg = this.querySelector(".svgImg");
  if(!svgImg) return;
  const percentOffset = Math.round(evt.offsetX / svgImg.offsetWidth * 100);
  svgImg.style["clip-path"] = `polygon(0 0, ${percentOffset}% 0, ${percentOffset}% 100%, 0% 100%)`;
});

primus.on('data', function message(message) {
  message.event == "step" && progressBar(message.data);
  message.event == "result" && displayImage(message.data);
});

const progressBar = percentage=>{
  progressPercent.innerText = `${Math.round(percentage)}%`;
  progressbar.style["width"] = `${percentage}%`;
}
const displayImage = data=>{
  let svgImg = new Image();
  svgImg.className = "svgImg";
  svgImg.onload = ()=>{
    output.appendChild(self.originalImg);
    output.appendChild(svgImg);
    setTimeout(() => {
      svgImg.style["opacity"] = 1;
      self.originalImg.style["opacity"] = 1;
    }, 100);
    progress.style["display"] = "none";
  } 
  svgImg.src = svgToBase64(data);
}
const imageToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});
const svgToBase64 = svg=>{
  let svgNode = document.createRange().createContextualFragment(svg);
  let serialized = new XMLSerializer().serializeToString(svgNode);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(serialized)))}`;
}