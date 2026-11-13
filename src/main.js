
import "./style.css";

/* CAMPUS INVENTORY */
const floors = [
 {name:"Ground",classrooms:["LH001","LH002","LH003","LH004","LH005","LH006","LH007","LH008","LH009"],labs:["LAB001","LAB002","LAB003"],seminars:["SH001","SH002"]},
 {name:"First",classrooms:["LH101","LH102","LH103","LH104","LH105","LH106","LH107","LH108"],labs:["LAB101","LAB102","LAB103"],seminars:[]},
 {name:"Second",classrooms:["LH201","LH202","LH203","LH204","LH205","LH206","LH207"],labs:["LAB201","LAB202","LAB203","LAB204"],seminars:[]},
 {name:"Third",classrooms:["LH301","LH302","LH303","LH304","LH305","LH306","LH307"],labs:["LAB301","LAB302","LAB303","LAB304"],seminars:[]}
];

const allRooms=floors.flatMap(f=>[...f.classrooms,...f.labs,...f.seminars]);
const roomFloor=Object.fromEntries(floors.flatMap(f=>[...f.classrooms,...f.labs,...f.seminars].map(r=>[r,f.name])));
const roomType=Object.fromEntries(floors.flatMap(f=>[
 ...f.classrooms.map(r=>[r,"Classroom"]),
 ...f.labs.map(r=>[r,"Laboratory"]),
 ...f.seminars.map(r=>[r,"Seminar Hall"])
]));
const roomCapacity=Object.fromEntries(allRooms.map(r=>[r,r.startsWith("SH")?100:r.startsWith("LAB")?36:60]));

const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const periods=[
 {label:"09:00 – 10:00",start:"09:00",end:"10:00"},
 {label:"10:00 – 11:00",start:"10:00",end:"11:00"},
 {label:"11:20 – 12:20",start:"11:20",end:"12:20"},
 {label:"12:20 – 13:15",start:"12:20",end:"13:15"},
 {label:"14:10 – 15:00",start:"14:10",end:"15:00"},
 {label:"15:00 – 15:50",start:"15:00",end:"15:50"},
 {label:"15:50 – 16:40",start:"15:50",end:"16:40"}
];

const years={
 1:{floor:"Ground",subjects:["Engineering Mathematics I","Engineering Physics","Engineering Chemistry","Programming in C","Basic Electrical Engineering","Engineering Graphics","Communicative English","Environmental Studies"],labs:["Physics Lab","Chemistry Lab","C Programming Lab","Engineering Workshop"]},
 2:{floor:"First",subjects:["Engineering Mathematics III","Data Structures","Digital Logic Design","Computer Organization","Object Oriented Programming","Discrete Mathematics","Operating Systems","Database Management Systems"],labs:["Data Structures Lab","OOP Lab","Digital Logic Lab","Database Lab"]},
 3:{floor:"Second",subjects:["Design and Analysis of Algorithms","Computer Networks","Software Engineering","Theory of Computation","Web Technology","Artificial Intelligence","Microprocessors","Professional Elective"],labs:["Networks Lab","Web Technology Lab","AI Lab","Mini Project"]},
 4:{floor:"Third",subjects:["Machine Learning","Cloud Computing","Cyber Security","Big Data Analytics","Project Work","Internet of Things","Professional Elective II","Research / Seminar"],labs:["Machine Learning Lab","Cloud Lab","IoT Lab","Project Lab"]}
};

const sections=["A","B","C","D"];
const timetable={};
const sectionRoom={};

