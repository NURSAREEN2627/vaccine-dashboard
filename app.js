// =========================
// 🔥 Firebase
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyAFQ-qy8Dqwxj1MA1rt7YZ04mEzRzlPsaY",
  authDomain: "vaccine-dashboard-81107.firebaseapp.com",
  databaseURL: "https://vaccine-dashboard-81107-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vaccine-dashboard-81107",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// =========================
// 📍 ตำบล (แสดงไทย)
// =========================
const tambonMap = {
  all: "ทั้งหมด",
  kolok: "สุไหงโก-ลก",
  munoh: "มูโนะ",
  pasemas: "ปาเสมัส",
  puyoh: "ปูโยะ"
};

// =========================
// 💉 รายการวัคซีน
// =========================
const vaccineList = [
  "BCG","HBV1","HBV2","HBV3","DTP1","DTP2","DTP3",
  "OPV1","OPV2","OPV3","IPV","MMR1","JE1","JE2",
  "DTP4","OPV4","MMR2","dT","HPV"
];
// =========================
// 💉 หน่วยบริการ
// =========================
const hospitalMap = {
  kolok: [
    { id:"77729", name:"ศูนย์แพทย์ใกล้ใจ1" },
    { id:"77728", name:"ศูนย์แพทย์ใกล้ใจ2" }
  ],
  munoh: [
    { id:"10169", name:"รพ.สต.มูโนะ" }
  ],
  puyoh: [
    { id:"10170", name:"รพ.สต.ปูโยะ" }
  ],
  pasemas: [
    { id:"10168", name:"รพ.สต.ปาเสมัส" },
    { id:"10658", name:"รพ.สต.บ้านกวาลอซีรา" }
  ]
};
function updateHospitalFilter(){

  const tambon = document.getElementById("tambonFilter").value;
  const hospitalSelect = document.getElementById("hospitalFilter");

  hospitalSelect.innerHTML = `<option value="all">🏥 ทุกหน่วยบริการ</option>`;

  const map = {
    pasemas:[
      {id:"10168",name:"รพ.สต.ปาเสมัส"},
      {id:"10658",name:"รพ.สต.บ้านกวาลอซีรา"}
    ],
    munoh:[
      {id:"10169",name:"รพ.สต.มูโนะ"}
    ],
    puyoh:[
      {id:"10170",name:"รพ.สต.ปูโยะ"}
    ],
    kolok: [
      { id:"77729", name:"ศูนย์แพทย์ใกล้ใจ1 (เทศบาล)" },
      { id:"77728", name:"ศูนย์แพทย์ใกล้ใจ2 (เจริญเขต)" }
    ],
  };

  if(!map[tambon]) return;

  map[tambon].forEach(h=>{
    hospitalSelect.innerHTML += `<option value="${h.id}">${h.name}</option>`;
  });
}

function getHospitalName(id){

  const map = {
    "10170":"รพ.สต.ปูโยะ",
    "10168":"รพ.สต.ปาเสมัส",
    "10169" :"พ.สต.มูโนะ",
    "77729":"ศูนย์แพทย์ใกล้ใจ1",
    "77728":"ศูนย์แพทย์ใกล้ใจ2",
    "10658":"รพ.สต.บ้านกวาลอซีรา"
  };

  return map[id] || "-";
}


// =========================
// 🔓 ล็อกอิน
// =========================
function login(){

  let cid = document.getElementById("cid").value.replace(/\D/g,'');

  if(cid.length !== 13){
    document.getElementById("msg").innerText = "กรอกเลขบัตรให้ครบ";
    return;
  }

  db.ref("users").once("value", snap=>{

    const data = snap.val() || {};
    let foundUser = null;

    for(let id in data){

      const dbCid = (data[id].cid || "").replace(/\D/g,'');

      if(dbCid === cid){
        foundUser = data[id];
        break;
      }
    }

    if(!foundUser){
      document.getElementById("msg").innerText = "ไม่พบผู้ใช้";
      return;
    }

    // ✅ เก็บข้อมูล
    localStorage.setItem("user", cid);
    localStorage.setItem("name", foundUser.name + " " + (foundUser.lastname || ""));
    localStorage.setItem("role", foundUser.role || "user");

    // 👉 log เข้าใช้งาน
    db.ref("loginLogs").push({
      cid: foundUser.cid,
      name: foundUser.name,
      role: foundUser.role || "user",
      loginTime: new Date().toISOString()
    });

    window.location.href = "index.html";

  });

}


function loadKPI(){
  console.log("โหลด KPI");
}

function goTambon(){
  console.log("โหลดตำบล");
}
// =========================
// 📑 สมัคร
// =========================
function register(){

  const name = document.getElementById("name").value.trim();
  const lastname = document.getElementById("lastname").value.trim();
  const cid = document.getElementById("cid").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  // 🔥 validate
  if(!name || !lastname || !cid){
    document.getElementById("msg").innerText = "❌ กรุณากรอกข้อมูลให้ครบ";
    return;
  }

  if(cid.length !== 13){
    document.getElementById("msg").innerText = "❌ เลขบัตรต้อง 13 หลัก";
    return;
  }

  // 🔍 เช็คซ้ำ
  db.ref("users/"+cid).once("value", snap=>{

    if(snap.exists()){
      document.getElementById("msg").innerText = "❌ มีผู้ใช้นี้แล้ว";
      return;
    }

    // 🔥 บันทึก
    db.ref("users/"+cid).set({
      cid,
      name,
      lastname,
      email,
      phone,
      role:"user", // default
      createdAt: new Date().toISOString()
    });

    document.getElementById("msg").style.color = "green";
    document.getElementById("msg").innerText = "✅ สมัครสำเร็จ";

    // 🔥 redirect
    setTimeout(()=>{
      window.location.href = "login.html";
    },1000);

  });

}



// =========================
// 📊 โหลดข้อมูล + ตาราง + กราฟ
// =========================
let followChart;
let chartMode = "percent"; // percent | village

