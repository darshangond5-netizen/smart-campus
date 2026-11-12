
import "./style.css";

/* Campus inventory */
const floors = [
 {name:"Ground", classrooms:["LH001","LH002","LH003","LH004","LH005","LH006","LH007","LH008","LH009"], labs:["LAB001","LAB002","LAB003"], seminars:["SH001","SH002"]},
 {name:"First", classrooms:["LH101","LH102","LH103","LH104","LH105","LH106","LH107","LH108"], labs:["LAB101","LAB102","LAB103"], seminars:[]},
 {name:"Second", classrooms:["LH201","LH202","LH203","LH204","LH205","LH206","LH207"], labs:["LAB201","LAB202","LAB203","LAB204"], seminars:[]},
 {name:"Third", classrooms:["LH301","LH302","LH303","LH304","LH305","LH306","LH307"], labs:["LAB301","LAB302","LAB303","LAB304"], seminars:[]}
];
const allRooms=floors.flatMap(f=>[...f.classrooms,...f.labs,...f.seminars]);
const roomFloor=Object.fromEntries(floors.flatMap(f=>[...f.classrooms,...f.labs,...f.seminars].map(r=>[r,f.name])));
const roomType=Object.fromEntries(floors.flatMap(f=>[
 ...f.classrooms.map(r=>[r,"Classroom"]),...f.labs.map(r=>[r,"Laboratory"]),...f.seminars.map(r=>[r,"Seminar hall"])
]));
const roomCapacity=Object.fromEntries(allRooms.map(r=>[r,r.startsWith("SH")?100:r.startsWith("LAB")?36:60]));
const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const periods=[
 {label:"09:00–10:00",start:"09:00",end:"10:00"},
 {label:"10:00–11:00",start:"10:00",end:"11:00"},
 {label:"11:20–12:20",start:"11:20",end:"12:20"},
 {label:"12:20–13:15",start:"12:20",end:"13:15"},
 {label:"14:10–15:00",start:"14:10",end:"15:00"},
 {label:"15:00–15:50",start:"15:00",end:"15:50"},
 {label:"15:50–16:40",start:"15:50",end:"16:40"}
];
const years={
 1:{floor:"Ground",subjects:["Engineering Mathematics I","Engineering Physics","Engineering Chemistry","Programming in C","Basic Electrical Engineering","Engineering Graphics","Communicative English","Environmental Studies"],labs:["Physics Lab","Chemistry Lab","C Programming Lab","Engineering Workshop"]},
 2:{floor:"First",subjects:["Engineering Mathematics III","Data Structures","Digital Logic Design","Computer Organization","Object Oriented Programming","Discrete Mathematics","Operating Systems","Database Management Systems"],labs:["Data Structures Lab","OOP Lab","Digital Logic Lab","Database Lab"]},
 3:{floor:"Second",subjects:["Design and Analysis of Algorithms","Computer Networks","Software Engineering","Theory of Computation","Web Technology","Artificial Intelligence","Microprocessors","Professional Elective"],labs:["Networks Lab","Web Technology Lab","AI Lab","Mini Project"]},
 4:{floor:"Third",subjects:["Machine Learning","Cloud Computing","Cyber Security","Big Data Analytics","Project Work","Internet of Things","Professional Elective II","Research / Seminar"],labs:["Machine Learning Lab","Cloud Lab","IoT Lab","Project Lab"]}
};
const sections=["A","B","C","D"];
const labSlots=[0,2,4,1,5,3];
const timetable={};
const sectionRoom={};
for(const [yr,info] of Object.entries(years)){
 const rooms=floors.find(f=>f.name===info.floor).classrooms;
 sections.forEach((sec,si)=>{
  const key=`${yr}${sec}`, room=rooms[si]; sectionRoom[key]=room;
  timetable[key]={};
  days.forEach((day,di)=>{
   timetable[key][day]=periods.map((p,pi)=>{
    // Each section has its own deterministic subject rotation. Lab blocks are NOT classroom occupancy.
    if((pi===3 && di%2===0) || (pi===5 && di%2===1)){
      if((di+si)%3===0) return {kind:"lab",subject:info.labs[(di+si)%info.labs.length],room:`LAB${yr===1?"00":yr===2?"10":yr===3?"20":"30"}${String(((di+si)% (yr===1?3:4))+1).padStart(2,"0")}`};
    }
    if((di+pi+si)%11===0) return {kind:"free",subject:"Free period"};
    if(pi===3) return {kind:"break",subject:"Lunch"};
    const idx=(di*2+pi+si*3+yr)%info.subjects.length;
    return {kind:"class",subject:info.subjects[idx]};
   });
  });
 });
}
// Force a few visible lab sessions without changing the room-availability rule.
for(const key of Object.keys(timetable)){
 const yr=Number(key[0]), info=years[yr], si=sections.indexOf(key.slice(1));
 const labRoomPrefix=yr===1?"LAB00":yr===2?"LAB10":yr===3?"LAB20":"LAB30";
 timetable[key].Wednesday[3]={kind:"lab",subject:info.labs[si%info.labs.length],room:`${labRoomPrefix}${String(si% (yr===1?3:4)+1).padStart(2,"0")}`};
}