for(const [yr,info] of Object.entries(years)){
 const rooms=floors.find(f=>f.name===info.floor).classrooms;

 sections.forEach((sec,si)=>{
  const key=`${yr}${sec}`;
  sectionRoom[key]=rooms[si];
  timetable[key]={};

  days.forEach((day,di)=>{
   timetable[key][day]=periods.map((p,pi)=>{
    if((pi===3 && di%2===0)||(pi===5 && di%2===1)){
     if((di+si)%3===0){
      return {
       kind:"lab",
       subject:info.labs[(di+si)%info.labs.length],
       room:`LAB${yr===1?"00":yr===2?"10":yr===3?"20":"30"}${String(((di+si)%(yr===1?3:4))+1).padStart(2,"0")}`
      };
     }
    }

    if((di+pi+si)%11===0)
     return {kind:"free",subject:"Free period"};

    if(pi===3)
     return {kind:"break",subject:"Lunch"};

    const idx=(di*2+pi+si*3+yr)%info.subjects.length;
    return {kind:"class",subject:info.subjects[idx]};
   });
  });
 });
}

for(const key of Object.keys(timetable)){
 const yr=Number(key[0]);
 const info=years[yr];
 const si=sections.indexOf(key.slice(1));
 const prefix=yr===1?"LAB00":yr===2?"LAB10":yr===3?"LAB20":"LAB30";

 timetable[key].Wednesday[3]={
  kind:"lab",
  subject:info.labs[si%info.labs.length],
  room:`${prefix}${String(si%(yr===1?3:4)+1).padStart(2,"0")}`
 };
}

/* STATE */
const today=()=>new Date().toISOString().slice(0,10);

let bookings=JSON.parse(localStorage.getItem("cc_bookings_v2")||"null")||[];
let savedTimetable=JSON.parse(localStorage.getItem("cc_timetable_v1")||"null");
if(savedTimetable){
 Object.assign(timetable,savedTimetable);
}

let page="Overview";
let floorSelected="Ground";
let roomSelected="LH001";
let classSelected="1A";

let maintenanceRooms=JSON.parse(localStorage.getItem("cc_maintenance_v1")||"[]");
let adminSection="1A";
let adminDay="Monday";
let adminPeriod=0;

const app=document.querySelector("#app");

const save=()=>localStorage.setItem("cc_bookings_v2",JSON.stringify(bookings));

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

const getFloor=name=>floors.find(f=>f.name===name);

/* NAVIGATION ICONS */
const icons={
 "Overview":`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
 "Floor Plan":`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
 "Timetables":`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
 "Admin":`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>`,
 "Booking Requests":`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
};

const navItems=["Overview","Floor Plan","Timetables","Booking Requests","Admin"];

/* AVAILABILITY */
function getClassOccupant(room,date,start,end){
 if(roomType[room]!=="Classroom") return null;

 const d=new Date(date+"T12:00:00");
 const day=days[(d.getDay()+6)%7];
 if(!day) return null;

 for(const [section,assignedRoom] of Object.entries(sectionRoom)){
  if(assignedRoom!==room) continue;

  for(let i=0;i<periods.length;i++){
   const p=periods[i];
   const slot=timetable[section][day][i];

   if(slot.kind==="class"&&start<p.end&&end>p.start){
    return {section,subject:slot.subject,period:p.label};
   }
  }
 }
 return null;
}

function isBooked(room,date,start,end,ignoreId=null){
 return bookings.find(b=>
  b.id!==ignoreId&&b.room===room&&b.date===date&&
  b.status!=="Rejected"&&start<b.end&&end>b.start
 );
}

function availability(room,date,start,end){
 if(!allRooms.includes(room)) return {ok:false,reason:"Unknown room"};
 if(maintenanceRooms.includes(room)) return {ok:false,reason:`${room} is under maintenance.`};

 const occupant=getClassOccupant(room,date,start,end);
 if(occupant) return {ok:false,reason:`${room} is assigned to ${occupant.section} (${occupant.subject}) during ${occupant.period}.`};

 const booked=isBooked(room,date,start,end);
 if(booked) return {ok:false,reason:`Room has a ${booked.status.toLowerCase()} booking: ${booked.title}.`};

 return {ok:true,reason:"Available"};
}