function loadFollow(){

  const filter = document.getElementById("tambonFilter")?.value || "all";
  const keyword = (document.getElementById("searchInput")?.value || "").toLowerCase();

  const mobileList = document.getElementById("mobileList");
  if(mobileList) mobileList.innerHTML = "";

  const tambonFilter = document.getElementById("tambonFilter")?.value || "all";
  const hospitalFilter = document.getElementById("hospitalFilter")?.value || "all";
  const ageFilter = document.getElementById("ageFilter")?.value || "all";
  
  
  db.ref("children").on("value", snap=>{

    const data = snap.val() || {};
    let html = "";
    let done = 0;
    let notdone = 0;

    // 🔥 ใช้เก็บข้อมูลหมู่
    let villageMap = {};
    
    for(let id in data){

      let c = data[id] || {};
      const age = getAgeMonths(c.birth);

        if(ageFilter === "0-6" && !(age <= 6)) continue;
        if(ageFilter === "6-12" && !(age > 6 && age <= 12)) continue;
        if(ageFilter === "1-2" && !(age > 12 && age <= 24)) continue;
        if(ageFilter === "2+" && !(age > 24)) continue;
        
      // 🔍 filter ตำบล
      if(tambonFilter !== "all" && c.tambon !== tambonFilter) continue;

      // 🔍 filter รพ.สต
      if(hospitalFilter !== "all" && c.hospital !== hospitalFilter) continue;

      // 🔍 search
      const hn   = (c.hn || "").toLowerCase();
      const name = (c.name || "").toLowerCase();
      const cid  = (c.cid  || "").toLowerCase();

      if(
        keyword &&
        !name.includes(keyword) &&
        !cid.includes(keyword) &&
        !hn.includes(keyword)
      ){
        continue;
      }

      // ✅ นับวัคซีน
      const count = c.vaccines ? Object.keys(c.vaccines).length : 0;

      if(count > 0) done++;
      else notdone++;

      // 🔥 นับหมู่
      let v = c.village || "ไม่ระบุ";

      if(!villageMap[v]){
        villageMap[v] = {done:0, notdone:0};
      }

      if(count > 0){
        villageMap[v].done++;
      }else{
        villageMap[v].notdone++;
      }

      // 📱 MOBILE
      if(mobileList){
        mobileList.innerHTML += `
        <div class="child-card">
          <div class="child-header">
            <span>${c.name || "-"}</span>
            <span>${c.hn || "-"}</span>
          </div>

         <div class="child-info" 
            onclick="openMap('${c.tambon}','${c.house}','${c.village}')"
            style="cursor:pointer;color:#2563eb;">

            📍 ${getTambonName(c.tambon)} | 🏠 ${c.house || "-"} | หมู่ ${c.village || "-"}
          </div>
          <div class="child-info">
            🎂 ${c.birth || "-"} | 💉 ${count} เข็ม
            
          </div>

          <div class="child-footer">
            <span class="status-badge ${count>0?'done':'notdone'}">
              ${count>0?'ฉีดแล้ว':'ยังไม่ฉีด'}
            </span>

            <button onclick="openVaccineModal('${id}')" 
              class="btn btn-outline-primary btn-mini">
              💉 จัดการ
            </button>
          </div>
        </div>
        `;
      }

      // 🖥 TABLE
      html += `
<tr data-id="${id}">

<td><input value="${c.hn||""}" oninput="autoSave('${id}','hn',this.value)"></td>

<td><input value="${c.cid||""}" oninput="autoSave('${id}','cid',this.value)"></td>

<td><input value="${c.name||""}" oninput="autoSave('${id}','name',this.value)"></td>

<td>
<select class="form-select" onchange="changeTambon(this)">
<option value="">-- เลือกตำบล --</option>
<option value="kolok" ${c.tambon==="kolok"?"selected":""}>สุไหงโก-ลก</option>
<option value="munoh" ${c.tambon==="munoh"?"selected":""}>มูโนะ</option>
<option value="puyoh" ${c.tambon==="puyoh"?"selected":""}>ปูโยะ</option>
<option value="pasemas" ${c.tambon==="pasemas"?"selected":""}>ปาเสมัส</option>
</select>
</td>

<td>
<select class="form-select"
onchange="autoSave('${id}','hospital',this.value)">
<option value="">-- เลือกรพ.สต --</option>
<option value="10170" ${c.hospital==="10170"?"selected":""}>รพ.สต.ปูโยะ</option>
<option value="10169" ${c.hospital==="10169"?"selected":""}>รพ.สต.มูโนะ</option>
<option value="10168" ${c.hospital==="10168"?"selected":""}>รพ.สต.ปาเสมัส</option>
<option value="77729" ${c.hospital==="77729"?"selected":""}>ศูนย์แพทย์ใกล้ใจ1</option>
<option value="77728" ${c.hospital==="77728"?"selected":""}>ศูนย์แพทย์ใกล้ใจ2</option>
<option value="10658" ${c.hospital==="10658"?"selected":""}>รพ.สต.บ้านกวาลอซีรา</option>
</select>
</td>

<td><input value="${c.house||""}" oninput="autoSave('${id}','house',this.value)"></td>

<td>${buildVillageDropdown(c.tambon, c.village, id)}</td>

<td><input value="${c.birth||""}"oninput="autoSave('${id}','birth',this.value)"></td>
<td class="age-cell">${getAgeBadge(c.birth)}</td>

<td onclick="openVaccineModal('${id}')" style="cursor:pointer;text-align:center">
<div style="
display:inline-flex;
align-items:center;
justify-content:center;
min-width:70px;
height:36px;
border-radius:10px;
border:1px solid #ddd;
background:${count===0?'#fee2e2':'#dcfce7'};
color:${count===0?'#dc2626':'#059669'};
">
💉 ${count}
</div>
</td>

<td><input value="${c.note||""}" oninput="autoSave('${id}','note',this.value)"></td>

<td>${c.updatedAt||"-"}</td>

<td><button onclick="deleteChild('${id}')">🗑</button></td>

<td>
<select onchange="updateStatus('${id}',this.value)">
<option value="pending" ${count===0?'selected':''}>ยังไม่ฉีด</option>
<option value="done" ${count>0?'selected':''}>ฉีดแล้ว</option>
</select>
</td>

</tr>
`;
    }

   document.getElementById("followTable").innerHTML = html;

// 🔥 สลับกราฟ
if(followChart) followChart.destroy();

let labels = [];
let datasets = [];
let type = "bar";

// 🍩 โดนัท %
if(chartMode === "percent"){

  type = "doughnut";

  let total = done + notdone || 1;

  const donePercent = ((done/total)*100).toFixed(1);
  const notdonePercent = ((notdone/total)*100).toFixed(1);

  labels = ['ฉีดแล้ว','ยังไม่ฉีด'];

  datasets = [{
    data:[donePercent, notdonePercent],
     backgroundColor: [
        "rgba(0, 255, 153, 0.6)",
        "rgba(253, 0, 0, 0.64)",
        
      ],

      
      borderWidth: 3
    }]
  followChart = new Chart(document.getElementById("followChart"),{
    type: type,
    data:{ labels, datasets },
    options:{
      responsive:true,
      cutout:'55%', // 🔥 วงหนาสวย
      plugins:{
        legend:{position:'bottom'},

        // 🔥 ใส่ % กลางวง
        tooltip:{
          callbacks:{
            label:(ctx)=> ctx.label + " : " + ctx.raw + "%"
          }
        }
      }
    },
    plugins:[{
      id:'centerText',
      beforeDraw(chart){
        const {ctx, chartArea:{width, height}} = chart;
        ctx.save();

        ctx.font = "bold 20px sans-serif";
        ctx.fillStyle = "#374151";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(donePercent + "%", width/2, height/2);

        ctx.restore();
      }
    }]
  });
}

// 📊 แท่งรายหมู่
else{

  type = "bar";

  let vLabels = Object.keys(villageMap);

  // 🔥 จัดการ "ไม่ระบุ" ไปท้าย
  vLabels = vLabels.sort((a,b)=>{
    if(a==="ไม่ระบุ") return 1;
    if(b==="ไม่ระบุ") return -1;
    return a - b;
  });

  labels = vLabels;

  const doneData = vLabels.map(v=>villageMap[v].done);
  const notdoneData = vLabels.map(v=>villageMap[v].notdone);

  const totalData = vLabels.map(v=> 
    villageMap[v].done + villageMap[v].notdone
  );

  datasets = [
    {
      label:'ฉีดแล้ว',
      data: doneData,
      backgroundColor:'#86fe629f',
      borderRadius:8
    },
    {
      label:'ยังไม่ฉีด',
      data: notdoneData,
      backgroundColor:'#ef4444',
      borderRadius:8
    }
  ];

  followChart = new Chart(document.getElementById("followChart"),{
    type: type,
    data:{ labels, datasets },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'top'},
        tooltip:{
          callbacks:{
            afterLabel:(ctx)=>{
              const i = ctx.dataIndex;
              return "รวม: " + totalData[i] + " คน";
            }
          }
        }
      },
      scales:{
        y:{
          beginAtZero:true,
          ticks:{precision:0}
        }
      }
    }
  });

}

  });


