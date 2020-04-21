const input = document.getElementById("file");
const output = document.getElementById("output");
const progress = document.getElementById("progress");
const progressbar = document.getElementById("progress-bar");
const progressPercent = document.getElementById("progress-percent");

const primus = Primus.connect("/");

input.addEventListener("change", async function(){
  let previousImage = output.querySelector("img");
  if(previousImage) previousImage.remove();
  progressbar.style["width"] = "0%";
  progressPercent.innerText = "0%";
  if(this.files[0].type.includes("image")){
    let steps = Number(prompt("Number of steps"));
    steps = isNaN(steps) ? 10 : steps;
    const b64 = await imageToBase64(this.files[0]);
    fetch("/primitive", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, steps: steps })
    });
  }
});

primus.on('data', function message(message) {
  message.event == "step" && progressBar(message.data);
  message.event == "result" && displayImage(message.data);
});

const progressBar = percentage=>{
  progress.style["opacity"] = "1";
  progressPercent.innerText = `${Math.round(percentage)}%`;
  progressbar.style["width"] = `${percentage}%`;
}
const displayImage = data=>{
  let img = new Image();
  img.onload = ()=>{
    progress.style["opacity"] = "0";
    output.appendChild(img);
  } 
  img.src = svgToBase64(data);
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