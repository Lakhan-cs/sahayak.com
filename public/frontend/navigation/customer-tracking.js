(function(){
const GURGAON={lat:28.4595,lng:77.0266};
const job=JSON.parse(localStorage.getItem("nabhiActiveBooking")||"null");
if(!job){document.getElementById("status").textContent="No active booking";return}
const savedOrigin=JSON.parse(localStorage.getItem("nabhiWorkerDemoCoords")||sessionStorage.getItem("nabhiWorkerDemoCoords")||"null");job.worker={...(job.worker||{}),location:job.worker?.location?.lat&&job.worker?.location?.lng?job.worker.location:(savedOrigin||{lat:28.6765,lng:77.1032})};job.customer={...(job.customer||{}),location:GURGAON,address:"Gurgaon, Haryana"};
const channel="BroadcastChannel"in window?new BroadcastChannel("nabhi-live"):null;
let map,workerMarker,route=[],current={...job.worker.location};
const $=id=>document.getElementById(id);
$("workerName").textContent=job.worker.name||"Rahul Sharma";
$("workerRole").textContent=(job.worker.role||"Verified local worker")+" · "+(job.worker.experience||"6 years experience");
$("workerAvatar").textContent=(job.worker.name||"R").split(" ").map(x=>x[0]).join("").slice(0,2);
$("workerExpertise").textContent=job.worker.role||"Home services";
$("workerRating").textContent=job.worker.rating||"4.9";
$("serviceName").textContent=(job.service||"Home service").toUpperCase();
$("detailService").textContent=job.service||"Home service";
function distance(a,b){const R=6371,d1=(b.lat-a.lat)*Math.PI/180,d2=(b.lng-a.lng)*Math.PI/180,x=Math.sin(d1/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(d2/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))*1000}
function scooter(){const e=document.createElement("div");e.className="scooter-marker";e.innerHTML='<svg viewBox="0 0 48 48"><circle cx="13" cy="37" r="5" fill="#17102b"/><circle cx="36" cy="37" r="5" fill="#17102b"/><path d="M13 32h16l-4-12h8l4 7h4" fill="none" stroke="#6e2fd9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 20l-5-7h7l5 7" fill="#f4a93b" stroke="#6e2fd9" stroke-width="2"/></svg>';return e}
function place(p,heading=0){if(!map)return;if(!workerMarker)workerMarker=new maplibregl.Marker({element:scooter(),anchor:"center"}).setLngLat([p.lng,p.lat]).addTo(map);else workerMarker.setLngLat([p.lng,p.lat]);workerMarker.getElement().style.setProperty("--bearing",heading+"deg");current=p;const m=distance(current,GURGAON);$("distance").textContent=(m/1000).toFixed(1)+" km";$("eta").textContent=Math.max(1,Math.round(m/450))+" min";$("status").textContent="Live · Worker location updated";$("instruction").textContent=m<50?"Your worker has arrived at your location.":"Your worker is travelling to you.";$("updated").textContent="Updated "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
function fit(){const b=new maplibregl.LngLatBounds();b.extend([current.lng,current.lat]);b.extend([GURGAON.lng,GURGAON.lat]);map.resize();setTimeout(()=>map.fitBounds(b,{padding:{top:35,bottom:35,left:30,right:30},maxZoom:15}),80)}
async function fetchRoute(){try{const a=`${current.lng},${current.lat}`,b=`${GURGAON.lng},${GURGAON.lat}`,r=await fetch(`https://router.project-osrm.org/route/v1/driving/${a};${b}?overview=full&geometries=geojson`),d=await r.json();if(d.code!=="Ok")throw new Error();route=d.routes[0].geometry.coordinates;map.addSource("customer-route",{type:"geojson",data:{type:"Feature",geometry:{type:"LineString",coordinates:route}}});map.addLayer({id:"customer-route",type:"line",source:"customer-route",paint:{"line-color":"#6e2fd9","line-width":5,"line-opacity":.9}});fit()}catch{route=[]}}
function init(){map=new maplibregl.Map({container:"map",style:"https://tiles.openfreemap.org/styles/liberty",center:[GURGAON.lng,GURGAON.lat],zoom:12});map.addControl(new maplibregl.NavigationControl(),"top-right");map.on("load",()=>{const ce=document.createElement("div");ce.className="customer-pin";new maplibregl.Marker({element:ce}).setLngLat([GURGAON.lng,GURGAON.lat]).addTo(map);place(current);fetchRoute()})}
channel?.addEventListener("message",e=>{const m=e.data||{};if(m.bookingId!==job.id)return;if(m.type==="worker-location")place({lat:m.lat,lng:m.lng},m.heading||0);if(m.type==="worker-arrived"){$("status").textContent="Arrived · Worker is at your location";$("statusLabel").textContent="ARRIVED"}});
window.addEventListener("storage",e=>{if(e.key==="nabhiWorkerLocation"&&e.newValue)place(JSON.parse(e.newValue));});
$("center").onclick=()=>{if(map&&current)map.flyTo({center:[current.lng,current.lat],zoom:16,duration:700})};
$("mapExpand").onclick=()=>{const expanded=document.body.classList.toggle("map-expanded");$("mapExpand").setAttribute("aria-expanded",String(expanded));$("mapExpand").firstChild.textContent=expanded?"Collapse map ":"Expand map ";setTimeout(()=>map?.resize(),250)};
$("callWorker").onclick=()=>{ $("status").textContent="Calling "+($("workerName").textContent||"your worker")+"..."; };
$("messageWorker").onclick=()=>{ $("chatLauncher")?.click(); };
init();
})();
