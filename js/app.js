const SUPABASE_URL="https://zncxrnsljkuixvrbizfk.supabase.co",
        SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuY3hybnNsamt1aXh2cmJpemZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNzE5NjAsImV4cCI6MjEwNzk0Nzk2MH0.U5TlySOU6xyxDVXR8NlMW-Ec_bQNftiw8cF7moGT8s8";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const PROGRAMS=["Umum (GIPSUM)","ProPaJaYa","Bakso Keramat","Jundullah"];
const REK={no:"73-802-53-067",an:"Azkiyatus Sholihah",wa:"6285785813755",waTampil:"0857-8581-3755"};
const $=id=>document.getElementById(id);
const rp=n=>"Rp"+(+n||0).toLocaleString("id-ID");
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fd=t=>t?new Date(t).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):"-";
const opts=a=>a.map(p=>`<option>${p}</option>`).join("");
(function(){
 const pg=location.pathname.split("/").pop()||"index.html";
 const L=[["index.html","Beranda"],["daftar.html","Daftar Donatur"],["bayar.html","Pembayaran"],["transparansi.html","Transparansi"]];
 const n=document.createElement("nav");
 n.innerHTML=`<b>GIPSUM · BASMAS UKKI PENS</b><div>${L.map(([h,t])=>`<a href="${h}" class="${pg==h?"on":""}">${t}</a>`).join("")}</div>`;
 const w=document.querySelector(".w");w.insertBefore(n,w.firstChild);
 const f=document.createElement("footer");f.className="sm";
 f.innerHTML=`© 2026 BASMAS UKKI PENS · Medokan Semampir, Surabaya<br><a href="admin.html" class="muted-link">Admin</a> · <a href="#" id="th" class="muted-link">Ganti tema</a>`;
 w.appendChild(f);
 $("th").onclick=e=>{e.preventDefault();const r=document.documentElement;const d=r.dataset.theme?r.dataset.theme=="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=d?"light":"dark"};
})();
async function loadPublic(){
 const a=await sb.from("donors_public").select("*").order("created_at",{ascending:false});
 const b=await sb.from("expenses").select("*").order("tanggal",{ascending:false});
 const DN=a.data||[],EX=b.data||[],ok=DN.filter(d=>d.status=="verified");
 const tin=ok.reduce((s,d)=>s+d.nominal,0),tout=EX.reduce((s,e)=>s+e.jumlah,0);
 return {DN,EX,ok,tin,tout,err:a.error||b.error};
}
