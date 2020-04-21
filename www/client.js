const sock = io();
const input = document.getElementById("file");
const output = document.getElementById("output");

input.addEventListener("change", async function(){
  let steps = 10;
  if(this.files[0].type.includes("image")){
    const b64 = await imageToBase64(this.files[0]);
    fetch("/primitive", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, steps: steps })
    });
  }
});

sock.on('progress', bar=>{
  console.log(bar);
});
sock.on('result', data=>{
  let img = new Image();
  img.onload = ()=>{
    output.innerHTML = "";
    output.appendChild(img);
  } 
  img.src = svgToBase64(data);
});


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