/* HEADER */
function header(content){
 app.innerHTML=`
 <div class="app-shell">
  <aside class="sidebar">
   <div class="brand">
    <div class="brand-logo">C</div>
    <div><b>CampusClass</b><small>SMART SPACES</small></div>
   </div>

   <div class="nav-label">NAVIGATION</div>

   <nav>
    ${navItems.map(n=>`
     <button class="nav ${page===n?"active":""}" data-page="${n}">
      <span class="nav-symbol">${icons[n]}</span>${n}
     </button>
    `).join("")}
   </nav>

   <div class="profile">
    <div class="avatar">AD</div>
    <div><b>Demo Admin</b><small>Administrator</small></div>
   </div>
  </aside>

  <main>
   <header class="topbar">
    <div>
     <small>CANARA ENGINEERING COLLEGE</small>
     <h1>${page}</h1>
    </div>
    <span class="date-label">
     ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"short",year:"numeric"})}
    </span>
   </header>
   <section class="content">${content}</section>
  </main>
 </div>`;

 document.querySelectorAll("[data-page]").forEach(b=>{
  b.onclick=()=>{page=b.dataset.page;render()};
 });
}

/* STATISTICS */
function stat(label,value,sub){
 return `<div class="stat"><small>${label}</small><b>${value}</b><span>${sub}</span></div>`;
}

/* OVERVIEW */
function overview(){
 const totalClass=floors.reduce((a,f)=>a+f.classrooms.length,0);
 const totalLabs=floors.reduce((a,f)=>a+f.labs.length,0);
 const totalSem=floors.reduce((a,f)=>a+f.seminars.length,0);

 return `
 <div class="hero">
  <div>
   <small>CAMPUS AT A GLANCE</small>
   <h2>Find your space.<br>Plan your day.</h2>
   <p>Explore rooms across four floors, view class schedules, and request spaces — all in one place.</p>
   <button class="primary" data-go="Booking Requests">＋ Request a room</button>
  </div>
  <div class="hero-art">◈</div>
 </div>

 <div class="stats">
  ${stat("CLASSROOMS",totalClass,"Across four floors")}
  ${stat("LABORATORIES",totalLabs,"Practical learning spaces")}
  ${stat("SEMINAR HALLS",totalSem,"Ground floor")}
  ${stat("BOOKINGS",bookings.length,"Saved in browser")}
 </div>

 <div class="section-title"><div><h3>Quick access</h3><p>Jump to any section.</p></div></div>
 <div class="quick-grid">
  <button data-go="Floor Plan"><b>⌂ Floor plan</b><span>Browse all ${allRooms.length} spaces</span></button>
  <button data-go="Timetables"><b>▤ Class timetables</b><span>16 section-wise weekly schedules</span></button>
  <button data-go="Booking Requests"><b>＋ Booking requests</b><span>Check availability and request rooms</span></button>
 </div>

 <div class="section-title"><div><h3>Recent requests</h3><p>Latest booking activity.</p></div></div>
 ${bookingTable(bookings.slice().reverse().slice(0,5))}`;
}

/* FLOOR PLAN */
function floorPlan(){
 const f=getFloor(floorSelected);
 const groups=[["Classrooms",f.classrooms],["Laboratories",f.labs],["Seminar Halls",f.seminars]];

 return `
 <div class="section-title">
  <div><h3>Building directory</h3><p>Select a floor and choose a room.</p></div>
  <span class="tag">${allRooms.length} SPACES</span>
 </div>

 <div class="floor-tabs">
  ${floors.map(x=>`<button class="${x.name===floorSelected?"on":""}" data-floor="${x.name}">${x.name} Floor</button>`).join("")}
 </div>

 <div class="floor-columns">
  <div class="panel">
   <div class="panel-head"><b>${floorSelected} Floor · Directory</b><small>Select a room</small></div>
   ${groups.map(([label,rooms])=>rooms.length?`
    <h4>${label} <small>${rooms.length}</small></h4>
    <div class="room-grid">
     ${rooms.map(r=>`<button class="room ${roomSelected===r?"picked":""}" data-room="${r}"><b>${r}</b><small>${roomType[r]}</small></button>`).join("")}
    </div>`:"").join("")}
  </div>

  <aside class="panel room-details">
   <small>SELECTED SPACE</small>
   <h2>${roomSelected}</h2>
   <span class="tag">${roomType[roomSelected]}</span>
   <div class="detail"><small>Floor</small><b>${roomFloor[roomSelected]} Floor</b></div>
   <div class="detail"><small>Capacity</small><b>${roomCapacity[roomSelected]} people</b></div>
   <button class="primary wide" data-go="Booking Requests">Check availability →</button>
  </aside>
 </div>`;
}

