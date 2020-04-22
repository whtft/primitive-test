const primus = Primus.connect("/"),
input = document.getElementById("file"),
output = document.getElementById("images"),
progress = document.getElementById("progress"),
separator = document.getElementById("separator"),
progressbar = document.getElementById("progress-bar"),
progressPercent = document.getElementById("progress-percent");

const loadImage = async (dt, filtered=false)=>{
  let steps = Number(prompt("Number of steps"));
  if(steps === false) return;
  steps = (isNaN(steps) || steps == 0) ? 10 : steps;
  let files = filtered || dt.files;
  separator.style["display"] = "none";
  output.style["opacity"] = "0";
  output.querySelectorAll("img").forEach(e=>e.removeAttribute("src"));
  progress.style["display"] = "block";
  progressbar.style["width"] = "0%";
  progressPercent.innerText = "0%";
  const b64 = await imageToBase64(files[0]);
  self.originalImg = new Image();
  self.originalImg.className = "originalImg";
  self.originalImg.src = b64;
  primus.write({event:"send", data:b64, steps: steps});
}

new Droparea("#wrapper",{
  ondrop: loadImage,
  mime: ["image/png", "image/jpeg"],
  validcss: {
    border: "2px dashed #9e9e9e"
  }
});
input.addEventListener("change", function(){
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

const displayImage = data=>{
  output.style["width"] = `${self.originalImg.naturalWidth}px`;
  output.style["height"] = `${self.originalImg.naturalHeight}px`;
  progress.style["display"] = "none";
  separator.style["display"] = "block";
  document.querySelector(".svgImg").src = svgToBase64(data);
  document.querySelector(".originalImg").src = self.originalImg.src;
  setTimeout(scale, 10);
  setTimeout(() => { output.style["opacity"] = "1"; }, 20);
}
const progressBar = percentage=>{
  progressPercent.innerText = `${Math.round(percentage)}%`;
  progressbar.style["width"] = `${percentage}%`;
}
const scale = ()=>{
  const image = document.querySelector("img");
  if(!image) return;
  const scale = Math.min( 
    window.innerWidth / image.naturalWidth * .8, 
    window.innerHeight / image.naturalHeight * .8
  );
  output.style["transform"] = `scale(${scale})`
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
  message.event == "step" && progressBar(message.data);
  message.event == "result" && displayImage(message.data);
});

self.addEventListener("resize", scale);