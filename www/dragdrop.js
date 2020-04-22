class Droparea{
  constructor(el, opt){
    this.el = document.querySelector(el);
    this.drop = opt.ondrop || null;
    this.dragover = opt.ondragover || null;
    this.dragenter = opt.ondragenter || null;
    this.dragleave = opt.ondragleave || null;
    this.dragend = opt.ondragend || null;
    this.css = opt.css || null;
    this.validcss = opt.validcss || null;
    this.invalidcss = opt.invalidcss || {};
    this.mime = opt.mime || null;

    this.el.addEventListener("dragover", (evt)=>{
      evt.stopPropagation();
      evt.preventDefault();
      if(this.dragover) this.dragover(evt.dataTransfer);
    });
    this.el.addEventListener("dragenter", (evt)=>{
      this.__dragOver++;
      this.__applyStyle(evt.dataTransfer);
      evt.stopPropagation();
      evt.preventDefault();
      this.__checkValidity(evt.dataTransfer);
      if(this.dragenter) this.dragenter(evt.dataTransfer);
    });
    this.el.addEventListener("dragleave", (evt)=>{
      this.__dragOver--;
      if (this.__dragOver == 0) this.__removeStyle();
      if(this.dragleave) this.dragleave(evt.dataTransfer);
    });
    this.el.addEventListener("dragend", (evt)=>{
      this.__dragOver = 0;
      this.__removeStyle();
      if(this.dragend) this.dragend(evt.dataTransfer);
    });
    this.el.addEventListener("drop", (evt)=>{
      this.__dragOver = 0;
      evt.preventDefault();
      evt.stopPropagation();
      this.__removeStyle();
      if(!this.drop) return;
      if(this.mime && this.__checkValidity(evt.dataTransfer)){        
        let files = [];

        if(typeof this.mime === "string")
          Object.values(evt.dataTransfer.files).forEach(e=>{
            if(e.type.includes(this.mime)) files.push(e);
          });

        if(typeof this.mime === "object")
          this.mime.forEach(m=>{
            Object.values(evt.dataTransfer.files).forEach(e=>{
              if(e.type.includes(m)) files.push(e);
            });
          });
        
        this.drop(evt.dataTransfer, files);
      }
      else this.drop(evt.dataTransfer);
      

    });
    this.__dragOver = 0;
    this.__ogStyle = {};

    this.__checkValidity = (dt)=>{
      if(typeof this.mime === "string")
        return Object.values(dt.items).some(e=>{ return e.type.includes(this.mime) });
      if(typeof this.mime === "object"){
        let valid = false;
        this.mime.forEach(m=>{
          Object.values(dt.items).forEach(f=>{
            if(f.type.includes(m)) valid = true;
          })
        });
        return valid;
        // Object.values(dt.items).some(e=>{ return this.mime.indexOf(e.type) != -1 });
      }
        
    }
    this.__applyStyle = (dt)=>{
      if(this.validcss && this.mime){
        if(Object.keys(this.invalidcss).length){
          if(this.__checkValidity(dt)) for(let [k,v] of Object.entries(this.validcss)) this.el.style[k] = v;
          else for(let [k,v] of Object.entries(this.invalidcss)) this.el.style[k] = v;
        }
        else if(this.__checkValidity(dt)) for(let [k,v] of Object.entries(this.validcss)) this.el.style[k] = v;
      }
      else if(this.css) for(let [k,v] of Object.entries(this.css)) this.el.style[k] = v;
      
    };
    this.__removeStyle = (dt)=>{
      for(let [k,v] of Object.entries(this.__ogStyle)){
        this.el.style[k] = v;
      }
    };

    if(this.css){
      for(let [k,v] of Object.entries(this.css)) this.__ogStyle[k] = this.el.style[k];
    }
    else if(this.validcss){
      for(let [k,v] of Object.entries({...this.validcss, ...this.invalidcss})){
        this.__ogStyle[k] = this.el.style[k];
      }
    }
    
  }
}