/* TIMETABLE */
function timetablePage(){
 const chosen=document.querySelector("#classSelect")?.value||classSelected;
 const section=timetable[chosen],yr=Number(chosen[0]),floor=years[yr].floor;

 return `
 <div class="section-title">
  <div><h3>Section timetable</h3><p>Weekly academic schedule.</p></div>
  <label class="selector">SECTION
   <select id="classSelect">
    ${Object.keys(timetable).map(k=>`<option ${k===chosen?"selected":""}>${k}</option>`).join("")}
   </select>
  </label>
 </div>

 <div class="panel">
  <div class="panel-head">
   <div><b>${yr} Year · Section ${chosen.slice(1)}</b><small>${floor} Floor · ${sectionRoom[chosen]}</small></div>
   <span class="tag">MON – SAT</span>
  </div>
  <div class="table-scroll">
   <table class="tt">
    <thead><tr><th>DAY</th>${periods.map(p=>`<th>${p.label}</th>`).join("")}</tr></thead>
    <tbody>
     ${days.map(day=>`
      <tr><th>${day}</th>
       ${section[day].map(s=>`<td class="${s.kind}">${esc(s.subject)}${s.kind==="lab"?`<small>${esc(s.room)}</small>`:""}</td>`).join("")}
      </tr>`).join("")}
    </tbody>
   </table>
  </div>
 </div>
 <div class="legend-row"><span>Regular class = classroom occupied</span><span>Lab / free / lunch = classroom available</span></div>
 <p class="hint">Demo timetable data. Admin can edit schedules from the Admin page.</p>`;
}

/* BOOKING PAGE */
function bookingPage(){
 const date=document.querySelector("#bookDate")?.value||today();
 const floor=document.querySelector("#bookFloor")?.value||"Ground";
 const room=document.querySelector("#bookRoom")?.value||getFloor(floor).classrooms[0];
 const check=availability(room,date,"09:00","10:00");

 const slots=periods.map(p=>{
  const a=availability(room,date,p.start,p.end);
  return `<div class="slot-row"><span>${p.label}</span><div class="slot ${a.ok?"open":"closed"}">${a.ok?"Available":esc(a.reason)}</div></div>`;
 }).join("");

 return `
 <div class="booking-layout">
  <div>
   <div class="section-title"><div><h3>Room availability</h3><p>Timetable-aware room checking.</p></div></div>

   <div class="filters">
    <label>DATE<input id="bookDate" type="date" value="${date}"></label>
    <label>FLOOR<select id="bookFloor">${floors.map(f=>`<option ${f.name===floor?"selected":""}>${f.name}</option>`).join("")}</select></label>
    <label>ROOM<select id="bookRoom">${getFloor(floor).classrooms.concat(getFloor(floor).labs,getFloor(floor).seminars).map(r=>`<option ${r===room?"selected":""}>${r}</option>`).join("")}</select></label>
   </div>

   <div class="panel">
    <div class="panel-head"><div><b>${room} · Daily Timeline</b><small>${roomType[room]} · Capacity ${roomCapacity[room]}</small></div><span class="tag">${date}</span></div>
    <div class="timeline">${slots}</div>
    <div class="timeline-legend"><span><i class="green-dot"></i>Available</span><span><i class="red-dot"></i>Occupied / Requested</span></div>
   </div>

   <div class="section-title"><div><h3>My booking requests</h3><p>Requests submitted from this browser.</p></div></div>
   ${bookingTable(bookings.slice().reverse())}
  </div>

  <aside class="panel form-panel">
   <small class="eyebrow">NEW REQUEST</small>
   <h3>Book a space</h3>
   <p>Fill in the details to request a room.</p>
   <form id="bookingForm">
    <label>Event / class title<input name="title" required placeholder="e.g. Robotics workshop"></label>
    <label>Purpose<textarea name="purpose" rows="3" required></textarea></label>
    <div class="two">
     <label>Date<input name="date" type="date" required value="${date}"></label>
     <label>Participants<input name="people" type="number" min="1" required placeholder="40"></label>
    </div>
    <div class="two">
     <label>Start time<select name="start">${timeChoices("09:00")}</select></label>
     <label>End time<select name="end">${timeChoices("10:00")}</select></label>
    </div>
    <label>Room<select name="room">${allRooms.map(r=>`<option ${r===room?"selected":""}>${r}</option>`).join("")}</select></label>
    <label>Equipment needed<input name="equipment" placeholder="Projector, computers…"></label>
    <label>Organizer name<input name="organizer" required placeholder="Your name"></label>
    <label>Contact email<input name="email" type="email" required placeholder="name@example.com"></label>
    <div class="availability-result ${check.ok?"good":"bad"}">${esc(check.reason)}</div>
    <button class="primary wide" type="submit">Submit request →</button>
    <small class="hint">Demo only — requests are saved in this browser.</small>
   </form>
  </aside>
 </div>`;
}