const today=()=>new Date().toISOString().slice(0,10);
let bookings=JSON.parse(localStorage.getItem("cc_bookings_v2")||"null")||[];
let page="Overview",floorSelected="Ground",roomSelected="LH001",classSelected="1A";
const app=document.querySelector("#app");
const save=()=>localStorage.setItem("cc_bookings_v2",JSON.stringify(bookings));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nav=[["Overview","▦"],["Floor Plan","⌂"],["Timetables","▤"],["Booking Requests","＋"]];
const getFloor=name=>floors.find(f=>f.name===name);
const findPeriod=(start,end)=>periods.some(p=>start<p.end&&end>p.start);
function getClassOccupant(room,date,start,end){
 if(roomType[room]!=="Classroom") return null;
 const d=new Date(date+"T12:00:00");
 const day=days[(d.getDay()+6)%7];
 if(!day) return null;
 for(const [section,assignedRoom] of Object.entries(sectionRoom)){
  if(assignedRoom!==room) continue;
  for(let i=0;i<periods.length;i++){
   const p=periods[i],slot=timetable[section][day][i];
   if(slot.kind==="class" && start<p.end && end>p.start) return {section,subject:slot.subject,period:p.label};
  }
 }
 return null;
}
function isBooked(room,date,start,end,ignoreId=null){
 return bookings.find(b=>b.id!==ignoreId&&b.room===room&&b.date===date&&b.status!=="Rejected"&&start<b.end&&end>b.start);
}
function availability(room,date,start,end){
 if(!allRooms.includes(room)) return {ok:false,reason:"Unknown room"};
 const occupant=getClassOccupant(room,date,start,end);
 if(occupant) return {ok:false,reason:`${room} is allocated to ${occupant.section} (${occupant.subject}) during ${occupant.period}.`};
 const booked=isBooked(room,date,start,end);
 if(booked) return {ok:false,reason:`Room already has a ${booked.status.toLowerCase()} booking: ${booked.title}.`};
 return {ok:true,reason:"Available"};
}
function svg(s){return `<span class="nav-symbol">${s}</span>`}
function header(content){
 app.innerHTML=`<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-logo">C</div><div><b>CampusClass</b><small>SPACE MANAGEMENT</small></div></div><div class="nav-label">WORKSPACE</div><nav>${nav.map(([n,ic])=>`<button class="nav ${page===n?"active":""}" data-page="${n}">${svg(ic)}${n}</button>`).join("")}</nav><div class="profile"><div class="avatar">DU</div><div><b>Demo User</b><small>Student account</small></div></div></aside><main><header class="topbar"><div><small>CANARA ENGINEERING COLLEGE</small><h1>${page}</h1></div><span class="date-label">${new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span></header><section class="content">${content}</section></main></div>`;
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{page=b.dataset.page;render()});
}
function stat(label,value,sub){return `<div class="stat"><small>${label}</small><b>${value}</b><span>${sub}</span></div>`}
function overview(){
 const totalClass=floors.reduce((a,f)=>a+f.classrooms.length,0),totalLabs=floors.reduce((a,f)=>a+f.labs.length,0),totalSem=floors.reduce((a,f)=>a+f.seminars.length,0);
 return `<div class="hero"><div><small>CAMPUS AT A GLANCE</small><h2>Find your space.<br>Plan your day.</h2><p>Explore rooms, view class schedules and request a space.</p><button class="primary" data-go="Booking Requests">＋ Request a room</button></div><div class="hero-art">▥</div></div><div class="stats">${stat("CLASSROOMS",totalClass,"Across four floors")}${stat("LABORATORIES",totalLabs,"Practical learning spaces")}${stat("SEMINAR HALLS",totalSem,"Ground floor")}${stat("BOOKING REQUESTS",bookings.length,"Saved in this browser")}</div><div class="section-title"><div><h3>Quick access</h3><p>Choose where you want to go.</p></div></div><div class="quick-grid"><button data-go="Floor Plan"><b>⌂　Floor plan</b><span>Browse all 47 spaces</span></button><button data-go="Timetables"><b>▤　Class timetables</b><span>16 section-wise demo schedules</span></button><button data-go="Booking Requests"><b>＋　Booking requests</b><span>Check availability and request rooms</span></button></div><div class="section-title"><div><h3>Recent requests</h3><p>Latest booking activity.</p></div></div>${bookingTable(bookings.slice().reverse().slice(0,5))}`;
}
function floorPlan(){
 const f=getFloor(floorSelected),groups=[["Classrooms",f.classrooms],["Laboratories",f.labs],["Seminar halls",f.seminars]];
 return `<div class="section-title"><div><h3>Building directory</h3><p>Select a floor and choose a room for its details.</p></div><span class="tag">${allRooms.length} TOTAL SPACES</span></div><div class="floor-tabs">${floors.map(x=>`<button class="${x.name===floorSelected?"on":""}" data-floor="${x.name}">${x.name}</button>`).join("")}</div><div class="floor-columns"><div class="panel"><div class="panel-head"><b>${floorSelected} floor · 2D directory</b><small>Illustrative arrangement</small></div>${groups.map(([label,rooms])=>rooms.length?`<h4>${label} <small>${rooms.length}</small></h4><div class="room-grid">${rooms.map(r=>`<button class="room ${roomSelected===r?"picked":""}" data-room="${r}"><b>${r}</b><small>${roomType[r]}</small></button>`).join("")}</div>`:"").join("")}</div><aside class="panel room-details"><small>SELECTED SPACE</small><h2>${roomSelected}</h2><span class="tag">${roomType[roomSelected]}</span><div class="detail"><small>Floor</small><b>${roomFloor[roomSelected]}</b></div><div class="detail"><small>Capacity (demo)</small><b>${roomCapacity[roomSelected]} people</b></div><button class="primary wide" data-go="Booking Requests">Check availability</button></aside></div><p class="hint">Room arrangement is a directory mock-up, not a surveyed architectural floor plan.</p>`;
}
function timetablePage(){
 const chosen=document.querySelector("#classSelect")?.value||classSelected;
 const section=timetable[chosen],yr=Number(chosen[0]),floor=years[yr].floor;
 return `<div class="section-title"><div><h3>Section timetable</h3><p>Each section has a separate illustrative weekly schedule.</p></div><label class="selector">SELECT SECTION<select id="classSelect">${Object.keys(timetable).map(k=>`<option ${k===chosen?"selected":""}>${k}</option>`).join("")}</select></label></div><div class="panel"><div class="panel-head"><div><b>${yr}${yr===1?"st":yr===2?"nd":yr===3?"rd":"th"} Year · Section ${chosen.slice(1)}</b><small>${floor} Floor · Allocated classroom ${sectionRoom[chosen]}</small></div><span class="tag">MON – SAT</span></div><div class="table-scroll"><table class="tt"><thead><tr><th>DAY</th>${periods.map(p=>`<th>${p.label}</th>`).join("")}</tr></thead><tbody>${days.map(day=>`<tr><th>${day}</th>${section[day].map(s=>`<td class="${s.kind}">${esc(s.subject)}${s.kind==="lab"?`<small>${esc(s.room)}</small>`:""}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div><div class="legend-row"><span>Regular class = allocated classroom occupied</span><span>Lab / free / lunch = classroom empty</span></div><p class="hint">Demo subjects and faculty assignments are illustrative. Replace with official college timetable data when available.</p>`;
}
function bookingPage(){
 const date=document.querySelector("#bookDate")?.value||today(),floor=document.querySelector("#bookFloor")?.value||"Ground";
 const room=document.querySelector("#bookRoom")?.value||getFloor(floor).classrooms[0];
 const start=document.querySelector("#bookStart")?.value||"09:00",end=document.querySelector("#bookEnd")?.value||"10:00";
 const check=availability(room,date,start,end);
 const slots=periods.map(p=>{const a=availability(room,date,p.start,p.end);return `<div class="slot-row"><span>${p.label}</span><div class="slot ${a.ok?"open":"closed"}">${a.ok?"Available":esc(a.reason)}</div></div>`}).join("");
 return `<div class="booking-layout"><div><div class="section-title"><div><h3>Room availability</h3><p>Availability follows the section timetables and existing requests.</p></div></div><div class="filters"><label>DATE<input id="bookDate" type="date" value="${date}"></label><label>FLOOR<select id="bookFloor">${floors.map(f=>`<option ${f.name===floor?"selected":""}>${f.name}</option>`).join("")}</select></label><label>ROOM<select id="bookRoom">${getFloor(floor).classrooms.concat(getFloor(floor).labs,getFloor(floor).seminars).map(r=>`<option ${r===room?"selected":""}>${r}</option>`).join("")}</select></label></div><div class="panel"><div class="panel-head"><div><b>${room} · Daily timeline</b><small>${roomType[room]} · Capacity ${roomCapacity[room]}</small></div><span class="tag">${date}</span></div><div class="timeline">${slots}</div><div class="timeline-legend"><span><i class="green-dot"></i>Available</span><span><i class="red-dot"></i>Occupied / requested</span></div></div><div class="section-title"><div><h3>My booking requests</h3><p>Requests submitted from this browser.</p></div></div>${bookingTable(bookings.slice().reverse())}</div><aside class="panel form-panel"><small class="eyebrow">NEW BOOKING REQUEST</small><h3>Event details</h3><p>Complete the details to request a space.</p><form id="bookingForm"><label>Event / class title<input name="title" required placeholder="e.g. Robotics workshop"></label><label>Purpose and description<textarea name="purpose" rows="3" required placeholder="Describe the activity"></textarea></label><div class="two"><label>Date<input name="date" type="date" required value="${date}"></label><label>Participants<input name="people" type="number" min="1" required placeholder="40"></label></div><div class="two"><label>Start time<select name="start">${timeChoices(start)}</select></label><label>End time<select name="end">${timeChoices(end)}</select></label></div><label>Room<select name="room">${allRooms.map(r=>`<option ${r===room?"selected":""}>${r}</option>`).join("")}</select></label><label>Equipment needed<input name="equipment" placeholder="Projector, computers…"></label><label>Organizer name<input name="organizer" required placeholder="Your name"></label><label>Contact email<input name="email" type="email" required placeholder="name@example.com"></label><div class="availability-result ${check.ok?"good":"bad"}" id="availabilityResult">${esc(check.reason)}</div><button class="primary wide" type="submit">Submit request →</button><small class="hint">Demo only: requests are saved in local browser storage. Admin approval and Firebase are not connected.</small></form></aside></div>`;
}
function timeChoices(selected){return ["08:00","09:00","10:00","11:00","11:20","12:00","12:20","13:00","14:00","14:10","15:00","15:50","16:00","16:40","17:00","18:00"].map(t=>`<option ${t===selected?"selected":""}>${t}</option>`).join("");}
function bookingTable(items){
 if(!items.length)return `<div class="empty">No booking requests yet.</div>`;
 return `<div class="panel table-panel"><div class="table-scroll"><table><thead><tr><th>EVENT</th><th>ROOM</th><th>DATE / TIME</th><th>STATUS</th><th></th></tr></thead><tbody>${items.map(b=>`<tr><td><b>${esc(b.title)}</b><small>${esc(b.organizer)}</small></td><td>${b.room}</td><td>${b.date}<small>${b.start}–${b.end}</small></td><td><span class="status ${b.status.toLowerCase()}">${b.status}</span></td><td>${b.status==="Pending"?`<button class="cancel" data-cancel="${b.id}">Cancel</button>`:""}</td></tr>`).join("")}</tbody></table></div></div>`;
}
function render(){
 const content=page==="Overview"?overview():page==="Floor Plan"?floorPlan():page==="Timetables"?timetablePage():bookingPage();
 header(content);
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{page=b.dataset.go;render()});
 document.querySelectorAll("[data-floor]").forEach(b=>b.onclick=()=>{floorSelected=b.dataset.floor;roomSelected=getFloor(floorSelected).classrooms[0]||getFloor(floorSelected).labs[0];render()});
 document.querySelectorAll("[data-room]").forEach(b=>b.onclick=()=>{roomSelected=b.dataset.room;render()});
 document.querySelector("#classSelect")?.addEventListener("change",e=>{classSelected=e.target.value;render()});
 wireBooking();
 document.querySelectorAll("[data-cancel]").forEach(b=>b.onclick=()=>{const id=Number(b.dataset.cancel);bookings=bookings.map(x=>x.id===id?{...x,status:"Rejected"}:x);save();render()});
}
function wireBooking(){
 ["bookDate","bookFloor","bookRoom","bookStart","bookEnd"].forEach(id=>document.querySelector("#"+id)?.addEventListener("change",()=>{
  if(id==="bookFloor"){const f=getFloor(document.querySelector("#bookFloor").value);document.querySelector("#bookRoom").innerHTML=[...f.classrooms,...f.labs,...f.seminars].map(r=>`<option>${r}</option>`).join("");}
  render();
 }));
 document.querySelector("#bookingForm")?.addEventListener("submit",e=>{
  e.preventDefault();const data=new FormData(e.target),b=Object.fromEntries(data.entries());
  b.people=Number(b.people);b.id=Date.now();b.status="Pending";
  if(b.end<=b.start){alert("End time must be later than start time.");return;}
  if(b.people>roomCapacity[b.room]){alert(`This room capacity is ${roomCapacity[b.room]}.`);return;}
  const result=availability(b.room,b.date,b.start,b.end);
  if(!result.ok){alert(result.reason);return;}
  bookings.push(b);save();alert("Booking request submitted. Status: Pending.");render();
 });
}
render();