const isMobile = window.innerWidth < 768;

// =========================
// 🍩 โดนัท
// =========================
if(chartMode === "percent"){

  type = "doughnut";

  let total = done + notdone || 1;

  const donePercent = ((done/total)*100).toFixed(1);
  const notdonePercent = ((notdone/total)*100).toFixed(1);

  labels = ['ฉีดแล้ว','ยังไม่ฉีด'];

  datasets = [{
    data:[donePercent, notdonePercent],
    backgroundColor:['#22c55e','#ef4444'],
    borderWidth:0
  }];

  followChart = new Chart(document.getElementById("followChart"),{
    type,
    data:{ labels, datasets },

    options:{
  responsive:true,
  maintainAspectRatio:false,
  cutout: isMobile ? '65%' : '70%',

  plugins:{
    legend:{
      position: isMobile ? 'bottom' : 'right',
      labels:{
        boxWidth:12,
        font:{size: isMobile ? 10 : 13}
      }
    },
    tooltip:{
      callbacks:{
        label:(ctx)=> ctx.label + " : " + ctx.raw + "%"
      }
    }
  }

    },

    plugins:[{
      id:'centerText',
      beforeDraw(chart){
        const {ctx, chartArea:{width, height}} = chart;

        ctx.save();
        ctx.font = isMobile ? "bold 14px sans-serif" : "bold 20px sans-serif";
        ctx.fillStyle = "#374151";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(donePercent + "%", width/2, height/2);
        ctx.restore();
      }
    }]
  });
}

// =========================
// 📊 แท่ง
// =========================
else{

  type = "bar";

  let vLabels = Object.keys(villageMap);

  vLabels = vLabels.sort((a,b)=>{
    if(a==="ไม่ระบุ") return 1;
    if(b==="ไม่ระบุ") return -1;
    return a - b;
  });

  labels = vLabels;

  const doneData = vLabels.map(v=>villageMap[v].done);
  const notdoneData = vLabels.map(v=>villageMap[v].notdone);

  const totalData = vLabels.map(v=> 
    villageMap[v].done + villageMap[v].notdone
  );

  datasets = [
    {
      label:'ฉีดแล้ว',
      data: doneData,
      backgroundColor:'#5fd189',
      borderRadius:8
    },
    {
      label:'ยังไม่ฉีด',
      data: notdoneData,
      backgroundColor:'#f75454b6',
      borderRadius:8
    }
  ];

  followChart = new Chart(document.getElementById("followChart"),{
    type,
    data:{ labels, datasets },

    options:{
      responsive:true,
      maintainAspectRatio:false,

      plugins:{
        legend:{
          position:'top',
          labels:{
            font:{size: isMobile ? 10 : 13}
          }
        },
        tooltip:{
          callbacks:{
            afterLabel:(ctx)=>{
              const i = ctx.dataIndex;
              return "รวม: " + totalData[i] + " คน";
            }
          }
        }
      },

      scales:{
  x:{
    ticks:{
      font:{size: isMobile ? 9 : 12},
      maxRotation: isMobile ? 45 : 0
    }
  },
  y:{
    beginAtZero:true,
    ticks:{
      precision:0,
      font:{size: isMobile ? 10 : 12}
    }
  }
}
    }
  });
}
}
function setMode(mode){
  chartMode = mode;
  loadFollow();
}

// =========================
// 💉 เปิด Modal วัคซีน
// =========================
let currentId = "";

function openVaccineModal(id){
  currentId = id;

  db.ref("children/"+id).once("value", snap=>{
    const data = snap.val() || {};
    const current = data.vaccines || {};

    let html = "";

    vaccineList.forEach(v=>{

      const checked = current[v] ? "checked" : "";
      const dateVal = current[v] || "";

      html += `
        <div class="vaccine-item d-flex align-items-center gap-2 mb-2">

          <!-- ✅ เพิ่ม value -->
          <input type="checkbox"
            value="${v}"
            onchange="toggleDateInline(this,'${v}')"
            ${checked}>

          <label style="width:80px;">${v}</label>

          <input type="date"
            id="date-${v}"
            value="${dateVal}"
            class="form-control form-control-sm"
            style="max-width:140px; ${checked ? '' : 'display:none;'}">

        </div>
      `;
    });

    document.getElementById("vaccineEditor").innerHTML = html;

    new bootstrap.Modal(document.getElementById("vaccineModal")).show();
  });
}