function timeChoices(selected){
 return ["08:00","09:00","10:00","11:00","11:20","12:00","12:20","13:00","14:00","14:10","15:00","15:50","16:00","16:40","17:00","18:00"]
 .map(t=>`<option ${t===selected?"selected":""}>${t}</option>`).join("");
}

function bookingTable(items){
 if(!items.length) return `<div class="empty">No booking requests yet.</div>`;

 return `
 <div class="panel table-panel"><div class="table-scroll">
 <table>
  <thead><tr><th>Event</th><th>Room</th><th>Date / Time</th><th>Status</th><th></th></tr></thead>
  <tbody>${items.map(b=>`
   <tr>
    <td><b>${esc(b.title)}</b><small>${esc(b.organizer)}</small></td>
    <td>${esc(b.room)}</td>
    <td>${esc(b.date)}<small>${esc(b.start)} – ${esc(b.end)}</small></td>
    <td><span class="status ${b.status.toLowerCase()}">${esc(b.status)}</span></td>
    <td>${b.status==="Pending"?`<button class="cancel" data-cancel="${b.id}">Cancel</button>`:""}</td>
   </tr>`).join("")}
  </tbody>
 </table></div></div>`;
}

/* ADMIN DASHBOARD */
function adminPage(){
 const pending=bookings.filter(b=>b.status==="Pending");
 const approved=bookings.filter(b=>b.status==="Approved");
 const section=timetable[adminSection]||timetable["1A"];
 const slot=section[adminDay][adminPeriod];

 return `
 <div class="section-title">
  <div><h3>Campus administration</h3><p>Manage bookings, academic schedules and room operations.</p></div>
  <span class="tag">ADMIN CONSOLE</span>
 </div>

 <div class="stats">
  ${stat("PENDING REQUESTS",pending.length,"Awaiting decision")}
  ${stat("APPROVED BOOKINGS",approved.length,"Confirmed reservations")}
  ${stat("TOTAL ROOMS",allRooms.length,"Across four floors")}
  ${stat("MAINTENANCE ROOMS",maintenanceRooms.length,"Temporarily unavailable")}
 </div>

 <div class="section-title"><div><h3>Booking approvals</h3><p>Review requests and approve or reject them.</p></div></div>
 ${adminBookingTable(bookings.slice().reverse())}

 <div class="section-title"><div><h3>Timetable editor</h3><p>Update a section's subject, session type and lab assignment.</p></div></div>

 <div class="panel admin-editor">
  <div class="filters">
   <label>SECTION<select id="adminSection">${Object.keys(timetable).map(k=>`<option ${k===adminSection?"selected":""}>${k}</option>`).join("")}</select></label>
   <label>DAY<select id="adminDay">${days.map(d=>`<option ${d===adminDay?"selected":""}>${d}</option>`).join("")}</select></label>
   <label>PERIOD<select id="adminPeriod">${periods.map((p,i)=>`<option value="${i}" ${i===adminPeriod?"selected":""}>${p.label}</option>`).join("")}</select></label>
  </div>

  <form id="adminTimetableForm" class="admin-form">
   <label>SUBJECT / ACTIVITY<input name="subject" required value="${esc(slot.subject)}"></label>
   <label>SESSION TYPE<select name="kind">
    <option value="class" ${slot.kind==="class"?"selected":""}>Regular class</option>
    <option value="lab" ${slot.kind==="lab"?"selected":""}>Lab session</option>
    <option value="free" ${slot.kind==="free"?"selected":""}>Free period</option>
    <option value="break" ${slot.kind==="break"?"selected":""}>Lunch / break</option>
   </select></label>
   <label>LAB ROOM<input name="room" value="${esc(slot.room||"")}" placeholder="e.g. LAB001"></label>
   <button class="primary" type="submit">Save timetable change</button>
  </form>
  <p class="hint">Changes are saved in this browser. Shared updates require Firebase.</p>
 </div>

 <div class="section-title"><div><h3>Room operations</h3><p>Temporarily mark rooms unavailable for maintenance.</p></div></div>
 <div class="panel">
  <div class="filters">
   <label>SELECT ROOM<select id="maintenanceRoom">${allRooms.map(r=>`<option>${r}</option>`).join("")}</select></label>
   <label>STATUS<select id="maintenanceAction"><option value="close">Mark under maintenance</option><option value="open">Restore room availability</option></select></label>
   <div class="maintenance-action"><button class="primary" id="maintenanceSave" type="button">Update room status</button></div>
  </div>
  <p class="hint">Currently under maintenance: ${maintenanceRooms.length?maintenanceRooms.map(esc).join(", "):"None"}</p>
 </div>`;
}

