const primus = Primus.connect("/"),
input = document.getElementById("file"),
output = document.getElementById("images"),
options = document.getElementById("options"),
preview = document.getElementById("preview"),
progress = document.getElementById("progress"),
separator = document.getElementById("separator"),
progressbar = document.getElementById("progress-bar"),
progressPercent = document.getElementById("progress-percent");

const loadImage = async (dt, filtered=false)=>{
  let files = filtered || dt.files;
  separator.style["display"] = "none";
  output.style["display"] = "none";
  output.querySelectorAll("img").forEach(e=>e.removeAttribute("src"));
  progressbar.style["width"] = "0%";
  progressPercent.innerText = "0%";
  self.originalImg = new Image();
  self.originalImg.className = "originalImg";
  self.originalImg.src = await imageToBase64(files[0]);
  options.style["display"] = "block";
}

options.querySelector("#go").addEventListener("click", function(){
  const steps = options.querySelector("#steps-option");
  const shape = options.querySelector("#shape-option");
  if(!steps.reportValidity()) return;
  const opt = {
    image: self.originalImg.src, 
    steps: +steps.value,
    shape: shape.value
  };
  scale();
  primus.write({event:"start", opt: opt});
  options.style["display"] = "none";
  progress.style["display"] = "block";
});
options.querySelector("#close").addEventListener("click", function(){
  options.style["display"] = "none";
  input.value = "";
});

new Droparea("#wrapper",{
  ondrop: loadImage,
  mime: ["image/png", "image/jpeg"],
  validcss: {
    border: "2px dashed #9e9e9e"
  }
});
input.addEventListener("change", function(){
  if(!this.files.length) return;
  if(!["image/png", "image/jpeg"].includes(this.files[0].type)) return alert("Invalid file");
  loadImage(false, this.files);
});

output.addEventListener("mousemove", function(evt){
  evt.stopPropagation();
  const svgImg = this.querySelector(".svgImg");
  if(!svgImg) return;
  const percentOffset = Math.round(evt.offsetX / svgImg.offsetWidth * 1000) / 10;
  svgImg.style["clip-path"] = `polygon(0 0, ${percentOffset}% 0, ${percentOffset}% 100%, 0% 100%)`;
  separator.style["left"] = `${percentOffset}%`;
});

const displayResult = svg=>{
  output.style["width"] = `${self.originalImg.naturalWidth}px`;
  output.style["height"] = `${self.originalImg.naturalHeight}px`;
  progress.style["display"] = "none";
  separator.style["display"] = "block";
  document.querySelector(".svgImg").src = svgToBase64(svg);
  document.querySelector(".originalImg").src = self.originalImg.src;
  setTimeout(scale, 10);
  setTimeout(() => { 
    output.style["display"] = "block"; 
    preview.innerHTML = "";
  }, 20);
}
const onNewStep = step=>{
  preview.innerHTML = step.svg;
  progressPercent.innerText = `${Math.round(step.progress)}%`;
  progressbar.style["width"] = `${step.progress}%`;
}
const scale = ()=>{
  if(!self.originalImg) return;
  const scale = Math.min(Math.min( 
    window.innerWidth / self.originalImg.naturalWidth * .8,
    window.innerHeight / self.originalImg.naturalHeight * .8
  ), 1);
  output.style["transform"] = `scale(${scale})`;
  preview.style["transform"] = `scale(${scale})`;
}
const imageToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});
const svgToBase64 = svg=>{
  const svgNode = document.createRange().createContextualFragment(svg);
  const serialized = new XMLSerializer().serializeToString(svgNode);
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(serialized)))}`;
}

primus.on('data', function message(message) {
  message.event == "step" && onNewStep(message.data);
  message.event == "result" && displayResult(message.data);
});

self.addEventListener("resize", scale);