function toggleDateInline(cb, name){
  const input = document.getElementById("date-"+name);

  if(cb.checked){
    input.style.display = "block";
  }else{
    input.style.display = "none";
    input.value = ""; // ล้างค่า
  }
}

// =========================
// 💾 บันทึกวัคซีน
// =========================
function saveVaccines(){

  let vaccines = {};

  document.querySelectorAll("#vaccineEditor .vaccine-item").forEach(item=>{

    const cb = item.querySelector("input[type=checkbox]");
    const name = cb.value; // ✅ ตอนนี้จะมีค่าแล้ว
    const date = item.querySelector("input[type=date]").value;

    if(cb.checked && date){
      vaccines[name] = date;
    }

  });

  db.ref("children/"+currentId+"/vaccines").set(vaccines);

  alert("บันทึกแล้ว ✅");

  loadFollow();

  bootstrap.Modal.getInstance(document.getElementById("vaccineModal")).hide();
}

// =========================
// 🔄 เปลี่ยนสถานะ
// =========================
function updateStatus(id,status){
  if(status === "pending"){
    db.ref("children/"+id+"/vaccines").remove();
    loadFollow();
  }else{
    openVaccineModal(id);
  }
}

// =========================
// 📝 autosave
// =========================
function autoSave(id, field, value){
  db.ref("children/"+id).update({
    [field]: value,
    updatedAt: new Date().toLocaleString("th-TH")
  });
}

// =========================
// ➕ เพิ่มข้อมูล
// =========================
function addChildFull(){

  let id = Date.now();

  // 🔥 วัคซีน
  let vaccines = {};
  document.querySelectorAll(".vaccine-box input:checked")
  .forEach(cb=>{
    vaccines[cb.value] = true;
  });

  // 🔥 ดึงค่าฟอร์ม
  const hn = document.getElementById("hn").value || "";
  const cid = document.getElementById("cid").value || "";
  const name = document.getElementById("name").value || "";
  const tambon = document.getElementById("tambon").value || "";
  const hospital = document.getElementById("hospital").value || "";
  const house = document.getElementById("house").value || "";
  const birth = document.getElementById("birth").value || "";
  const note = document.getElementById("note").value || "";
  

  // 🔥 village (กันพัง)
  const villageEl = document.getElementById("village");
 const village = document.getElementById("village")?.value || "";

  // 🔥 soi (เฉพาะโกลก)
  const soiEl = document.getElementById("soi");
  const soi = soiEl ? soiEl.value : "";

  // 🔥 validate
  if(!name || !cid){
    alert("กรุณากรอกชื่อและเลขบัตรประชาชน");
    return;
  }

  // 🔥 save
  db.ref("children/"+id).set({
    hn,
    cid,
    name,
    tambon,
    hospital,
    house,
    village,
    soi, 
    birth,
    note,
    vaccines,
    updatedAt: new Date().toLocaleString("th-TH")
  });

  alert("บันทึกแล้ว ✅");

  loadFollow();

  // 🔥 reset form
  document.getElementById("hn").value = "";
  document.getElementById("cid").value = "";
  document.getElementById("name").value = "";
  document.getElementById("house").value = "";
  document.getElementById("birth").value = "";
  document.getElementById("note").value = "";

  if(villageEl) villageEl.value = "";
  if(soiEl) soiEl.value = "";

  document.querySelectorAll(".vaccine-box input")
  .forEach(cb=>cb.checked=false);
}
document.getElementById("tambon").addEventListener("change", function(){

  const tambon = this.value;

  // 🔥 โหลด dropdown หมู่
  document.getElementById("villageBox").innerHTML =
    buildVillageDropdown(tambon, "", "");

  // 🔥 โกลก → แสดงซอย
  if(tambon === "kolok"){
    document.getElementById("soiBox").style.display = "block";
  }else{
    document.getElementById("soiBox").style.display = "none";
  }
});
function buildVillageDropdown(tambon, selected, id){

  // 🔥 ถ้าใช้ในฟอร์ม (id ว่าง)
  const selectId = id ? "" : 'id="village"';

  // 🏙 โกลก → ชุมชน
  if(tambon === "kolok"){

    let data = kolokCommunity;

    return `
      <select class="form-select" ${selectId}>
        <option value="">-- เลือกชุมชน --</option>
        ${Object.keys(data).map(v=>{
          return `
            <option value="${v}">
              ${data[v].name}
            </option>
          `;
        }).join("")}
      </select>
    `;
  }

  // 🏡 ตำบลอื่น → หมู่
  let data = villageData[tambon] || {};

  return `
    <select class="form-select" ${selectId}>
      <option value="">-- เลือกหมู่ --</option>
      ${Object.keys(data).map(v=>{
        let d = data[v];
        return `
          <option value="${v}">
            หมู่ ${v} - ${d.name}
          </option>
        `;
      }).join("")}
    </select>
  `;
}






// =========================
// 🗑 ลบ
// =========================
function deleteChild(id){
  if(confirm("ลบข้อมูลนี้?")){
    db.ref("children/"+id).remove();
  }
}



// =========================
// logout
// =========================
function logout(){
  localStorage.removeItem("user");
  localStorage.removeItem("name"); 
  location.href="login.html";
}


// =========================
// importExcel
// =========================
// 🔥 map วัคซีน
const vaccineMap = {
  "041":"BCG",
  "D21":"DTP1",
  "D22":"DTP2",
  "D23":"DTP3",
  "081":"MMR1",
  "082":"MMR2",
  "061":"JE1",
  "062":"JE2",
  "R21":"OPV1",
  "R22":"OPV2",
  "R23":"OPV3"
};

// 🔥 แปลง JSON → vaccines
function convertHDCtoVaccines(text){

  let vaccines = {};

  if(!text) return vaccines;

  text = text.replace(/<br>/g,'');
  const parts = text.split("},");

  parts.forEach(p=>{
    try{
      if(!p.endsWith("}")) p += "}";
      const obj = JSON.parse(p);

      let name = vaccineMap[obj.VACCINTYPE];
      if(name){
        vaccines[name] = obj.DATE_SERV;
      }

    }catch(e){}
  });

  return vaccines;
}