function adminBookingTable(items){
 if(!items.length) return `<div class="empty">No booking requests have been submitted yet.</div>`;

 return `
 <div class="panel table-panel"><div class="table-scroll">
 <table>
  <thead><tr><th>EVENT / ORGANIZER</th><th>ROOM</th><th>DATE / TIME</th><th>STATUS</th><th>DECISION</th></tr></thead>
  <tbody>${items.map(b=>`
   <tr>
    <td><b>${esc(b.title)}</b><small>${esc(b.organizer)} · ${esc(b.email||"")}</small></td>
    <td>${esc(b.room)}</td>
    <td>${esc(b.date)}<small>${esc(b.start)} – ${esc(b.end)}</small></td>
    <td><span class="status ${b.status.toLowerCase()}">${esc(b.status)}</span></td>
    <td>${b.status==="Pending"?`<button class="admin-approve" data-approve="${b.id}">Approve</button> <button class="cancel" data-reject="${b.id}">Reject</button>`:"—"}</td>
   </tr>`).join("")}
  </tbody>
 </table></div></div>`;
}

/* ADMIN EVENT HANDLERS */
function wireAdmin(){
 ["adminSection","adminDay","adminPeriod"].forEach(id=>{
  document.querySelector("#"+id)?.addEventListener("change",e=>{
   if(id==="adminSection")adminSection=e.target.value;
   if(id==="adminDay")adminDay=e.target.value;
   if(id==="adminPeriod")adminPeriod=Number(e.target.value);
   render();
  });
 });

 document.querySelector("#adminTimetableForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries());

  if(data.kind==="lab"&&(!allRooms.includes(data.room)||!data.room.startsWith("LAB"))){
   alert("Enter a valid lab room ID.");
   return;
  }

  timetable[adminSection][adminDay][adminPeriod]={
   kind:data.kind,
   subject:data.subject,
   ...(data.kind==="lab"?{room:data.room}:{})
  };

  localStorage.setItem("cc_timetable_v1",JSON.stringify(timetable));
  alert("Timetable updated and saved.");
  render();
 });

 document.querySelectorAll("[data-approve]").forEach(b=>{
  b.onclick=()=>{
   const item=bookings.find(x=>x.id===Number(b.dataset.approve));
   if(!item)return;

   const conflict=bookings.find(x=>
    x.id!==item.id&&x.room===item.room&&x.date===item.date&&
    x.status==="Approved"&&item.start<x.end&&item.end>x.start
   );

   if(conflict){alert("Cannot approve: overlapping approved booking.");return;}

   const occ=getClassOccupant(item.room,item.date,item.start,item.end);
   if(occ){alert("Cannot approve: room is assigned to a class during that time.");return;}

   if(maintenanceRooms.includes(item.room)){
    alert("Cannot approve: room is under maintenance.");
    return;
   }

   item.status="Approved";
   save();
   render();
  };
 });

 document.querySelectorAll("[data-reject]").forEach(b=>{
  b.onclick=()=>{
   const item=bookings.find(x=>x.id===Number(b.dataset.reject));
   if(item){item.status="Rejected";save();render();}
  };
 });

 document.querySelector("#maintenanceSave")?.addEventListener("click",()=>{
  const room=document.querySelector("#maintenanceRoom").value;
  const action=document.querySelector("#maintenanceAction").value;

  maintenanceRooms=action==="close"
   ?[...new Set([...maintenanceRooms,room])]
   :maintenanceRooms.filter(r=>r!==room);

  localStorage.setItem("cc_maintenance_v1",JSON.stringify(maintenanceRooms));
  render();
 });
}

