import "./style.css";

/* =========================================
   CURSOR GLOW
========================================= */
const glow = document.getElementById("cursor-glow");
let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;

if (glow) {
  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  (function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.left = glowX + "px";
    glow.style.top = glowY + "px";
    requestAnimationFrame(animateGlow);
  })();
}

/* =========================================
   FLOATING PARTICLES
========================================= */
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");
let particles = [];

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createParticles(count = 60) {
  if (!canvas) return;

  particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    });
  }
}

createParticles();

(function drawParticles() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const brightness = dist < 200 ? 1 - dist / 200 : 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size + brightness * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(129,140,248,${p.alpha + brightness * 0.5})`;
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - d / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
})();

/* =========================================
   CAMPUS ROOM DATA
========================================= */

const floors = [
  {
    name: "Ground",
    classrooms: ["LH001","LH002","LH003","LH004","LH005","LH006","LH007","LH008","LH009"],
    labs: ["LAB001","LAB002","LAB003"],
    seminars: ["SH001","SH002"]
  },
  {
    name: "First",
    classrooms: ["LH101","LH102","LH103","LH104","LH105","LH106","LH107","LH108"],
    labs: ["LAB101","LAB102","LAB103"],
    seminars: []
  },
  {
    name: "Second",
    classrooms: ["LH201","LH202","LH203","LH204","LH205","LH206","LH207"],
    labs: ["LAB201","LAB202","LAB203","LAB204"],
    seminars: []
  },
  {
    name: "Third",
    classrooms: ["LH301","LH302","LH303","LH304","LH305","LH306","LH307"],
    labs: ["LAB301","LAB302","LAB303","LAB304"],
    seminars: []
  }
];

const allRooms = floors.flatMap(f => [
  ...f.classrooms,
  ...f.labs,
  ...f.seminars
]);

const roomFloor = Object.fromEntries(
  floors.flatMap(f =>
    [...f.classrooms, ...f.labs, ...f.seminars]
      .map(r => [r, f.name])
  )
);

const roomType = Object.fromEntries(
  floors.flatMap(f => [
    ...f.classrooms.map(r => [r, "Classroom"]),
    ...f.labs.map(r => [r, "Laboratory"]),
    ...f.seminars.map(r => [r, "Seminar Hall"])
  ])
);

const roomCapacity = Object.fromEntries(
  allRooms.map(r => [
    r,
    r.startsWith("SH") ? 100 :
    r.startsWith("LAB") ? 36 : 60
  ])
);

/* =========================================
   TIMETABLE DATA
========================================= */

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const periods = [
  { label: "09:00 – 10:00", start: "09:00", end: "10:00" },
  { label: "10:00 – 11:00", start: "10:00", end: "11:00" },
  { label: "11:20 – 12:20", start: "11:20", end: "12:20" },
  { label: "12:20 – 13:15", start: "12:20", end: "13:15" },
  { label: "14:10 – 15:00", start: "14:10", end: "15:00" },
  { label: "15:00 – 15:50", start: "15:00", end: "15:50" },
  { label: "15:50 – 16:40", start: "15:50", end: "16:40" }
];

const years = {
  1: {
    floor: "Ground",
    subjects: [
      "Engineering Mathematics I",
      "Engineering Physics",
      "Engineering Chemistry",
      "Programming in C",
      "Basic Electrical Engineering",
      "Engineering Graphics",
      "Communicative English",
      "Environmental Studies"
    ],
    labs: [
      "Physics Lab",
      "Chemistry Lab",
      "C Programming Lab",
      "Engineering Workshop"
    ]
  },

  2: {
    floor: "First",
    subjects: [
      "Engineering Mathematics III",
      "Data Structures",
      "Digital Logic Design",
      "Computer Organization",
      "Object Oriented Programming",
      "Discrete Mathematics",
      "Operating Systems",
      "Database Management Systems"
    ],
    labs: [
      "Data Structures Lab",
      "OOP Lab",
      "Digital Logic Lab",
      "Database Lab"
    ]
  },

  3: {
    floor: "Second",
    subjects: [
      "Design and Analysis of Algorithms",
      "Computer Networks",
      "Software Engineering",
      "Theory of Computation",
      "Web Technology",
      "Artificial Intelligence",
      "Microprocessors",
      "Professional Elective"
    ],
    labs: [
      "Networks Lab",
      "Web Technology Lab",
      "AI Lab",
      "Mini Project"
    ]
  },

  4: {
    floor: "Third",
    subjects: [
      "Machine Learning",
      "Cloud Computing",
      "Cyber Security",
      "Big Data Analytics",
      "Project Work",
      "Internet of Things",
      "Professional Elective II",
      "Research / Seminar"
    ],
    labs: [
      "Machine Learning Lab",
      "Cloud Lab",
      "IoT Lab",
      "Project Lab"
    ]
  }
};

const sections = ["A", "B", "C", "D"];
const timetable = {};
const sectionRoom = {};

for (const [yr, info] of Object.entries(years)) {
  const rooms = floors.find(f => f.name === info.floor).classrooms;

  sections.forEach((sec, si) => {
    const key = `${yr}${sec}`;
    const room = rooms[si];

    sectionRoom[key] = room;
    timetable[key] = {};

    days.forEach((day, di) => {
      timetable[key][day] = periods.map((p, pi) => {
        const labPrefix =
          yr === "1" ? "LAB00" :
          yr === "2" ? "LAB10" :
          yr === "3" ? "LAB20" : "LAB30";

        const labCount = yr === "1" ? 3 : 4;

        if (
          ((pi === 3 && di % 2 === 0) ||
           (pi === 5 && di % 2 === 1)) &&
          (di + si) % 3 === 0
        ) {
          return {
            kind: "lab",
            subject: info.labs[(di + si) % info.labs.length],
            room: `${labPrefix}${String(((di + si) % labCount) + 1).padStart(2, "0")}`
          };
        }

        if ((di + pi + si) % 11 === 0) {
          return { kind: "free", subject: "Free period" };
        }

        if (pi === 3) {
          return { kind: "break", subject: "Lunch" };
        }

        const idx = (di * 2 + pi + si * 3 + Number(yr)) % info.subjects.length;

        return {
          kind: "class",
          subject: info.subjects[idx]
        };
      });
    });
  });
}

// Fixed Wednesday lab periods
for (const key of Object.keys(timetable)) {
  const yr = Number(key[0]);
  const info = years[yr];
  const si = sections.indexOf(key.slice(1));

  const prefix =
    yr === 1 ? "LAB00" :
    yr === 2 ? "LAB10" :
    yr === 3 ? "LAB20" : "LAB30";

  const count = yr === 1 ? 3 : 4;

  timetable[key].Wednesday[3] = {
    kind: "lab",
    subject: info.labs[si % info.labs.length],
    room: `${prefix}${String((si % count) + 1).padStart(2, "0")}`
  };
}

/* =========================================
   STATE AND HELPERS
========================================= */

const today = () => {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

let bookings = JSON.parse(
  localStorage.getItem("cc_bookings_v2") || "null"
) || [];

let page = "Overview";
let floorSelected = "Ground";
let roomSelected = "LH001";
let classSelected = "1A";

const app = document.querySelector("#app");

const save = () => {
  localStorage.setItem("cc_bookings_v2", JSON.stringify(bookings));
};

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const getFloor = name => floors.find(f => f.name === name);

/* =========================================
   ROOM AVAILABILITY
========================================= */

function getClassOccupant(room, date, start, end) {
  if (roomType[room] !== "Classroom") return null;

  const d = new Date(date + "T12:00:00");
  const day = days[(d.getDay() + 6) % 7];

  if (!day) return null;

  for (const [section, assignedRoom] of Object.entries(sectionRoom)) {
    if (assignedRoom !== room) continue;

    for (let i = 0; i < periods.length; i++) {
      const p = periods[i];
      const slot = timetable[section][day][i];

      if (
        slot.kind === "class" &&
        start < p.end &&
        end > p.start
      ) {
        return {
          section,
          subject: slot.subject,
          period: p.label
        };
      }
    }
  }

  return null;
}

function isBooked(room, date, start, end, ignoreId = null) {
  return bookings.find(b =>
    b.id !== ignoreId &&
    b.room === room &&
    b.date === date &&
    b.status !== "Rejected" &&
    start < b.end &&
    end > b.start
  );
}

function availability(room, date, start, end) {
  if (!allRooms.includes(room)) {
    return { ok: false, reason: "Unknown room" };
  }

  const occupant = getClassOccupant(room, date, start, end);

  if (occupant) {
    return {
      ok: false,
      reason: `${room} is allocated to ${occupant.section} (${occupant.subject}) during ${occupant.period}.`
    };
  }

  const booked = isBooked(room, date, start, end);

  if (booked) {
    return {
      ok: false,
      reason: `Room already has a ${booked.status.toLowerCase()} booking: ${booked.title}.`
    };
  }

  return { ok: true, reason: "Available" };
}

/* =========================================
   NAVIGATION ICONS
========================================= */

const icons = {
  "Overview": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,

  "Floor Plan": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,

  "Timetables": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,

  "Booking Requests": `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
};