// 🔥 IMPORT EXCEL
function importExcel(){

  const file = document.getElementById("fileInput").files[0];
  if(!file){
    alert("กรุณาเลือกไฟล์");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){

    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, {type:'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, {header:1});

    let countSave = 0;

    rows.forEach(r=>{

      if(!r || r.length < 2) return;

      let hn="", cid="", name="", tambon="", house="", village="", birth="", note="";
      let hospital = "";
      let vaccines = {};

      r.forEach(cell=>{

        let val = (cell+"").trim();
        if(!val) return;

        // 🔹 CID
        if(/^\d{13}$/.test(val)){
          cid = val;
          return;
        }

        // 🔹 HN
        if(/^\d{4,6}$/.test(val) && !hn){
          hn = val;
        }

        // 🔥 hospital code (10168,10170)
        if(/^\d{5}$/.test(val)){
          hospital = val;
        }

        // 🔥 วันเกิด
        let d = val.replace(/-/g,'/');
        if(/\d{1,2}\/\d{1,2}\/\d{4}/.test(d)){
          birth = d;
          return;
        }

        // 🔥 บ้าน
        if(/\d+\/\d+/.test(val)){
          house = val;
          return;
        }
        else if(/^\d{2,4}$/.test(val) && !house){
          house = val;
        }

        // 🔥 หมู่
        if(/^\d{1,2}$/.test(val) && !val.includes("/") && !village){
          village = val.padStart(2,'0');
          return;
        }

        // 🔹 ชื่อ
        if(val.includes("ด.ช") || val.includes("ด.ญ")){
          name = val;
        }

        // 🔹 หมายเหตุ
        if(val.includes("ปฏิเสธ") || val.includes("ย้าย") || val.includes("ป่วย")){
          note = val;
        }

        // 🔹 ตำบล
        let t = val.replace(/\s/g,'');
        if(t.includes("โก-ลก")) tambon = "kolok";
        else if(t.includes("มูโนะ")) tambon = "munoh";
        else if(t.includes("ปูโยะ")) tambon = "puyoh";
        else if(t.includes("ปาเสมัส")) tambon = "pasemas";

        // 🔥 วัคซีนจาก JSON
        if(typeof cell === "string" && cell.includes("VACCINTYPE")){
          vaccines = {
            ...vaccines,
            ...convertHDCtoVaccines(cell)
          };
        }

      });

      // 🔥 ลบ **** ออกจากชื่อ
      name = name.replace(/\*+/g,"");

      // 🔥 กันข้อมูลขยะ
      if(!name || !cid){
        return;
      }

      // 🔥 fallback HN
      if(!hn){
        hn = Date.now() + Math.floor(Math.random()*1000);
      }

      // 🔥 map hospital → tambon
      if(!tambon){
        if(hospital === "10168") tambon = "pasemas";
        else if(hospital === "10170") tambon = "puyoh";
        else if(hospital === "10169") tambon = "munoh";
        else if(hospital === "77729" || hospital === "77728") tambon = "kolok";
        else tambon = "kolok";
      }

      // 🔥 format หมู่
      if(village){
        village = parseInt(village).toString();
      }

      // 🔥 save ลง Firebase
      db.ref("children").push({
        hn,
        cid,
        name,
        tambon,
        hospital,
        house,
        village,
        birth,
        note,
        vaccines,
        updatedAt: new Date().toLocaleString("th-TH")
      });

      countSave++;

    });

    alert("นำเข้าแล้ว " + countSave + " รายการ ✅");

    loadFollow();
  };

  reader.readAsArrayBuffer(file);
}




function getValueSmart(row, keywords){

  for(let key in row){

    let clean = key
      .replace(/\s/g,'')
      .replace(/-/g,'')
      .toLowerCase();

    for(let k of keywords){

      let target = k
        .replace(/\s/g,'')
        .replace(/-/g,'')
        .toLowerCase();

      if(clean === target){
        return row[key];
      }
    }
  }

  return "";
}
function cleanRow(row){
  let newRow = {};
  for(let key in row){
    let k = key.replace(/\s/g,'').replace(/-/g,'');
    newRow[k] = row[key];
  }
  return newRow;
}




// =========================
// loadDashboard
// =========================


let selectedTambon = "all";
let barChart, donutChart;


// 🔥 กดปุ่มตำบล
document.querySelectorAll(".tambon-btn").forEach(btn=>{
  btn.onclick = () => {
    selectedTambon = tambonMap[btn.innerText] || "all";
    loadDashboard();
  }
});

function loadDashboard(){

  db.ref("children").on("value", snap=>{

    const data = snap.val() || {};

    let total=0, done=0, notdone=0;

    let q1=0, q2=0, q3=0, q4=0;

    for(let id in data){
      let c = data[id];

      // 🔥 filter ตำบล
      if(selectedTambon !== "all" && c.tambon !== selectedTambon) continue;

      total++;

      const hasVaccine = c.vaccines && Object.keys(c.vaccines).length > 0;

      if(hasVaccine) done++;
      else notdone++;

      // 🔥 ไตรมาส
      if(c.quarter == "1") q1++;
      if(c.quarter == "2") q2++;
      if(c.quarter == "3") q3++;
      if(c.quarter == "4") q4++;
    }

    // KPI
    document.getElementById("total").innerText = total;
    document.getElementById("done").innerText = done;
    document.getElementById("notdone").innerText = notdone;
    document.getElementById("percent").innerText =
      total ? Math.round(done/total*100) + "%" : "0%";

    // 🍩 DONUT
    if(!donutChart){
      donutChart = new Chart(document.getElementById("donutChart"),{
        type:'doughnut',
        data:{
          labels:['ฉีดแล้ว','ยังไม่ฉีด'],
          datasets:[{
            data:[done,notdone],
            backgroundColor:[
              'rgba(34,197,94,0.5)',
              'rgba(239,68,68,0.5)'
            ],
            borderColor:[
              '#22c55e',
              '#ef4444'
            ],
            borderWidth:2
          }]
        },
        options:{
          plugins:{legend:{position:'bottom'}}
        }
      });
    }else{
      donutChart.data.datasets[0].data=[done,notdone];
      donutChart.update();
    }

    // 📊 BAR (ไตรมาส)
    if(!barChart){
      barChart = new Chart(document.getElementById("barChart"),{
        type:'bar',
        data:{
          labels:['Q1','Q2','Q3','Q4'],
          datasets:[{
            label:'จำนวนเด็ก',
            data:[q1,q2,q3,q4],
            backgroundColor:[
              'rgba(59,130,246,0.4)',
              'rgba(16,185,129,0.4)',
              'rgba(245,158,11,0.4)',
              'rgba(239,68,68,0.4)'
            ],
            borderColor:[
              '#3b82f6',
              '#10b981',
              '#f59e0b',
              '#ef4444'
            ],
            borderWidth:2,
            borderRadius:8
          }]
        },
        options:{
          plugins:{legend:{display:false}}
        }
      });
    }else{
      barChart.data.datasets[0].data=[q1,q2,q3,q4];
      barChart.update();
    }

  });
}

// 🔥 โหลดครั้งแรก
loadDashboard();



function formatVillage(tambon, village){

  if(!village) return "-";

  // 👉 ถ้าเป็นตัวเลข เช่น 01, 02
  if(!isNaN(village)){
    return "หมู่ " + parseInt(village);
  }

  // 👉 ถ้าเป็นโกลก (ชุมชน)
  if(tambon === "kolok"){
    return village; // เช่น กูโบร์
  }

  return village;
}

function updateVillage(id, value){

  // แปลงกลับเป็นเลข
  let v = value.replace("หมู่ ","");

  db.ref("children/" + id).update({
    village: v,
    updatedAt: new Date().toLocaleString("th-TH")
  });

}

function reloadRealtime(){
  db.ref("children").off();
  loadFollow();
}


function buildVillageDropdown(tambon, selected, id){

  // 🏙 กรณีเทศบาล
if(tambon === "kolok"){

  let data = kolokCommunity;

  return `
    <select id="village" class="form-select"
      onchange="autoSave('${id}','village',this.value)">

      <option value="">-- เลือกชุมชน --</option>

      ${Object.keys(data).map(v=>{
        return `
          <option value="${v}" ${v==selected?"selected":""}>
            ${data[v].name}
          </option>
        `;
      }).join("")}

    </select>
  `;
}

  let data = villageData[tambon] || {};

  let html = `<select class="form-select"
    onchange="autoSave('${id}','village',this.value)">`;

  html += `<option value="">-- เลือกหมู่ --</option>`;

  html += Object.keys(data).map(v=>{
    let d = data[v];

    return `
      <option value="${v}" ${v==selected?"selected":""}>
        หมู่ ${v} - ${d.name}
      </option>
    `;
  }).join("");

  html += `</select>`;

  return html;
}
function changeTambon(el){

  let tr = el.closest("tr");
  let id = tr.getAttribute("data-id");

  let newTambon = el.value;

  db.ref("children/"+id).update({
    tambon: newTambon,
    village: "", // reset หมู่
    updatedAt: new Date().toLocaleString("th-TH")
  });

  loadFollow(); // รีเฟรช dropdown หมู่ทันที
}

const villageData = {

  pasemas: {
    "1": { name:"บ้านซรายอ", leader:"ฮารีมคาน" },
    "2": { name:"บ้านตือระ", leader:"นาซูฮา" },
    "3": { name:"บ้านปาเสมัส", leader:"ณรงค์" },
    "4": { name:"บ้านน้ำตก", leader:"มาฮาโซ" },
    "5": { name:"บ้านกวาลอซีรา", leader:"มะรอดี" },
    "6": { name:"บ้านซรายอออก", leader:"ปฏิวัติ" },
    "7": { name:"บ้านกูแบอีแก", leader:"อัสมี" },
    "8": { name:"บ้านศาลาใหม่", leader:"รุสวา" },
   
  },

  munoh: {
    "1": { name:"บ้านมูโนะ", leader:"สาลีมี" },
    "2": { name:"บ้านลูโบะลือซง", leader:"นาทวี" },
    "3": { name:"บ้านปาดังยอ", leader:"มุสตอปา" },
    "4": { name:"บ้านปูโปะ", leader:"ประเสริฐ" },
    "5": { name:"บ้านบูเก๊ะ", leader:"อามาซะ" }
  },

  puyoh: {
    "1": { name:"บ้านลาแล", leader:"เฉลิมพล" },
    "2": { name:"บ้านปูโยะ", leader:"อาหามะ" },
    "3": { name:"บ้านฆอแย", leader:"ไซมี" },
    "4": { name:"บ้านน้ำตก", leader:"นรวีร์" },
    "5": { name:"บ้านตอออ", leader:"สมนึก" },
    "6": { name:"บ้านกูยิ", leader:"มะยูนุ" }
  }

};
const kolokCommunity = {
  "1": { name:"ชุมชนกูโบร์" },
  "2": { name:"ชุมชนโต๊ะลือเบ" },
  "3": { name:"ชุมชนตันหยงมะลิ" },
  "4": { name:"ชุมชนโก-ลกวิลเลจ" },
  "5": { name:"ชุมชนบือเร็ง" },
  "6": { name:"ชุมชนกือดำบำรู" },
  "7": { name:"ชุมชนกือบงกำแม" },
  "8": { name:"ชุมชนหัวสะพาน" },
  "9": { name:"ชุมชนเสาสัญญาณ" },
  "10": { name:"ชุมชนดงงูเห่า" },
  "11": { name:"ชุมชนหลังด่าน" },
  "12": { name:"ชุมชนมัสยิดกลาง" },
  "13": { name:"ชุมชนจือแลตูลี" },
  "14": { name:"ชุมชนสันติสุข" },
  "15": { name:"ชุมชนปาโงปิเมง" },
  "16": { name:"ชุมชนปาโงเปาะเล็ง" },
  "17": { name:"ชุมชนโปฮงยามู" },
  "18": { name:"ชุมชนอริศรา" },
  "19": { name:"ชุมชนเจริญสุข" },
  "20": { name:"ชุมชนหัวกุญแจ" },
  "21": { name:"ชุมชนสวนมะพร้าว" },
  "22": { name:"ชุมชนท่ากอไผ่" },
  "23": { name:"ชุมชนท่าประปา" },
  "24": { name:"ชุมชนท่าโรงเลื่อย" },
  "25": { name:"ชุมชนหลังล้อแม็ก" },
  "26": { name:"ชุมชนศรีอามาน" },
  "27": { name:"ชุมชนทรายทอง" },
  "28": { name:"ชุมชนบือเร็งใน" },
  "29": { name:"ชุมชนซรีจาฮายา" },
  "30": { name:"ชุมชนเจริญทรัพย์" },
  "31": { name:"ชุมชนเจริญเขต" }
};

function autoSaveVillage(id, value){

  db.ref("children/"+id).update({
    village: value,
    updatedAt: new Date().toLocaleString("th-TH")
  });

}


function loadvaccineChart(){

  console.log("🔥 vaccine chart working");

  db.ref("children").on("value", snapshot => {

    const data = snapshot.val();
    console.log("DATA:", data);

    if(!data || Object.keys(data).length === 0){
      console.log("ไม่มีข้อมูล");
      return;
    }

    let total = Object.keys(data).length;

    let vaccines = {
      BCG:0, HBV1:0, HBV2:0, HBV3:0,
      DTP1:0, DTP2:0, DTP3:0, DTP4:0,
      OPV1:0, OPV2:0, OPV3:0, OPV4:0,
      IPV:0,
      MMR1:0, MMR2:0,
      JE1:0, JE2:0,
      dT:0, HPV:0
    };

    for(let id in data){
      let c = data[id];

      for(let v in vaccines){
        if(c.vaccines && c.vaccines[v]){
          vaccines[v]++;
        }
      }
    }

    let labels = [];
    let values = [];

    for(let v in vaccines){
      labels.push(v);
      values.push((vaccines[v]/total)*100);
    }

    const ctx = document.getElementById("vaccineChart");
    if(!ctx){
      console.log("ไม่เจอ canvas");
      return;
    }

    if(window.vaccineChart && typeof window.vaccineChart.destroy === "function"){
      window.vaccineChart.destroy();
    }

    window.vaccineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "% การฉีดวัคซีน",
          data: values,
          tension: 0.4,
          borderColor: "#4CAF50"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // 🔥 ตัวนี้สำคัญ
        scales:{
          y:{
            beginAtZero:true,
            max:100
          }
        }
      }
    });

  });
}