/* BOOKING EVENT HANDLERS */
function wireBooking(){
 ["bookDate","bookFloor","bookRoom"].forEach(id=>{
  document.querySelector("#"+id)?.addEventListener("change",()=>{
   if(id==="bookFloor"){
    const f=getFloor(document.querySelector("#bookFloor").value);
    document.querySelector("#bookRoom").innerHTML=[
     ...f.classrooms,...f.labs,...f.seminars
    ].map(r=>`<option>${r}</option>`).join("");
   }
   render();
  });
 });

 document.querySelector("#bookingForm")?.addEventListener("submit",e=>{
  e.preventDefault();

  const data=Object.fromEntries(new FormData(e.target).entries());
  const b={...data,people:Number(data.people),id:Date.now(),status:"Pending"};

  if(b.end<=b.start){alert("End time must be later than start time.");return;}
  if(b.people>roomCapacity[b.room]){alert(`Room capacity is ${roomCapacity[b.room]}.`);return;}

  const result=availability(b.room,b.date,b.start,b.end);
  if(!result.ok){alert(result.reason);return;}

  bookings.push(b);
  save();
  alert("Booking request submitted. Status: Pending.");
  render();
 });
}

/* MAIN RENDER */
function render(){
 const content=page==="Overview"?overview()
  :page==="Floor Plan"?floorPlan()
  :page==="Timetables"?timetablePage()
  :page==="Admin"?adminPage()
  :bookingPage();

 header(content);

 document.querySelectorAll("[data-go]").forEach(b=>{
  b.onclick=()=>{page=b.dataset.go;render()};
 });

 document.querySelectorAll("[data-floor]").forEach(b=>{
  b.onclick=()=>{
   floorSelected=b.dataset.floor;
   roomSelected=getFloor(floorSelected).classrooms[0]||getFloor(floorSelected).labs[0];
   render();
  };
 });

 document.querySelectorAll("[data-room]").forEach(b=>{
  b.onclick=()=>{roomSelected=b.dataset.room;render()};
 });

 document.querySelector("#classSelect")?.addEventListener("change",e=>{
  classSelected=e.target.value;
  render();
 });

 wireBooking();
 if(page==="Admin")wireAdmin();

 document.querySelectorAll("[data-cancel]").forEach(b=>{
  b.onclick=()=>{
   const id=Number(b.dataset.cancel);
   bookings=bookings.map(x=>x.id===id?{...x,status:"Rejected"}:x);
   save();
   render();
  };
 });
}

render();
