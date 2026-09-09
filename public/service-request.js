const params=new URLSearchParams(location.search);
const service=params.get("service")||sessionStorage.getItem("nabhiService")||"Home Service";
const serviceName=document.getElementById("serviceName");
const description=document.getElementById("jobDescription");
const counter=document.getElementById("counter");
const input=document.getElementById("imageInput");
const grid=document.getElementById("imageGrid");
const continueBtn=document.getElementById("continueBtn");
let files=[];

serviceName.textContent=service;
sessionStorage.setItem("nabhiService",service);

description.value=sessionStorage.getItem("nabhiDescription")||"";
counter.textContent=`${description.value.length} / 500`;
description.addEventListener("input",()=>{
    counter.textContent=`${description.value.length} / 500`;
});

function renderImages(){
    grid.innerHTML="";
    files.forEach((file,index)=>{
        const wrap=document.createElement("div");
        wrap.className="image-preview";
        const img=document.createElement("img");
        img.src=URL.createObjectURL(file);
        const remove=document.createElement("button");
        remove.className="remove-image";remove.type="button";remove.innerHTML="×";
        remove.onclick=()=>{files.splice(index,1);renderImages()};
        wrap.append(img,remove);grid.appendChild(wrap);
    });
}
input.addEventListener("change",()=>{
    const selected=[...input.files];
    files=[...files,...selected].slice(0,5);
    input.value="";
    renderImages();
});
continueBtn.addEventListener("click",()=>{
    if(!description.value.trim()){
        description.focus();
        description.style.borderColor="#C94B4B";
        setTimeout(()=>description.style.borderColor="",800);
        return;
    }
    sessionStorage.setItem("nabhiDescription",description.value.trim());
    const imageData=files.map(file=>URL.createObjectURL(file));
    sessionStorage.setItem("nabhiImageCount",String(files.length));
    location.href="schedule-service.html";
});