function toggleSidebar(){
  const sb = document.getElementById("sidebar");
  const bg = document.getElementById("backdrop");

  if(window.innerWidth < 768){
    sb.classList.toggle("show");
    bg.classList.toggle("show");
  }else{
    sb.classList.toggle("hide");
  }
}


function openMap(tambon, house, village){

  const tambonTH = getTambonName(tambon);

  let address = `บ้านเลขที่ ${house} หมู่ ${village} ตำบล ${tambonTH} อำเภอสุไหงโก-ลก จังหวัดนราธิวาส`;

  let url = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(address);

  window.open(url, "_blank");
}

function getTambonName(t){
  const map = {
    all: "ทั้งหมด",
    kolok: "สุไหงโก-ลก",
    munoh: "มูโนะ",
    puyoh: "ปูโยะ",
    pasemas: "ปาเสมัส"
  };
  return map[t] || t || "-";
}


function calculateAge(birth){

  if(!birth) return "-";

  const [d,m,y] = birth.split("/");
  const birthDate = new Date(y-543, m-1, d);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if(months < 0){
    years--;
    months += 12;
  }

  return years > 0 
    ? `${years} ปี ${months} เดือน`
    : `${months} เดือน`;
}


function getAgeBadge(birth){

  if(!birth) return `<span class="age-badge">-</span>`;

  const [d,m,y] = birth.split("/");
  const birthDate = new Date(y-543, m-1, d);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if(months < 0){
    years--;
    months += 12;
  }

  let text = years > 0 
    ? `${years} ปี ${months} เดือน`
    : `${months} เดือน`;

  let colorClass = "";

  if(years < 1){
    colorClass = "age-green";
  }
  else if(years < 3){
    colorClass = "age-yellow";
  }
  else if(years < 5){
    colorClass = "age-orange";
  }
  else{
    colorClass = "age-red";
  }

  return `<span class="age-badge ${colorClass}">${text}</span>`;
}