const navItems = [
  ["Overview"],
  ["Floor Plan"],
  ["Timetables"],
  ["Booking Requests"]
];

/* =========================================
   APP HEADER
========================================= */

function header(content) {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo">C</div>
          <div>
            <b>CampusClass</b>
            <small>SMART SPACES</small>
          </div>
        </div>

        <div class="nav-label">NAVIGATION</div>

        <nav>
          ${navItems.map(([n]) => `
            <button class="nav ${page === n ? "active" : ""}" data-page="${n}">
              <span class="nav-symbol">${icons[n]}</span>
              ${n}
            </button>
          `).join("")}
        </nav>

        <div class="profile">
          <div class="avatar">DU</div>
          <div>
            <b>Demo User</b>
            <small>Student account</small>
          </div>
        </div>
      </aside>

      <main>
        <header class="topbar">
          <div>
            <small>CANARA ENGINEERING COLLEGE</small>
            <h1>${page}</h1>
          </div>
          <span class="date-label">
            ${new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric"
            })}
          </span>
        </header>

        <section class="content">${content}</section>
      </main>
    </div>
  `;

  document.querySelectorAll("[data-page]").forEach(b => {
    b.onclick = () => {
      page = b.dataset.page;
      render();
    };
  });
}

/* =========================================
   OVERVIEW PAGE
========================================= */

function stat(label, value, sub) {
  return `
    <div class="stat">
      <small>${label}</small>
      <b>${value}</b>
      <span>${sub}</span>
    </div>
  `;
}

function overview() {
  const totalClass = floors.reduce((a, f) => a + f.classrooms.length, 0);
  const totalLabs = floors.reduce((a, f) => a + f.labs.length, 0);
  const totalSem = floors.reduce((a, f) => a + f.seminars.length, 0);

  return `
    <div class="hero">
      <div>
        <small>CAMPUS AT A GLANCE</small>
        <h2>Find your space.<br>Plan your day.</h2>
        <p>Explore rooms across 4 floors, view class schedules, and request spaces — all in one place.</p>
        <button class="primary" data-go="Booking Requests">＋ Request a room</button>
      </div>
      <div class="hero-art">◈</div>
    </div>

    <div class="stats">
      ${stat("CLASSROOMS", totalClass, "Across four floors")}
      ${stat("LABORATORIES", totalLabs, "Practical learning spaces")}
      ${stat("SEMINAR HALLS", totalSem, "Ground floor")}
      ${stat("BOOKINGS", bookings.length, "Saved in browser")}
    </div>

    <div class="section-title">
      <div><h3>Quick access</h3><p>Jump to any section.</p></div>
    </div>

    <div class="quick-grid">
      <button data-go="Floor Plan">
        <b>⌂ Floor plan</b>
        <span>Browse all ${allRooms.length} spaces across 4 floors</span>
      </button>

      <button data-go="Timetables">
        <b>▤ Class timetables</b>
        <span>16 section-wise weekly schedules</span>
      </button>

      <button data-go="Booking Requests">
        <b>＋ Booking requests</b>
        <span>Check availability and request rooms</span>
      </button>
    </div>

    <div class="section-title">
      <div><h3>Recent requests</h3><p>Latest booking activity.</p></div>
    </div>

    ${bookingTable(bookings.slice().reverse().slice(0, 5))}
  `;
}

/* =========================================
   DIGITAL TWIN FLOOR PLAN
========================================= */

function floorPlan() {
  const f = getFloor(floorSelected);

  const selectedDate =
    document.querySelector("#mapDate")?.value || today();

  const selectedTime =
    document.querySelector("#mapTime")?.value ||
    new Date().toTimeString().slice(0, 5);

  function roomStatus(room) {
    // Check bookings first
    const booking = bookings.find(b =>
      b.room === room &&
      b.date === selectedDate &&
      b.status !== "Rejected" &&
      selectedTime >= b.start &&
      selectedTime < b.end
    );

    if (booking) {
      return booking.status === "Approved"
        ? {
            type: "critical",
            label: "Booked",
            detail: booking.title
          }
        : {
            type: "warning",
            label: "Pending request",
            detail: booking.title
          };
    }

    const dateObject = new Date(selectedDate + "T12:00:00");
    const dayIndex = (dateObject.getDay() + 6) % 7;
    const day = days[dayIndex];

    if (!day) {
      return {
        type: "healthy",
        label: "Available",
        detail: "No regular classes on Sunday"
      };
    }

    const periodIndex = periods.findIndex(p =>
      selectedTime >= p.start &&
      selectedTime < p.end
    );

    if (periodIndex === -1) {
      return {
        type: "healthy",
        label: "Available",
        detail: "Outside scheduled class hours"
      };
    }

    // Classroom timetable analysis
    if (roomType[room] === "Classroom") {
      for (const [section, assignedRoom] of Object.entries(sectionRoom)) {
        if (assignedRoom !== room) continue;

        const slot = timetable[section]?.[day]?.[periodIndex];

        if (!slot) continue;

        if (slot.kind === "class") {
          return {
            type: "warning",
            label: "Class ongoing",
            detail: `${section} · ${slot.subject}`
          };
        }

        const detail =
          slot.kind === "lab"
            ? `${section} attending ${slot.subject}`
            : slot.kind === "break"
              ? "Lunch break"
              : "Free period";

        return {
          type: "healthy",
          label: "Available",
          detail
        };
      }
    }

    // Laboratory timetable analysis
    if (roomType[room] === "Laboratory") {
      for (const [section, schedule] of Object.entries(timetable)) {
        const slot = schedule?.[day]?.[periodIndex];

        if (slot?.kind === "lab" && slot.room === room) {
          return {
            type: "lab-active",
            label: "Lab active",
            detail: `${section} · ${slot.subject}`
          };
        }
      }
    }

    return {
      type: "healthy",
      label: "Available",
      detail: "No scheduled activity"
    };
  }

  const groups = [
    ["Classrooms", f.classrooms],
    ["Laboratories", f.labs],
    ["Seminar halls", f.seminars]
  ];

  const rooms = [
    ...f.classrooms,
    ...f.labs,
    ...f.seminars
  ];

  if (!rooms.includes(roomSelected)) {
    roomSelected = rooms[0];
  }

  const counts = {
    healthy: 0,
    warning: 0,
    critical: 0,
    "lab-active": 0
  };

  rooms.forEach(room => {
    counts[roomStatus(room).type]++;
  });

  const selectedStatus = roomStatus(roomSelected);

  return `
    <div class="digital-map">

      <div class="digital-header">
        <div>
          <span class="digital-kicker">DIGITAL TWIN</span>
          <h2>Campus Map</h2>
          <small>${f.name} Floor · ${rooms.length} spaces monitored</small>
        </div>

        <div class="map-legend">
          <span class="healthy-dot">● Available</span>
          <span class="warning-dot">● Class ongoing</span>
          <span class="critical-dot">● Approved booking</span>
          <span class="lab-dot">● Lab active</span>
        </div>
      </div>

      <div class="map-controls">
        <label>
          DATE
          <input type="date" id="mapDate" value="${esc(selectedDate)}">
        </label>

        <label>
          TIME
          <input type="time" id="mapTime" value="${esc(selectedTime)}">
        </label>

        <label>
          FLOOR
          <select id="mapFloor">
            ${floors.map(x => `
              <option value="${x.name}" ${x.name === floorSelected ? "selected" : ""}>
                ${x.name} Floor
              </option>
            `).join("")}
          </select>
        </label>

        <div class="live-indicator">● TIMETABLE ANALYSIS</div>
      </div>

      <div class="map-stats">
        <div><b>${counts.healthy}</b><small>Available</small></div>
        <div><b>${counts.warning}</b><small>Occupied</small></div>
        <div><b>${counts.critical}</b><small>Booked</small></div>
        <div><b>${counts["lab-active"]}</b><small>Active labs</small></div>
      </div>

      <div class="digital-grid">
        ${groups.map(([title, list]) => list.length ? `
          <div class="digital-group">
            <h3>${title} <span>${list.length}</span></h3>

            <div class="digital-rooms">
              ${list.map(room => {
                const s = roomStatus(room);

                return `
                  <button
                    class="digital-room ${s.type} ${room === roomSelected ? "selected" : ""}"
                    data-room="${room}"
                    type="button"
                  >
                    <span class="building-icon">▥</span>
                    <b>${room}</b>
                    <strong>${s.label}</strong>
                    <small>${esc(s.detail)}</small>
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        ` : "").join("")}
      </div>

      <div class="digital-footer">
        <span>● TIMETABLE-BASED STATUS · DEMO DATA</span>
        <span>${esc(selectedDate)} · ${esc(selectedTime)}</span>
      </div>
    </div>

    <div class="digital-detail">
      <span>SELECTED SPACE</span>
      <h2>${roomSelected}</h2>
      <p>${roomType[roomSelected]} · ${roomFloor[roomSelected]} Floor</p>

      <div class="detail-status ${selectedStatus.type}">
        ${selectedStatus.label}
      </div>

      <p>${esc(selectedStatus.detail)}</p>
      <p>Capacity: ${roomCapacity[roomSelected]} people</p>

      <button class="primary" data-go="Booking Requests" type="button">
        View booking options →
      </button>
    </div>

    <p class="hint">
      Status is calculated from demo timetables and locally saved bookings,
      not physical occupancy sensors.
    </p>
  `;
}

/* =========================================
   TIMETABLE PAGE
========================================= */

function timetablePage() {
  const chosen =
    document.querySelector("#classSelect")?.value || classSelected;

  const section = timetable[chosen];
  const yr = Number(chosen[0]);
  const floor = years[yr].floor;

  return `
    <div class="section-title">
      <div>
        <h3>Section timetable</h3>
        <p>Each section has a separate illustrative weekly schedule.</p>
      </div>

      <label class="selector">
        SECTION
        <select id="classSelect">
          ${Object.keys(timetable).map(k => `
            <option ${k === chosen ? "selected" : ""}>${k}</option>
          `).join("")}
        </select>
      </label>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <b>
            ${yr}${yr === 1 ? "st" : yr === 2 ? "nd" : yr === 3 ? "rd" : "th"}
            Year · Section ${chosen.slice(1)}
          </b>
          <small>${floor} Floor · Classroom ${sectionRoom[chosen]}</small>
        </div>

        <span class="tag">MON – SAT</span>
      </div>

      <div class="table-scroll">
        <table class="tt">
          <thead>
            <tr>
              <th>DAY</th>
              ${periods.map(p => `<th>${p.label}</th>`).join("")}
            </tr>
          </thead>

          <tbody>
            ${days.map(day => `
              <tr>
                <th>${day}</th>
                ${section[day].map(s => `
                  <td class="${s.kind}">
                    ${esc(s.subject)}
                    ${s.kind === "lab" ? `<small>${esc(s.room)}</small>` : ""}
                  </td>
                `).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="legend-row">
      <span>● Regular class = classroom occupied</span>
      <span>● Lab / free / lunch = classroom available</span>
    </div>

    <p class="hint">
      Demo subjects and faculty assignments are illustrative.
      Replace with official college timetable data when available.
    </p>
  `;
}

/* =========================================
   BOOKING PAGE
========================================= */

function bookingPage() {
  const date =
    document.querySelector("#bookDate")?.value || today();

  const floor =
    document.querySelector("#bookFloor")?.value || "Ground";

  const room =
    document.querySelector("#bookRoom")?.value ||
    getFloor(floor).classrooms[0];

  const start =
    document.querySelector("#bookStart")?.value || "09:00";

  const end =
    document.querySelector("#bookEnd")?.value || "10:00";

  const check = availability(room, date, start, end);

  const slots = periods.map(p => {
    const a = availability(room, date, p.start, p.end);

    return `
      <div class="slot-row">
        <span>${p.label}</span>
        <div class="slot ${a.ok ? "open" : "closed"}">
          ${a.ok ? "Available" : esc(a.reason)}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="booking-layout">
      <div>
        <div class="section-title">
          <div>
            <h3>Room availability</h3>
            <p>Availability follows section timetables and existing requests.</p>
          </div>
        </div>

        <div class="filters">
          <label>
            DATE
            <input id="bookDate" type="date" value="${date}">
          </label>

          <label>
            FLOOR
            <select id="bookFloor">
              ${floors.map(f => `
                <option ${f.name === floor ? "selected" : ""}>${f.name}</option>
              `).join("")}
            </select>
          </label>

          <label>
            ROOM
            <select id="bookRoom">
              ${[
                ...getFloor(floor).classrooms,
                ...getFloor(floor).labs,
                ...getFloor(floor).seminars
              ].map(r => `
                <option ${r === room ? "selected" : ""}>${r}</option>
              `).join("")}
            </select>
          </label>
        </div>

        <div class="panel">
          <div class="panel-head">
            <div>
              <b>${room} · Daily Timeline</b>
              <small>${roomType[room]} · Capacity ${roomCapacity[room]}</small>
            </div>
            <span class="tag">${date}</span>
          </div>

          <div class="timeline">${slots}</div>

          <div class="timeline-legend">
            <span><i class="green-dot"></i>Available</span>
            <span><i class="red-dot"></i>Occupied / Requested</span>
          </div>
        </div>

        <div class="section-title">
          <div>
            <h3>My booking requests</h3>
            <p>Requests submitted from this browser.</p>
          </div>
        </div>

        ${bookingTable(bookings.slice().reverse())}
      </div>

      <aside class="panel form-panel">
        <small class="eyebrow">NEW REQUEST</small>
        <h3>Book a space</h3>
        <p>Fill in the details to request a room.</p>

        <form id="bookingForm">
          <label>
            Event / class title
            <input name="title" required placeholder="e.g. Robotics workshop">
          </label>

          <label>
            Purpose and description
            <textarea name="purpose" rows="3" required placeholder="Describe the activity"></textarea>
          </label>

          <div class="two">
            <label>
              Date
              <input name="date" type="date" required value="${date}">
            </label>

            <label>
              Participants
              <input name="people" type="number" min="1" required placeholder="40">
            </label>
          </div>

          <div class="two">
            <label>
              Start time
              <select name="start">${timeChoices(start)}</select>
            </label>

            <label>
              End time
              <select name="end">${timeChoices(end)}</select>
            </label>
          </div>

          <label>
            Room
            <select name="room">
              ${allRooms.map(r => `
                <option ${r === room ? "selected" : ""}>${r}</option>
              `).join("")}
            </select>
          </label>

          <label>
            Equipment needed
            <input name="equipment" placeholder="Projector, computers…">
          </label>

          <label>
            Organizer name
            <input name="organizer" required placeholder="Your name">
          </label>

          <label>
            Contact email
            <input name="email" type="email" required placeholder="name@example.com">
          </label>

          <div class="availability-result ${check.ok ? "good" : "bad"}" id="availabilityResult">
            ${esc(check.reason)}
          </div>

          <button class="primary wide" type="submit">
            Submit request →
          </button>

          <small class="hint">
            Demo only — requests are saved in local browser storage.
            Admin approval is not connected.
          </small>
        </form>
      </aside>
    </div>
  `;
}

/* =========================================
   BOOKING HELPERS
========================================= */

function timeChoices(selected) {
  return [
    "08:00", "09:00", "10:00", "11:00",
    "11:20", "12:00", "12:20", "13:00",
    "14:00", "14:10", "15:00", "15:50",
    "16:00", "16:40", "17:00", "18:00"
  ].map(t => `
    <option ${t === selected ? "selected" : ""}>${t}</option>
  `).join("");
}

function bookingTable(items) {
  if (!items.length) {
    return `<div class="empty">No booking requests yet. Submit one to get started.</div>`;
  }

  return `
    <div class="panel table-panel">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Room</th>
              <th>Date / Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${items.map(b => `
              <tr>
                <td>
                  <b>${esc(b.title)}</b>
                  <small>${esc(b.organizer)}</small>
                </td>

                <td>${esc(b.room)}</td>

                <td>
                  ${esc(b.date)}
                  <small>${esc(b.start)} – ${esc(b.end)}</small>
                </td>

                <td>
                  <span class="status ${b.status.toLowerCase()}">${esc(b.status)}</span>
                </td>

                <td>
                  ${b.status === "Pending"
                    ? `<button class="cancel" data-cancel="${b.id}">Cancel</button>`
                    : ""}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* =========================================
   MAIN RENDER FUNCTION
========================================= */

function render() {
  const content =
    page === "Overview" ? overview() :
    page === "Floor Plan" ? floorPlan() :
    page === "Timetables" ? timetablePage() :
    bookingPage();

  header(content);

  // Navigation buttons
  document.querySelectorAll("[data-go]").forEach(b => {
    b.onclick = () => {
      page = b.dataset.go;
      render();
    };
  });

  // Floor tabs
  document.querySelectorAll("[data-floor]").forEach(b => {
    b.onclick = () => {
      floorSelected = b.dataset.floor;
      const f = getFloor(floorSelected);
      roomSelected = f.classrooms[0] || f.labs[0] || f.seminars[0];
      render();
    };
  });

  // Room selection
  document.querySelectorAll("[data-room]").forEach(b => {
    b.onclick = () => {
      roomSelected = b.dataset.room;
      render();
    };
  });

  // Digital Twin date and time
  ["mapDate", "mapTime"].forEach(id => {
    document.querySelector("#" + id)?.addEventListener("change", render);
  });

  // Digital Twin floor selector
  document.querySelector("#mapFloor")?.addEventListener("change", e => {
    floorSelected = e.target.value;

    const f = getFloor(floorSelected);
    roomSelected = f.classrooms[0] || f.labs[0] || f.seminars[0];

    render();
  });

  // Timetable selector
  document.querySelector("#classSelect")?.addEventListener("change", e => {
    classSelected = e.target.value;
    render();
  });

  // Booking form
  wireBooking();

  // Cancel booking requests
  document.querySelectorAll("[data-cancel]").forEach(b => {
    b.onclick = () => {
      const id = Number(b.dataset.cancel);

      bookings = bookings.map(x =>
        x.id === id ? { ...x, status: "Rejected" } : x
      );

      save();
      render();
    };
  });

  // Card hover tilt
  document.querySelectorAll(".stat, .quick-grid button, .room").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* =========================================
   BOOKING EVENT HANDLERS
========================================= */

function wireBooking() {
  ["bookDate", "bookFloor", "bookRoom", "bookStart", "bookEnd"].forEach(id => {
    document.querySelector("#" + id)?.addEventListener("change", () => {
      if (id === "bookFloor") {
        const f = getFloor(document.querySelector("#bookFloor").value);

        document.querySelector("#bookRoom").innerHTML = [
          ...f.classrooms,
          ...f.labs,
          ...f.seminars
        ].map(r => `<option>${r}</option>`).join("");
      }

      render();
    });
  });

  document.querySelector("#bookingForm")?.addEventListener("submit", e => {
    e.preventDefault();

    const data = new FormData(e.target);
    const b = Object.fromEntries(data.entries());

    b.people = Number(b.people);
    b.id = Date.now();
    b.status = "Pending";

    if (b.end <= b.start) {
      alert("End time must be later than start time.");
      return;
    }

    if (b.people > roomCapacity[b.room]) {
      alert(`This room capacity is ${roomCapacity[b.room]}.`);
      return;
    }

    const result = availability(b.room, b.date, b.start, b.end);

    if (!result.ok) {
      alert(result.reason);
      return;
    }

    bookings.push(b);
    save();

    alert("Booking request submitted. Status: Pending.");
    render();
  });
}

/* =========================================
   START APPLICATION
========================================= */

render();