function openCareByTambon(){

  const tambon = document.getElementById("tambonFilter")?.value || "kolok";

  db.ref("villageCare/"+tambon).once("value", snap=>{

    const data = snap.val() || {};

    let html = "";

    Object.keys(data).forEach(v=>{

      const group = data[v];

      html += `
        <div style="
          border:1px solid #eee;
          border-radius:14px;
          padding:12px;
          margin-bottom:12px;
          background:#fafafa;
        ">

          <div style="
            font-weight:600;
            margin-bottom:6px;
            color:#374151;
          ">
            🏡 หมู่ ${v}
          </div>

          ${group.care.map(c=>`
          <div style="
            display:flex;
            justify-content:space-between;
            padding:6px 0;
            border-bottom:1px solid #eee;
          ">
            <div>
              👤 ${c.name}<br>
              <small style="color:#6b7280;">${c.role || "-"}</small>
            </div>

            <a href="tel:${c.tel}" style="color:#16a34a;">
              📞 ${c.tel}
            </a>
          </div>

          `).join("")}

        </div>
      `;
    });

    if(!html){
      html = "❌ ไม่มีข้อมูลผู้ดูแลในตำบลนี้";
    }

    document.getElementById("careTitle").innerText =
      "👥 ผู้ดูแล - " + getTambonName(tambon);

    document.getElementById("careBody").innerHTML = html;

    new bootstrap.Modal(document.getElementById("careModal")).show();
  });

}

db.ref("villageCare").set({


  // 🟢 ปูโยะ
  puyoh:{
    1:{care:[{name:"นายเฉลิมพล อำพันธ์",tel:"0807047038",role:"ผู้ใหญ่บ้าน"}]},
    2:{care:[{name:"นายอาหามะ อูเซ็ง",tel:"0892947402",role:"กำนัน / ผู้ใหญ่บ้าน"}]},
    3:{care:[{name:"นายไซมี มะ",tel:"0810842978",role:"ผู้ใหญ่บ้าน"}]},
    4:{care:[{name:"นายนรวีร์ เจ๊ะเมาะ",tel:"0808466067",role:"ผู้ใหญ่บ้าน"}]},
    5:{care:[{name:"นายสมนึก แดงดี",tel:"0872951817",role:"ผู้ใหญ่บ้าน"}]},
    6:{care:[{name:"นายมะยูนุ มะเย็ง",tel:"0849971802",role:"ผู้ใหญ่บ้าน"}]}
  },

  // 🔵 มูโนะ
  munoh:{
    1:{care:[{name:"นายสาลีมี สาและ",tel:"0894620868",role:"ผู้ใหญ่บ้าน"}]},
    2:{care:[{name:"นายนาทวี ตันเหมนายู",tel:"0894646467",role:"ผู้ใหญ่บ้าน"}]},
    3:{care:[{name:"นายมุสตอปา อาบะ",tel:"0850770975",role:"ผู้ใหญ่บ้าน"}]},
    4:{care:[{name:"ร.ต.ประเสริฐ อาแว",tel:"0873999709",role:"กำนัน / ผู้ใหญ่บ้าน"}]},
    5:{care:[{name:"นายอามาซะ สามะ",tel:"0806303427",role:"ผู้ใหญ่บ้าน"}]}
  },

  // 🟡 ปาเสมัส
  pasemas:{
    1:{care:[{name:"นายฮารีมคาน โอระสะมันนี",tel:"0817677605",role:"ผู้ใหญ่บ้าน"}]},
    2:{care:[{name:"นายนาซูฮา หะยีอาแว",tel:"0850787676",role:"ผู้ใหญ่บ้าน"}]},
    3:{care:[{name:"นายณรงค์ อาแวสือแม",tel:"0629988149",role:"ผู้ใหญ่บ้าน"}]},
    4:{care:[{name:"นายมาฮาโซ มือเยาะ",tel:"0801382240",role:"ผู้ใหญ่บ้าน"}]},
    5:{care:[{name:"นายมะรอดี บินสะมะแอ",tel:"0896594425",role:"ผู้ใหญ่บ้าน"}]},
    6:{care:[{name:"นายปฏิวัติ เด่นอร่ามคาน",tel:"0813686863",role:"กำนัน / ผู้ใหญ่บ้าน"}]},
    7:{care:[{name:"นายอัสมี เจ๊ะอาแว",tel:"0824159376",role:"ผู้ใหญ่บ้าน"}]},
    8:{care:[{name:"นายรุสวา ดอเลาะ",tel:"0649500655",role:"ผู้ใหญ่บ้าน"}]}
  },

  // 🔴 สุไหงโก-ลก (ชุมชน)
  kolok:{
    community:{
      care:[
        {name:"น.ส.สุมิตร อูมา",tel:"0993633100",role:"ผู้นำชุมชน"},
        {name:"น.ส.สะปีน๊ะ มะแซ",tel:"0869695313",role:"ผู้นำชุมชน"},
        {name:"นางละมัย การุโณ",tel:"0827038733",role:"ผู้นำชุมชน"},
        {name:"นางวิลาวัลย์ คชกาล",tel:"0831682610",role:"ผู้นำชุมชน"},
        {name:"นายธงชัย บือราเฮง",tel:"0634853736",role:"ผู้นำชุมชน"},
        {name:"นายวราวุธ มาหามะ",tel:"0634245389",role:"ผู้นำชุมชน"},
        {name:"นายสาเหะ มาหะมะ",tel:"0897378241",role:"ผู้นำชุมชน"},
        {name:"น.ส.โนรีซา มะแซ",tel:"0814394057",role:"ผู้นำชุมชน"},
        {name:"นายอาเดอร์นันต์ เบ็ญสนิ",tel:"0813059321",role:"ผู้นำชุมชน"},
        {name:"นายบุญภาค สุขโร",tel:"0902100194",role:"ผู้นำชุมชน"},
        {name:"น.ส.สุกัญญา จันทร์มุณี",tel:"0994739179",role:"ผู้นำชุมชน"},
        {name:"นายสุฮายมิง อารง",tel:"0869640838",role:"ผู้นำชุมชน"},
        {name:"นายวัชริศ เจ๊ะเลาะ",tel:"0815433221",role:"ผู้นำชุมชน"},
        {name:"นายธรรมมูญ ขุนนุ้ย",tel:"0894684098",role:"ผู้นำชุมชน"},
        {name:"นายมุสเล็ม ซามะ",tel:"0622482484",role:"ผู้นำชุมชน"},
        {name:"นางสารีป๊ะ ยะโก๊ะ",tel:"0827313077",role:"ผู้นำชุมชน"},
        {name:"นายอัสมิง สะแม",tel:"0873924515",role:"ผู้นำชุมชน"},
        {name:"นางอัญชลี ยะโลมพันธ์",tel:"0880693892",role:"ผู้นำชุมชน"},
        {name:"นายประทิว แก้วคง",tel:"0923595039",role:"ผู้นำชุมชน"},
        {name:"นายอาแว แวหะมะ",tel:"0894641319",role:"ผู้นำชุมชน"}
      ]
    }
  }

});


function getAgeBadge(birth){

  if(!birth) return `<span class="badge bg-secondary">-</span>`;

  let parts = birth.split("/");

  if(parts.length !== 3){
    return `<span class="badge bg-secondary">-</span>`;
  }

  let d = parseInt(parts[0]);
  let m = parseInt(parts[1]) - 1;
  let y = parseInt(parts[2]) - 543; // พ.ศ → ค.ศ

  let birthDate = new Date(y, m, d);
  let today = new Date();

  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());

  if(months < 0) months = 0;

  let years = Math.floor(months / 12);
  let remainMonths = months % 12;

  let text = years > 0 
    ? `${years} ปี ${remainMonths} ด.` 
    : `${months} ด.`;

  // // 🎨 สีตามช่วงอายุ
  let color = "bg-success";

  if(months <= 6) color = "bg-info";
  else if(months <= 12) color = "bg-primary";
  else if(months <= 24) color = "bg-warning";
  else color = "bg-secondary";

  return `<span class="badge ${color}">${text}</span>`;
}

function getAgeMonths(birth){

  if(!birth) return 0;

  let birthDate;

  if(birth.includes("-")){
    birthDate = new Date(birth);
  }else if(birth.includes("/")){
    let [d,m,y] = birth.split("/");
    y = parseInt(y) > 2500 ? y - 543 : y;
    birthDate = new Date(y, m-1, d);
  }

  if(!birthDate || isNaN(birthDate)) return 0;

  let today = new Date();

  return (
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth())
  );

}
 console.log("birth:", c.birth, "age:", age);
