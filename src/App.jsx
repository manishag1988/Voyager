import { useState, useEffect, useCallback } from "react";
import { getTrialStatus, validateLicenseKey, saveLicenseLocally, deactivateApp, getSavedLicense } from "./lib/licensing";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id:"flights",    label:"Flights",       icon:"✈️",  color:"#4F8EF7" },
  { id:"hotel",      label:"Hotel",         icon:"🏨",  color:"#9B59B6" },
  { id:"food",       label:"Food & Dining", icon:"🍜",  color:"#E67E22" },
  { id:"transport",  label:"Transport",     icon:"🚌",  color:"#27AE60" },
  { id:"activities", label:"Activities",    icon:"🎡",  color:"#E74C3C" },
  { id:"shopping",   label:"Shopping",      icon:"🛍️", color:"#F39C12" },
  { id:"health",     label:"Health",        icon:"💊",  color:"#1ABC9C" },
  { id:"other",      label:"Other",         icon:"📌",  color:"#95A5A6" },
];

const CURRENCIES    = ["INR ₹","USD $","EUR €","GBP £","JPY ¥","AED د.إ","SGD S$","AUD A$","THB ฿","MYR RM","IDR Rp","VND ₫"];
const PAYMENT_MODES = ["Cash","UPI","Card","Net Banking","Wallet","Other"];
const STATUSES = [
  { id:"unpaid",  label:"Unpaid",  color:"#E74C3C" },
  { id:"partial", label:"Partial", color:"#F39C12" },
  { id:"paid",    label:"Paid",    color:"#2ECC71" },
];

const PACKING_CATS = [
  { id:"documents",   label:"Documents",   icon:"🪪" },
  { id:"clothing",    label:"Clothing",    icon:"👕" },
  { id:"toiletries",  label:"Toiletries",  icon:"🧴" },
  { id:"electronics", label:"Electronics", icon:"🔌" },
  { id:"medicines",   label:"Medicines",   icon:"💊" },
  { id:"accessories", label:"Accessories", icon:"🎒" },
  { id:"misc",        label:"Misc",        icon:"📦" },
];

const PACKING_PRESETS = {
  documents:   ["Passport","Visa copy","Flight tickets","Hotel booking","Travel insurance","ID card","Emergency contacts printout"],
  clothing:    ["T-shirts","Trousers/Jeans","Underwear","Socks","Sleepwear","Formal outfit","Jacket/Sweater","Swimwear","Walking shoes","Sandals"],
  toiletries:  ["Toothbrush & paste","Shampoo","Soap/Body wash","Deodorant","Sunscreen","Moisturiser","Razor","Hairbrush"],
  electronics: ["Phone charger","Power bank","Universal adapter","Earphones","Camera","Laptop","Laptop charger","Memory card"],
  medicines:   ["Prescription medicines","Paracetamol","Antacids","ORS packets","Band-aids","Antiseptic cream","Anti-allergy tablets","Motion sickness tablets"],
  accessories: ["Sunglasses","Cap/Hat","Umbrella","Daypack","Water bottle","Neck pillow","Eye mask","Luggage locks"],
  misc:        ["Cash (local currency)","Snacks","Books/Kindle","Notebook & pen","Reusable bags","Laundry bag"],
};

const DOC_TYPES = [
  { id:"passport",  label:"Passport",        icon:"🛂" },
  { id:"visa",      label:"Visa",            icon:"📋" },
  { id:"flight",    label:"Flight Ticket",   icon:"✈️" },
  { id:"hotel",     label:"Hotel Booking",   icon:"🏨" },
  { id:"insurance", label:"Travel Insurance",icon:"🛡️" },
  { id:"id",        label:"National ID",     icon:"🪪" },
  { id:"transport", label:"Transport Pass",  icon:"🚌" },
  { id:"other",     label:"Other",           icon:"📄" },
];

const EMERGENCY_PRESETS = {
  "India":     { police:"100", ambulance:"108", fire:"101", tourist:"1363" },
  "USA":       { police:"911", ambulance:"911", fire:"911", tourist:"" },
  "UK":        { police:"999", ambulance:"999", fire:"999", tourist:"" },
  "UAE":       { police:"999", ambulance:"998", fire:"997", tourist:"600522223" },
  "Japan":     { police:"110", ambulance:"119", fire:"119", tourist:"050-3816-2787" },
  "Thailand":  { police:"191", ambulance:"1669",fire:"199", tourist:"1672" },
  "France":    { police:"17",  ambulance:"15",  fire:"18",  tourist:"" },
  "Singapore": { police:"999", ambulance:"995", fire:"995", tourist:"1800-736-2000" },
  "Australia": { police:"000", ambulance:"000", fire:"000", tourist:"" },
  "Malaysia":  { police:"999", ambulance:"999", fire:"994", tourist:"1800-88-5050" },
  "Indonesia": { police:"110", ambulance:"118", fire:"113", tourist:"" },
};

const EVENT_TYPES = [
  { id:"flight",    label:"Flight",       icon:"✈️" },
  { id:"hotel",     label:"Check-in/out", icon:"🏨" },
  { id:"activity",  label:"Activity",     icon:"🎡" },
  { id:"food",      label:"Meal",         icon:"🍜" },
  { id:"transport", label:"Transport",    icon:"🚌" },
  { id:"note",      label:"Note",         icon:"📝" },
];

const TABS = [
  { id:"itinerary", label:"Itinerary", icon:"📋" },
  { id:"budget",    label:"Budget",    icon:"💰" },
  { id:"packing",   label:"Packing",   icon:"🎒" },
  { id:"docs",      label:"Docs",      icon:"🗂️" },
  { id:"tools",     label:"Tools",     icon:"🛠️" },
  { id:"settings",  label:"Settings",  icon:"⚙️" },
];

const RATE_FALLBACK = {
  INR:1, USD:0.012, EUR:0.011, GBP:0.0094,
  JPY:1.78, AED:0.044, SGD:0.016, AUD:0.018,
  THB:0.44, MYR:0.056, IDR:191, VND:303,
};

const CURRENCY_CODES = {
  "INR ₹":"INR","USD $":"USD","EUR €":"EUR","GBP £":"GBP",
  "JPY ¥":"JPY","AED د.إ":"AED","SGD S$":"SGD","AUD A$":"AUD",
  "THB ฿":"THB","MYR RM":"MYR","IDR Rp":"IDR","VND ₫":"VND",
};

const WX_CODES = {
  0:"☀️ Clear sky",1:"🌤️ Mostly clear",2:"⛅ Partly cloudy",3:"☁️ Overcast",
  45:"🌫️ Foggy",48:"🌫️ Icy fog",51:"🌦️ Light drizzle",53:"🌧️ Drizzle",55:"🌧️ Heavy drizzle",
  61:"🌧️ Light rain",63:"🌧️ Rain",65:"🌧️ Heavy rain",71:"🌨️ Light snow",73:"🌨️ Snow",
  75:"❄️ Heavy snow",80:"🌦️ Rain showers",81:"🌧️ Heavy showers",95:"⛈️ Thunderstorm",
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
    catch { return def; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

const genId    = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmtDate  = d => d ? new Date(d+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"}) : "";
const fmtMoney = (n, sym) => { const s=(sym||"INR ₹").split(" ")[1]||"₹"; return s+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0}); };

function calcDerived(total, advance) {
  const t=parseFloat(total)||0, a=parseFloat(advance)||0;
  return { total:t, advance:a, remaining:Math.max(0,t-a), status:a<=0?"unpaid":a>=t?"paid":"partial" };
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const S = {
  input:       { background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"9px 12px", color:"#fff", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" },
  btnPrimary:  { background:"#4F8EF7", border:"none", borderRadius:10, padding:"9px 18px", color:"#fff", fontWeight:600, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 },
  btnSecondary:{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"9px 14px", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13 },
  btnDanger:   { background:"rgba(231,76,60,0.15)", border:"1px solid rgba(231,76,60,0.3)", color:"#E74C3C", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12 },
  btnGhost:    { background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:14, padding:"4px" },
  card:        { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:"1rem", marginBottom:12 },
};

// ─── Shared Atoms ─────────────────────────────────────────────────────────────

const FieldLabel = ({ children }) => (
  <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:4, textTransform:"uppercase", letterSpacing:0.5 }}>{children}</div>
);

function SummaryCard({ label, value, color, sub, clickable, onClick }) {
  return (
    <div onClick={clickable?onClick:undefined} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 8px", textAlign:"center", cursor:clickable?"pointer":"default" }}>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:3, textTransform:"uppercase", letterSpacing:0.4 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:700, color }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px 10px", textAlign:"center" }}>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:3, textTransform:"uppercase", letterSpacing:0.3 }}>{label}</div>
      <div style={{ fontWeight:700, fontSize:13, color }}>{value}</div>
    </div>
  );
}

function ProgressBar({ value, max, color="#4F8EF7", height=8 }) {
  const pct = max ? Math.min(100,(value/max)*100) : 0;
  return (
    <div style={{ height, background:"rgba(255,255,255,0.09)", borderRadius:height, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:height, transition:"width 0.4s" }} />
    </div>
  );
}

// ─── PWA Install Banner ───────────────────────────────────────────────────────

function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = e => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  if (!visible||!prompt) return null;
  async function install() { prompt.prompt(); const {outcome}=await prompt.userChoice; if(outcome==="accepted") setVisible(false); }
  return (
    <div style={{ position:"fixed", bottom:80, left:12, right:12, zIndex:9999, background:"linear-gradient(135deg,#1a3a4a,#2c5364)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
      <span style={{ fontSize:26 }}>🌍</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:13 }}>Install Voyager</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Add to home screen for offline access</div>
      </div>
      <button onClick={install} style={{ ...S.btnPrimary, padding:"7px 12px", fontSize:12 }}>Install</button>
      <button onClick={()=>setVisible(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:18 }}>✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [tab,         setTab]         = useLocalStorage("ta_tab",      "itinerary");
  const [trips,       setTrips]       = useLocalStorage("ta_trips",    []);
  const [activeTrip,  setActiveTrip]  = useLocalStorage("ta_active",   null);
  const [currency,    setCurrency]    = useLocalStorage("ta_currency", "INR ₹");
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTrip,     setNewTrip]     = useState({ name:"", from:"", to:"", destination:"" });

  const trip = trips.find(t => t.id === activeTrip);

  function createTrip() {
    if (!newTrip.name.trim()) return;
    const t = { id:genId(), ...newTrip, name:newTrip.name.trim(), days:[], expenses:[], packingItems:[], documents:[], travellers:[], emergencyContacts:[] };
    setTrips(prev => [...prev, t]);
    setActiveTrip(t.id);
    setNewTrip({ name:"", from:"", to:"", destination:"" });
    setShowNewTrip(false);
  }

  function deleteTrip(id) {
    setTrips(prev => prev.filter(t => t.id !== id));
    setActiveTrip(trips.filter(t => t.id !== id)[0]?.id || null);
  }

  function updateTrip(patch) {
    setTrips(prev => prev.map(t => t.id === activeTrip ? { ...t, ...patch } : t));
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0f2027 0%,#203a43 55%,#2c5364 100%)", color:"#fff" }}>

      {/* ── Header ── */}
      <header style={{ position:"sticky", top:0, zIndex:100, background:"rgba(15,32,39,0.88)", backdropFilter:"blur(14px)", borderBottom:"1px solid rgba(255,255,255,0.09)", padding:"0 1rem" }}>
        <div style={{ maxWidth:840, margin:"0 auto", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:24 }}>🌍</span>
            <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.5px" }}>Voyager</span>
          </div>
          <select value={currency} onChange={e=>setCurrency(e.target.value)} style={{ ...S.input, width:"auto", padding:"4px 8px", fontSize:12 }}>
            {CURRENCIES.map(c=><option key={c} value={c} style={{color:"#000"}}>{c}</option>)}
          </select>
        </div>
      </header>

      <main style={{ maxWidth:840, margin:"0 auto", padding:"1rem 1rem 6rem" }}>

        {/* ── Trip chips ── */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
          {trips.map(t => (
            <button key={t.id} onClick={()=>setActiveTrip(t.id)} style={{ padding:"5px 14px", borderRadius:20, fontSize:13, cursor:"pointer", border:"1px solid rgba(255,255,255,0.2)", background:activeTrip===t.id?"#4F8EF7":"rgba(255,255,255,0.07)", color:"#fff", fontWeight:activeTrip===t.id?700:400 }}>{t.name}</button>
          ))}
          <button onClick={()=>setShowNewTrip(true)} style={{ padding:"5px 14px", borderRadius:20, border:"1px dashed rgba(255,255,255,0.3)", background:"transparent", color:"rgba(255,255,255,0.5)", fontSize:13, cursor:"pointer" }}>+ New Trip</button>
        </div>

        {/* ── New trip form ── */}
        {showNewTrip && (
          <div style={S.card}>
            <div style={{ fontWeight:700, marginBottom:12, fontSize:15 }}>✈️ Create New Trip</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div style={{ gridColumn:"1/-1" }}><FieldLabel>Trip Name *</FieldLabel>
                <input placeholder="e.g. Goa Trip 2025" value={newTrip.name} onChange={e=>setNewTrip(p=>({...p,name:e.target.value}))} style={S.input} /></div>
              <div><FieldLabel>Destination</FieldLabel>
                <input placeholder="e.g. Tokyo, Japan" value={newTrip.destination} onChange={e=>setNewTrip(p=>({...p,destination:e.target.value}))} style={S.input} /></div>
              <div />
              <div><FieldLabel>Start Date</FieldLabel>
                <input type="date" value={newTrip.from} onChange={e=>setNewTrip(p=>({...p,from:e.target.value}))} style={{ ...S.input, colorScheme:"dark" }} /></div>
              <div><FieldLabel>End Date</FieldLabel>
                <input type="date" value={newTrip.to} onChange={e=>setNewTrip(p=>({...p,to:e.target.value}))} style={{ ...S.input, colorScheme:"dark" }} /></div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={createTrip} style={{ ...S.btnPrimary, flex:1 }}>Create Trip</button>
              <button onClick={()=>setShowNewTrip(false)} style={{ ...S.btnSecondary, flex:1, textAlign:"center" }}>Cancel</button>
            </div>
          </div>
        )}

        {!trip && !showNewTrip && (
          <div style={{ textAlign:"center", padding:"5rem 1rem", color:"rgba(255,255,255,0.35)" }}>
            <div style={{ fontSize:56, marginBottom:14 }}>🗺️</div>
            <div style={{ fontSize:18, fontWeight:700, color:"rgba(255,255,255,0.65)", marginBottom:8 }}>No trip selected</div>
            <div style={{ fontSize:14 }}>Create a new trip to start planning</div>
          </div>
        )}

        {trip && (
          <>
            {/* ── Trip header ── */}
            <div style={{ ...S.card, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontWeight:800, fontSize:20 }}>{trip.name}</div>
                {trip.destination && <div style={{ fontSize:13, color:"#4F8EF7", marginTop:2 }}>📍 {trip.destination}</div>}
                {(trip.from||trip.to) && <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{trip.from&&fmtDate(trip.from)}{trip.to&&` → ${fmtDate(trip.to)}`}</div>}
              </div>
              <button onClick={()=>deleteTrip(trip.id)} style={S.btnDanger}>🗑 Delete</button>
            </div>

            {/* ── Tab bar ── */}
            <div style={{ display:"flex", gap:2, marginBottom:16, overflowX:"auto", background:"rgba(255,255,255,0.05)", borderRadius:13, padding:4 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:"0 0 auto", padding:"8px 12px", borderRadius:10, border:"none", background:tab===t.id?"#4F8EF7":"transparent", color:tab===t.id?"#fff":"rgba(255,255,255,0.45)", fontWeight:tab===t.id?700:400, cursor:"pointer", fontSize:13, whiteSpace:"nowrap", transition:"all 0.18s" }}>{t.icon} {t.label}</button>
              ))}
            </div>

            {tab==="itinerary" && <ItineraryTab trip={trip} updateTrip={updateTrip} />}
            {tab==="budget"    && <BudgetTab    trip={trip} updateTrip={updateTrip} currency={currency} />}
            {tab==="packing"   && <PackingTab   trip={trip} updateTrip={updateTrip} />}
            {tab==="docs"      && <DocsTab      trip={trip} updateTrip={updateTrip} />}
            {tab==="tools"     && <ToolsTab     trip={trip} updateTrip={updateTrip} currency={currency} />}
            {tab==="settings"  && <SettingsTab />}
          </>
        )}
      </main>
      <InstallBanner />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ITINERARY TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ItineraryTab({ trip, updateTrip }) {
  const [showAddDay,  setShowAddDay]  = useState(false);
  const [newDate,     setNewDate]     = useState("");
  const [newTitle,    setNewTitle]    = useState("");
  const [expandedDay, setExpandedDay] = useState(null);
  const [editEventId, setEditEventId] = useState(null);

  const days = [...(trip.days||[])].sort((a,b)=>a.date<b.date?-1:1);

  function addDay() {
    if (!newDate) return;
    const day = { id:genId(), date:newDate, title:newTitle||`Day ${days.length+1}`, events:[] };
    updateTrip({ days:[...(trip.days||[]), day] });
    setNewDate(""); setNewTitle(""); setShowAddDay(false); setExpandedDay(day.id);
  }

  function removeDay(id) { updateTrip({ days:(trip.days||[]).filter(d=>d.id!==id) }); }

  function addEvent(dayId, ev) {
    updateTrip({ days:(trip.days||[]).map(d=>d.id===dayId?{...d,events:[...(d.events||[]),{id:genId(),...ev}]}:d) });
  }

  function removeEvent(dayId, evId) {
    updateTrip({ days:(trip.days||[]).map(d=>d.id===dayId?{...d,events:(d.events||[]).filter(e=>e.id!==evId)}:d) });
  }

  function updateEvent(dayId, evId, patch) {
    updateTrip({ days:(trip.days||[]).map(d=>d.id===dayId?{...d,events:(d.events||[]).map(e=>e.id===evId?{...e,...patch}:e)}:d) });
    setEditEventId(null);
  }

  return (
    <div>
      {!showAddDay ? (
        <button onClick={()=>setShowAddDay(true)} style={{ width:"100%", padding:"11px", marginBottom:12, border:"1px dashed rgba(255,255,255,0.22)", borderRadius:12, background:"transparent", color:"rgba(255,255,255,0.45)", cursor:"pointer", fontSize:14 }}>+ Add Day</button>
      ) : (
        <div style={S.card}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
            <div style={{ flex:"0 0 150px" }}><FieldLabel>Date *</FieldLabel>
              <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{ ...S.input, colorScheme:"dark" }} /></div>
            <div style={{ flex:1, minWidth:120 }}><FieldLabel>Day Label</FieldLabel>
              <input placeholder={`Day ${days.length+1}`} value={newTitle} onChange={e=>setNewTitle(e.target.value)} style={S.input} /></div>
            <button onClick={addDay}                     style={{ ...S.btnPrimary, padding:"9px 16px" }}>Add</button>
            <button onClick={()=>setShowAddDay(false)}   style={{ ...S.btnSecondary, padding:"9px 12px" }}>✕</button>
          </div>
        </div>
      )}
      {days.length===0 && <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40 }}>📅</div><div style={{ marginTop:8 }}>No days yet — add your first day above!</div></div>}
      {days.map(day => (
        <DayCard key={day.id} day={day}
          expanded={expandedDay===day.id}
          onToggle={()=>setExpandedDay(expandedDay===day.id?null:day.id)}
          onRemoveDay={()=>removeDay(day.id)}
          onAddEvent={ev=>addEvent(day.id,ev)}
          onRemoveEvent={evId=>removeEvent(day.id,evId)}
          onUpdateEvent={(evId,patch)=>updateEvent(day.id,evId,patch)}
          editEventId={editEventId} setEditEventId={setEditEventId}
        />
      ))}
    </div>
  );
}

function DayCard({ day, expanded, onToggle, onRemoveDay, onAddEvent, onRemoveEvent, onUpdateEvent, editEventId, setEditEventId }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:"activity", time:"", title:"", location:"", notes:"" });
  const events = [...(day.events||[])].sort((a,b)=>(a.time||"")<(b.time||"")?-1:1);
  const dt = new Date(day.date+"T00:00:00");

  function submit() {
    if (!form.title.trim()) return;
    onAddEvent(form);
    setForm({ type:"activity", time:"", title:"", location:"", notes:"" }); setShowForm(false);
  }

  return (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, marginBottom:10, overflow:"hidden" }}>
      <div onClick={onToggle} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", cursor:"pointer" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:11, flexShrink:0, background:"linear-gradient(135deg,#4F8EF7,#7B5EA7)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:14, fontWeight:800, lineHeight:1 }}>{dt.getDate()}</div>
            <div style={{ fontSize:9, opacity:0.85 }}>{dt.toLocaleString("en",{month:"short"}).toUpperCase()}</div>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{day.title}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:1 }}>{fmtDate(day.date)} · {events.length} event{events.length!==1?"s":""}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={e=>{e.stopPropagation();onRemoveDay();}} style={S.btnDanger}>✕</button>
          <span style={{ color:"rgba(255,255,255,0.35)", fontSize:16 }}>{expanded?"▲":"▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 14px 14px" }}>
          {events.map((ev,i) => {
            const et = EVENT_TYPES.find(t=>t.id===ev.type)||EVENT_TYPES[2];
            return (
              <div key={ev.id} style={{ display:"flex", gap:12, marginBottom:10, position:"relative" }}>
                {i<events.length-1 && <div style={{ position:"absolute", left:20, top:44, bottom:-10, width:2, background:"rgba(255,255,255,0.07)" }} />}
                <div style={{ width:42, height:42, borderRadius:10, flexShrink:0, zIndex:1, background:"rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19 }}>{et.icon}</div>
                <div style={{ flex:1, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"8px 12px" }}>
                  {editEventId===ev.id ? (
                    <EditEventForm ev={ev} onSave={patch=>onUpdateEvent(ev.id,patch)} onCancel={()=>setEditEventId(null)} />
                  ) : (
                    <>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <div>
                          <span style={{ fontWeight:600, fontSize:14 }}>{ev.title}</span>
                          {ev.time && <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginLeft:8 }}>🕐 {ev.time}</span>}
                        </div>
                        <div style={{ display:"flex", gap:4 }}>
                          <button onClick={()=>setEditEventId(ev.id)} style={S.btnGhost}>✏️</button>
                          <button onClick={()=>onRemoveEvent(ev.id)}  style={S.btnGhost}>🗑</button>
                        </div>
                      </div>
                      {ev.location && <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:3 }}>📍 {ev.location}</div>}
                      {ev.notes    && <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{ev.notes}</div>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {showForm ? (
            <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:12, padding:12, marginTop:4 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                <div><FieldLabel>Type</FieldLabel>
                  <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={S.input}>
                    {EVENT_TYPES.map(t=><option key={t.id} value={t.id} style={{color:"#000"}}>{t.icon} {t.label}</option>)}
                  </select></div>
                <div><FieldLabel>Time</FieldLabel>
                  <input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={S.input} /></div>
                <div style={{ gridColumn:"1/-1" }}><FieldLabel>Title *</FieldLabel>
                  <input placeholder="e.g. Check-in Taj Hotel" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={S.input} /></div>
                <div style={{ gridColumn:"1/-1" }}><FieldLabel>Location</FieldLabel>
                  <input placeholder="Address / venue" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} style={S.input} /></div>
                <div style={{ gridColumn:"1/-1" }}><FieldLabel>Notes</FieldLabel>
                  <input placeholder="Optional notes…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={S.input} /></div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={submit}                   style={{ ...S.btnPrimary, flex:1 }}>Add Event</button>
                <button onClick={()=>setShowForm(false)}  style={{ ...S.btnSecondary, flex:1, textAlign:"center" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={()=>setShowForm(true)} style={{ width:"100%", padding:"9px", marginTop:4, border:"1px dashed rgba(255,255,255,0.18)", borderRadius:10, background:"transparent", color:"rgba(255,255,255,0.38)", cursor:"pointer", fontSize:13 }}>+ Add Event</button>
          )}
        </div>
      )}
    </div>
  );
}

function EditEventForm({ ev, onSave, onCancel }) {
  const [form, setForm] = useState({ type:ev.type, time:ev.time||"", title:ev.title, location:ev.location||"", notes:ev.notes||"" });
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:6 }}>
        <div><FieldLabel>Type</FieldLabel>
          <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{ ...S.input, fontSize:12, padding:"6px 8px" }}>
            {EVENT_TYPES.map(t=><option key={t.id} value={t.id} style={{color:"#000"}}>{t.icon} {t.label}</option>)}
          </select></div>
        <div><FieldLabel>Time</FieldLabel>
          <input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={{ ...S.input, fontSize:12, padding:"6px 8px" }} /></div>
        <div style={{ gridColumn:"1/-1" }}><FieldLabel>Title</FieldLabel>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{ ...S.input, fontSize:12, padding:"6px 8px" }} /></div>
        <div style={{ gridColumn:"1/-1" }}><FieldLabel>Location</FieldLabel>
          <input value={form.location} placeholder="Location" onChange={e=>setForm(f=>({...f,location:e.target.value}))} style={{ ...S.input, fontSize:12, padding:"6px 8px" }} /></div>
        <div style={{ gridColumn:"1/-1" }}><FieldLabel>Notes</FieldLabel>
          <input value={form.notes} placeholder="Notes" onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ ...S.input, fontSize:12, padding:"6px 8px" }} /></div>
      </div>
      <div style={{ display:"flex", gap:6 }}>
        <button onClick={()=>onSave(form)}  style={{ ...S.btnPrimary, padding:"6px 12px", fontSize:12 }}>Save</button>
        <button onClick={onCancel}          style={{ ...S.btnSecondary, padding:"6px 12px", fontSize:12 }}>Cancel</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET TAB
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_EXP = { date:"", category:"food", note:"", totalAmount:"", advanceAmount:"", paymentMode:"Cash", paidBy:"" };

function BudgetTab({ trip, updateTrip, currency }) {
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(EMPTY_EXP);
  const [filterDate,   setFilterDate]   = useState("all");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [budgetInput,  setBudgetInput]  = useState(trip.budget||"");
  const [editBudget,   setEditBudget]   = useState(false);
  const [expandedExp,  setExpandedExp]  = useState(null);
  const [editingExp,   setEditingExp]   = useState(null);
  const [showSplit,    setShowSplit]     = useState(false);

  const expenses   = trip.expenses||[];
  const travellers = trip.travellers||[];

  const totalSpent   = expenses.reduce((s,e)=>s+(e.totalAmount||e.amount||0),0);
  const totalAdvance = expenses.reduce((s,e)=>s+(e.advanceAmount||0),0);
  const totalDue     = expenses.reduce((s,e)=>s+(e.remainingAmount||0),0);
  const budgetVal    = trip.budget||0;
  const budgetLeft   = budgetVal-totalSpent;
  const pct          = budgetVal ? Math.min(100,(totalSpent/budgetVal)*100) : 0;
  const advPct       = budgetVal ? Math.min(100,(totalAdvance/budgetVal)*100) : 0;

  const catTotals = {};
  expenses.forEach(e=>{ catTotals[e.category]=(catTotals[e.category]||0)+(e.totalAmount||e.amount||0); });

  function addExpense() {
    if (!form.totalAmount||isNaN(form.totalAmount)) return;
    const d = calcDerived(form.totalAmount, form.advanceAmount);
    updateTrip({ expenses:[...expenses,{ id:genId(), date:form.date, category:form.category, note:form.note, paymentMode:form.paymentMode, paidBy:form.paidBy, totalAmount:d.total, advanceAmount:d.advance, remainingAmount:d.remaining, status:d.status }] });
    setForm({ ...EMPTY_EXP, date:form.date, category:form.category });
    setShowForm(false);
  }

  function saveEdit(id, patch) {
    const d = calcDerived(patch.totalAmount, patch.advanceAmount);
    updateTrip({ expenses:expenses.map(e=>e.id===id?{...e,...patch,totalAmount:d.total,advanceAmount:d.advance,remainingAmount:d.remaining,status:d.status}:e) });
    setEditingExp(null);
  }

  function removeExpense(id) { updateTrip({ expenses:expenses.filter(e=>e.id!==id) }); }
  function saveBudget()      { updateTrip({ budget:parseFloat(budgetInput)||0 }); setEditBudget(false); }

  const splitSummary = (() => {
    if (!travellers.length) return [];
    const paid={}, owes={};
    travellers.forEach(t=>{ paid[t]=0; owes[t]=0; });
    expenses.forEach(e=>{
      if(e.paidBy&&paid[e.paidBy]!==undefined) paid[e.paidBy]+=(e.totalAmount||0);
      const share=(e.totalAmount||0)/travellers.length;
      travellers.forEach(t=>{ owes[t]+=share; });
    });
    return travellers.map(t=>({ name:t, paid:paid[t]||0, owes:owes[t]||0, net:(paid[t]||0)-(owes[t]||0) }));
  })();

  const filtered = expenses.filter(e=>
    (filterDate==="all"||e.date===filterDate)&&(filterCat==="all"||e.category===filterCat)&&(filterStatus==="all"||e.status===filterStatus)
  );
  const dateGroups={};
  [...filtered].sort((a,b)=>(b.date||"")<(a.date||"")?-1:1).forEach(e=>{ const k=e.date||"No Date"; if(!dateGroups[k]) dateGroups[k]=[]; dateGroups[k].push(e); });
  const allDates=[...new Set(expenses.map(e=>e.date).filter(Boolean))].sort().reverse();

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
        <SummaryCard label="Total Cost"   value={fmtMoney(totalSpent,currency)}   color="#4F8EF7" />
        <SummaryCard label="Advance Paid" value={fmtMoney(totalAdvance,currency)} color="#9B59B6" />
        <SummaryCard label="Due"          value={fmtMoney(totalDue,currency)}     color={totalDue>0?"#E74C3C":"#2ECC71"} />
        <SummaryCard label="Trip Budget"  value={budgetVal?fmtMoney(budgetVal,currency):"Set →"} color="#27AE60" clickable onClick={()=>setEditBudget(true)} sub="tap to edit" />
        <SummaryCard label="Budget Left"  value={budgetVal?fmtMoney(Math.abs(budgetLeft),currency):"—"} color={budgetLeft>=0?"#2ECC71":"#E74C3C"} sub={budgetLeft<0?"Over budget":"Available"} />
        <SummaryCard label="Expenses"     value={expenses.length} color="#F39C12" sub={`${expenses.filter(e=>e.status==="paid").length} paid`} />
      </div>

      {editBudget && (
        <div style={{ ...S.card, display:"flex", gap:8, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:140 }}><FieldLabel>Set Trip Budget</FieldLabel>
            <input type="number" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} placeholder="0" style={S.input} /></div>
          <button onClick={saveBudget}               style={{ ...S.btnPrimary,   padding:"9px 16px" }}>Save</button>
          <button onClick={()=>setEditBudget(false)} style={{ ...S.btnSecondary, padding:"9px 12px" }}>✕</button>
        </div>
      )}

      {budgetVal>0 && (
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:5 }}>
            <span>Budget used: {pct.toFixed(1)}%</span>
            <span style={{ color:pct>90?"#E74C3C":pct>70?"#F39C12":"#2ECC71" }}>{pct>100?"Over budget!":pct>70?"Spending high":"On track ✓"}</span>
          </div>
          <div style={{ height:9, background:"rgba(255,255,255,0.09)", borderRadius:8, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", height:"100%", width:`${advPct}%`, background:"#9B59B6", borderRadius:8 }} />
            <div style={{ position:"absolute", height:"100%", width:`${pct}%`, opacity:0.55, background:pct>90?"#E74C3C":pct>70?"#F39C12":"#4F8EF7", borderRadius:8 }} />
          </div>
        </div>
      )}

      <TravellersRow travellers={travellers} updateTrip={updateTrip} />

      {travellers.length>1 && (
        <div style={{ marginBottom:12 }}>
          <button onClick={()=>setShowSplit(!showSplit)} style={{ width:"100%", padding:"9px", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13, textAlign:"left" }}>
            👥 Expense Split Summary {showSplit?"▲":"▼"}
          </button>
          {showSplit && (
            <div style={{ ...S.card, marginTop:8 }}>
              {splitSummary.map(s=>(
                <div key={s.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>Paid {fmtMoney(s.paid,currency)} · Share {fmtMoney(s.owes,currency)}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontWeight:700, fontSize:14, color:s.net>=0?"#2ECC71":"#E74C3C" }}>{s.net>=0?"+":""}{fmtMoney(Math.abs(s.net),currency)}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{s.net>=0?"to receive":"to pay"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {Object.keys(catTotals).length>0 && (
        <div style={{ ...S.card, marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>📊 Spending by Category</div>
          {CATEGORIES.filter(c=>catTotals[c.id]).sort((a,b)=>catTotals[b.id]-catTotals[a.id]).map(cat=>{
            const p=totalSpent?(catTotals[cat.id]/totalSpent*100):0;
            return (
              <div key={cat.id} style={{ marginBottom:9 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:3 }}>
                  <span>{cat.icon} {cat.label}</span>
                  <span style={{ color:cat.color, fontWeight:600 }}>{fmtMoney(catTotals[cat.id],currency)} <span style={{ color:"rgba(255,255,255,0.35)", fontWeight:400 }}>({p.toFixed(0)}%)</span></span>
                </div>
                <ProgressBar value={catTotals[cat.id]} max={totalSpent} color={cat.color} height={5} />
              </div>
            );
          })}
        </div>
      )}

      <button onClick={()=>{ setShowForm(!showForm); setEditingExp(null); }} style={{ ...S.btnPrimary, width:"100%", marginBottom:10 }}>
        {showForm?"✕ Cancel":"+ Add Expense"}
      </button>
      {showForm && <ExpenseForm form={form} setForm={setForm} travellers={travellers} onSubmit={addExpense} onCancel={()=>setShowForm(false)} submitLabel="Add Expense" currency={currency} />}

      {expenses.length>0 && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
          <div><FieldLabel>Date</FieldLabel>
            <select value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{ ...S.input, fontSize:12, padding:"6px 8px" }}>
              <option value="all">All Dates</option>
              {allDates.map(d=><option key={d} value={d} style={{color:"#000"}}>{fmtDate(d)}</option>)}
            </select></div>
          <div><FieldLabel>Category</FieldLabel>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...S.input, fontSize:12, padding:"6px 8px" }}>
              <option value="all">All</option>
              {CATEGORIES.filter(c=>catTotals[c.id]).map(c=><option key={c.id} value={c.id} style={{color:"#000"}}>{c.icon} {c.label}</option>)}
            </select></div>
          <div><FieldLabel>Status</FieldLabel>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...S.input, fontSize:12, padding:"6px 8px" }}>
              <option value="all">All</option>
              {STATUSES.map(s=><option key={s.id} value={s.id} style={{color:"#000"}}>{s.label}</option>)}
            </select></div>
        </div>
      )}

      {Object.keys(dateGroups).length===0 && <div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40 }}>💸</div><div style={{ marginTop:8 }}>No expenses yet — start tracking!</div></div>}

      {Object.keys(dateGroups).map(date=>{
        const dayTotal=dateGroups[date].reduce((s,e)=>s+(e.totalAmount||e.amount||0),0);
        const dayAdv=dateGroups[date].reduce((s,e)=>s+(e.advanceAmount||0),0);
        const dayDue=dateGroups[date].reduce((s,e)=>s+(e.remainingAmount||0),0);
        return (
          <div key={date} style={{ marginBottom:16 }}>
            <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"8px 12px", marginBottom:6, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>📅 {date==="No Date"?"No Date":fmtDate(date)}</div>
              <div style={{ display:"flex", gap:12, fontSize:12 }}>
                <span style={{ color:"#4F8EF7" }}>Total {fmtMoney(dayTotal,currency)}</span>
                <span style={{ color:"#9B59B6" }}>Adv {fmtMoney(dayAdv,currency)}</span>
                {dayDue>0&&<span style={{ color:"#E74C3C" }}>Due {fmtMoney(dayDue,currency)}</span>}
              </div>
            </div>
            {dateGroups[date].map(exp=>{
              const cat=CATEGORIES.find(c=>c.id===exp.category)||CATEGORIES[7];
              const statusObj=STATUSES.find(s=>s.id===exp.status)||STATUSES[0];
              const isExp=expandedExp===exp.id, isEdit=editingExp===exp.id;
              return (
                <div key={exp.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderLeft:`3px solid ${cat.color}`, borderRadius:10, marginBottom:8, overflow:"hidden" }}>
                  <div onClick={()=>!isEdit&&setExpandedExp(isExp?null:exp.id)} style={{ padding:"10px 12px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:22 }}>{cat.icon}</span>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600 }}>{exp.note||cat.label}</div>
                        <div style={{ display:"flex", gap:6, marginTop:3, alignItems:"center" }}>
                          <span style={{ fontSize:10, color:"rgba(255,255,255,0.38)" }}>{cat.label}</span>
                          {exp.paymentMode&&<span style={{ fontSize:10, background:"rgba(255,255,255,0.07)", padding:"1px 6px", borderRadius:4, color:"rgba(255,255,255,0.45)" }}>{exp.paymentMode}</span>}
                          <span style={{ fontSize:10, fontWeight:700, padding:"1px 7px", borderRadius:10, color:statusObj.color, background:`${statusObj.color}22` }}>{statusObj.label}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, fontSize:15, color:cat.color }}>{fmtMoney(exp.totalAmount||exp.amount||0,currency)}</div>
                      {exp.remainingAmount>0&&<div style={{ fontSize:11, color:"#E74C3C" }}>Due {fmtMoney(exp.remainingAmount,currency)}</div>}
                    </div>
                  </div>
                  {isExp&&!isEdit&&(
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 12px", background:"rgba(255,255,255,0.02)" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
                        <MiniStat label="Total"   value={fmtMoney(exp.totalAmount||exp.amount||0,currency)} color="#4F8EF7" />
                        <MiniStat label="Advance" value={fmtMoney(exp.advanceAmount||0,currency)} color="#9B59B6" />
                        <MiniStat label="Due"     value={fmtMoney(exp.remainingAmount||0,currency)} color={exp.remainingAmount>0?"#E74C3C":"#2ECC71"} />
                      </div>
                      {(exp.paidBy||exp.paymentMode)&&<div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>{exp.paidBy&&<span>Paid by <b style={{color:"rgba(255,255,255,0.7)"}}>{exp.paidBy}</b> </span>}{exp.paymentMode&&<span>· Mode <b style={{color:"rgba(255,255,255,0.7)"}}>{exp.paymentMode}</b></span>}</div>}
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>{ setEditingExp(exp.id); setExpandedExp(exp.id); }} style={{ ...S.btnPrimary, padding:"6px 14px", fontSize:12 }}>✏️ Edit</button>
                        <button onClick={()=>removeExpense(exp.id)} style={S.btnDanger}>🗑 Delete</button>
                      </div>
                    </div>
                  )}
                  {isEdit&&(
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"10px 12px" }}>
                      <ExpenseForm travellers={travellers} currency={currency}
                        form={{ date:exp.date, category:exp.category, note:exp.note||"", totalAmount:exp.totalAmount||exp.amount||"", advanceAmount:exp.advanceAmount||"", paymentMode:exp.paymentMode||"Cash", paidBy:exp.paidBy||"" }}
                        setForm={()=>{}} onSubmit={patch=>saveEdit(exp.id,patch)}
                        onCancel={()=>{ setEditingExp(null); setExpandedExp(null); }}
                        submitLabel="Save Changes" isEdit />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TravellersRow({ travellers, updateTrip }) {
  const [adding,setAdding]=useState(false);
  const [name,setName]=useState("");
  function add() { if(!name.trim()||travellers.includes(name.trim())) return; updateTrip({travellers:[...travellers,name.trim()]}); setName(""); setAdding(false); }
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>👥 Travellers (for expense splitting)</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
        {travellers.map(t=>(
          <span key={t} style={{ background:"rgba(79,142,247,0.15)", border:"1px solid rgba(79,142,247,0.3)", color:"#4F8EF7", borderRadius:20, padding:"3px 10px", fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
            {t}
            <button onClick={()=>updateTrip({travellers:travellers.filter(x=>x!==t)})} style={{ background:"none", border:"none", color:"rgba(79,142,247,0.6)", cursor:"pointer", fontSize:11, padding:0 }}>✕</button>
          </span>
        ))}
        {adding ? (
          <div style={{ display:"flex", gap:6 }}>
            <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Name" style={{ ...S.input, width:110, padding:"4px 8px", fontSize:12 }} />
            <button onClick={add}                style={{ ...S.btnPrimary,   padding:"4px 10px", fontSize:12 }}>Add</button>
            <button onClick={()=>setAdding(false)} style={{ ...S.btnSecondary, padding:"4px 8px",  fontSize:12 }}>✕</button>
          </div>
        ) : (
          <button onClick={()=>setAdding(true)} style={{ background:"rgba(255,255,255,0.06)", border:"1px dashed rgba(255,255,255,0.2)", borderRadius:20, padding:"3px 10px", color:"rgba(255,255,255,0.4)", fontSize:12, cursor:"pointer" }}>+ Add</button>
        )}
      </div>
    </div>
  );
}

function ExpenseForm({ form:init, setForm:extSet, onSubmit, onCancel, submitLabel, isEdit, currency, travellers=[] }) {
  const [form,setLocal]=useState(init);
  const d=calcDerived(form.totalAmount,form.advanceAmount);
  const statusObj=STATUSES.find(s=>s.id===d.status)||STATUSES[0];
  const set=isEdit?(u=>setLocal(f=>typeof u==="function"?u(f):u)):(u=>{ const n=typeof u==="function"?u(form):u; setLocal(n); extSet(n); });
  return (
    <div style={{ ...S.card, marginBottom:12 }}>
      <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:"rgba(255,255,255,0.7)" }}>📝 {isEdit?"Edit Expense":"New Expense"}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
        <div><FieldLabel>Date</FieldLabel><input type="date" value={form.date} onChange={e=>set(f=>({...f,date:e.target.value}))} style={{ ...S.input, colorScheme:"dark" }} /></div>
        <div><FieldLabel>Category</FieldLabel><select value={form.category} onChange={e=>set(f=>({...f,category:e.target.value}))} style={S.input}>{CATEGORIES.map(c=><option key={c.id} value={c.id} style={{color:"#000"}}>{c.icon} {c.label}</option>)}</select></div>
      </div>
      <div style={{ marginBottom:8 }}><FieldLabel>Description / Note</FieldLabel>
        <input placeholder="e.g. Hotel Taj – 2 nights…" value={form.note} onChange={e=>set(f=>({...f,note:e.target.value}))} style={S.input} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
        <div><FieldLabel>Total Amount *</FieldLabel><input type="number" placeholder="0" value={form.totalAmount} onChange={e=>set(f=>({...f,totalAmount:e.target.value}))} style={{ ...S.input, borderColor:"rgba(79,142,247,0.5)" }} /></div>
        <div><FieldLabel>Advance Paid</FieldLabel><input type="number" placeholder="0" value={form.advanceAmount} onChange={e=>set(f=>({...f,advanceAmount:e.target.value}))} style={{ ...S.input, borderColor:"rgba(155,89,182,0.5)" }} /></div>
      </div>
      {parseFloat(form.totalAmount)>0&&(
        <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"9px 12px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>Remaining Due = <span style={{ fontWeight:700, fontSize:14, color:d.remaining>0?"#E74C3C":"#2ECC71" }}>{fmtMoney(d.remaining,currency)}</span></div>
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, color:statusObj.color, background:`${statusObj.color}22` }}>{statusObj.label}</span>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
        <div><FieldLabel>Payment Mode</FieldLabel><select value={form.paymentMode} onChange={e=>set(f=>({...f,paymentMode:e.target.value}))} style={S.input}>{PAYMENT_MODES.map(m=><option key={m} value={m} style={{color:"#000"}}>{m}</option>)}</select></div>
        <div><FieldLabel>Paid By</FieldLabel>
          {travellers.length?(
            <select value={form.paidBy} onChange={e=>set(f=>({...f,paidBy:e.target.value}))} style={S.input}>
              <option value="">— select —</option>
              {travellers.map(t=><option key={t} value={t} style={{color:"#000"}}>{t}</option>)}
            </select>
          ):(
            <input placeholder="Name (optional)" value={form.paidBy} onChange={e=>set(f=>({...f,paidBy:e.target.value}))} style={S.input} />
          )}
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={isEdit?()=>onSubmit(form):onSubmit} style={{ ...S.btnPrimary, flex:1 }}>{submitLabel}</button>
        <button onClick={onCancel} style={{ ...S.btnSecondary, flex:1, textAlign:"center" }}>Cancel</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PACKING TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PackingTab({ trip, updateTrip }) {
  const items=[...(trip.packingItems||[])];
  const [adding,setAdding]=useState(false);
  const [form,setForm]=useState({ label:"", category:"misc" });
  const [activeCat,setActiveCat]=useState("all");

  function addItem() { if(!form.label.trim()) return; updateTrip({packingItems:[...items,{id:genId(),label:form.label.trim(),category:form.category,checked:false}]}); setForm(f=>({label:"",category:f.category})); }
  function addPresets(catId) { const ex=new Set(items.map(i=>i.label.toLowerCase())); updateTrip({packingItems:[...items,...(PACKING_PRESETS[catId]||[]).filter(p=>!ex.has(p.toLowerCase())).map(p=>({id:genId(),label:p,category:catId,checked:false}))]}); }
  function toggle(id)       { updateTrip({packingItems:items.map(i=>i.id===id?{...i,checked:!i.checked}:i)}); }
  function removeItem(id)   { updateTrip({packingItems:items.filter(i=>i.id!==id)}); }
  function clearChecked()   { updateTrip({packingItems:items.filter(i=>!i.checked)}); }

  const filtered=activeCat==="all"?items:items.filter(i=>i.category===activeCat);
  const checked=items.filter(i=>i.checked).length;
  const total=items.length;

  return (
    <div>
      <div style={{ ...S.card, marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>🎒 Packing Progress</div>
          <div style={{ fontSize:13, color:"#2ECC71", fontWeight:600 }}>{checked}/{total} packed</div>
        </div>
        <ProgressBar value={checked} max={total||1} color="#2ECC71" height={10} />
        {total>0&&checked===total&&<div style={{ textAlign:"center", marginTop:10, fontSize:13, color:"#2ECC71" }}>🎉 All packed! Ready to go!</div>}
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
        <button onClick={()=>setActiveCat("all")} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", border:"1px solid rgba(255,255,255,0.2)", background:activeCat==="all"?"#4F8EF7":"rgba(255,255,255,0.07)", color:"#fff" }}>All ({total})</button>
        {PACKING_CATS.map(c=>{ const cnt=items.filter(i=>i.category===c.id).length; if(!cnt&&activeCat!==c.id) return null;
          return <button key={c.id} onClick={()=>setActiveCat(c.id)} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", border:"1px solid rgba(255,255,255,0.2)", background:activeCat===c.id?"#4F8EF7":"rgba(255,255,255,0.07)", color:"#fff" }}>{c.icon} {c.label} ({cnt})</button>;
        })}
      </div>

      <div style={{ ...S.card, marginBottom:12 }}>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>📋 Quick-add preset lists:</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {PACKING_CATS.map(c=>(
            <button key={c.id} onClick={()=>addPresets(c.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:12 }}>{c.icon} {c.label}</button>
          ))}
        </div>
      </div>

      {!adding ? (
        <button onClick={()=>setAdding(true)} style={{ width:"100%", padding:"10px", marginBottom:12, border:"1px dashed rgba(255,255,255,0.22)", borderRadius:12, background:"transparent", color:"rgba(255,255,255,0.45)", cursor:"pointer", fontSize:14 }}>+ Add Item</button>
      ) : (
        <div style={{ ...S.card, marginBottom:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:8, marginBottom:8 }}>
            <div><FieldLabel>Item</FieldLabel><input autoFocus placeholder="e.g. Sunscreen SPF 50" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addItem()} style={S.input} /></div>
            <div><FieldLabel>Category</FieldLabel><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={S.input}>{PACKING_CATS.map(c=><option key={c.id} value={c.id} style={{color:"#000"}}>{c.icon} {c.label}</option>)}</select></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addItem}             style={{ ...S.btnPrimary,   flex:1 }}>Add</button>
            <button onClick={()=>setAdding(false)} style={{ ...S.btnSecondary, flex:1, textAlign:"center" }}>Cancel</button>
          </div>
        </div>
      )}

      {PACKING_CATS.map(cat=>{
        const catItems=filtered.filter(i=>i.category===cat.id);
        if(!catItems.length) return null;
        const catDone=catItems.filter(i=>i.checked).length;
        return (
          <div key={cat.id} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ fontSize:13, fontWeight:700 }}>{cat.icon} {cat.label}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{catDone}/{catItems.length}</div>
            </div>
            {catItems.map(item=>(
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, marginBottom:5, opacity:item.checked?0.55:1 }}>
                <button onClick={()=>toggle(item.id)} style={{ width:22, height:22, borderRadius:6, flexShrink:0, cursor:"pointer", border:`2px solid ${item.checked?"#2ECC71":"rgba(255,255,255,0.3)"}`, background:item.checked?"#2ECC71":"transparent", color:"#fff", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>{item.checked?"✓":""}</button>
                <span style={{ flex:1, fontSize:14, textDecoration:item.checked?"line-through":"none" }}>{item.label}</span>
                <button onClick={()=>removeItem(item.id)} style={S.btnGhost}>🗑</button>
              </div>
            ))}
          </div>
        );
      })}

      {filtered.length===0&&<div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40 }}>🎒</div><div style={{ marginTop:8 }}>Use presets or add items manually!</div></div>}
      {items.some(i=>i.checked)&&<button onClick={clearChecked} style={{ ...S.btnDanger, width:"100%", marginTop:8, textAlign:"center" }}>🗑 Remove all checked items</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function DocsTab({ trip, updateTrip }) {
  const docs=[...(trip.documents||[])];
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({ type:"passport", title:"", number:"", expiry:"", issuedBy:"", notes:"" });

  function save() {
    if(!form.title.trim()&&!form.number.trim()) return;
    if(editing) { updateTrip({documents:docs.map(d=>d.id===editing?{...d,...form}:d)}); setEditing(null); }
    else        { updateTrip({documents:[...docs,{id:genId(),...form}]}); }
    setForm({ type:"passport", title:"", number:"", expiry:"", issuedBy:"", notes:"" }); setShowForm(false);
  }

  function startEdit(doc) { setForm({type:doc.type,title:doc.title||"",number:doc.number||"",expiry:doc.expiry||"",issuedBy:doc.issuedBy||"",notes:doc.notes||""}); setEditing(doc.id); setShowForm(true); }
  function remove(id) { updateTrip({documents:docs.filter(d=>d.id!==id)}); }

  return (
    <div>
      <div style={{ ...S.card, marginBottom:12, background:"rgba(231,76,60,0.08)", borderColor:"rgba(231,76,60,0.2)" }}>
        <div style={{ fontSize:12, color:"rgba(255,120,100,0.9)" }}>🔒 All data is stored locally on your device. Never share this screen in public places.</div>
      </div>

      <button onClick={()=>{ setShowForm(!showForm); setEditing(null); setForm({type:"passport",title:"",number:"",expiry:"",issuedBy:"",notes:""}); }} style={{ ...S.btnPrimary, width:"100%", marginBottom:12 }}>
        {showForm&&!editing?"✕ Cancel":"+ Add Document"}
      </button>

      {showForm&&(
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:12, color:"rgba(255,255,255,0.7)" }}>🗂️ {editing?"Edit Document":"New Document"}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <div><FieldLabel>Document Type</FieldLabel><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={S.input}>{DOC_TYPES.map(t=><option key={t.id} value={t.id} style={{color:"#000"}}>{t.icon} {t.label}</option>)}</select></div>
            <div><FieldLabel>Label / Name</FieldLabel><input placeholder="e.g. My Passport" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={S.input} /></div>
            <div><FieldLabel>Number / Reference</FieldLabel><input placeholder="Document number" value={form.number} onChange={e=>setForm(f=>({...f,number:e.target.value}))} style={S.input} /></div>
            <div><FieldLabel>Expiry Date</FieldLabel><input type="date" value={form.expiry} onChange={e=>setForm(f=>({...f,expiry:e.target.value}))} style={{ ...S.input, colorScheme:"dark" }} /></div>
            <div style={{ gridColumn:"1/-1" }}><FieldLabel>Issued By / Airline / Hotel</FieldLabel><input placeholder="e.g. Govt. of India, IndiGo…" value={form.issuedBy} onChange={e=>setForm(f=>({...f,issuedBy:e.target.value}))} style={S.input} /></div>
            <div style={{ gridColumn:"1/-1" }}><FieldLabel>Notes</FieldLabel><textarea placeholder="PNR, confirmation code, booking class…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={{ ...S.input, height:70, resize:"vertical" }} /></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={save} style={{ ...S.btnPrimary, flex:1 }}>{editing?"Save Changes":"Add Document"}</button>
            <button onClick={()=>{ setShowForm(false); setEditing(null); }} style={{ ...S.btnSecondary, flex:1, textAlign:"center" }}>Cancel</button>
          </div>
        </div>
      )}

      {docs.length===0&&!showForm&&<div style={{ textAlign:"center", padding:"3rem", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40 }}>🗂️</div><div style={{ marginTop:8 }}>No documents yet. Add passport, visa, tickets, insurance…</div></div>}

      {DOC_TYPES.map(dt=>{
        const group=docs.filter(d=>d.type===dt.id);
        if(!group.length) return null;
        return (
          <div key={dt.id} style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:6, color:"rgba(255,255,255,0.7)" }}>{dt.icon} {dt.label}</div>
            {group.map(doc=>{
              const expired=doc.expiry&&new Date(doc.expiry)<new Date();
              const soon=doc.expiry&&!expired&&(new Date(doc.expiry)-new Date())<1000*60*60*24*90;
              return (
                <div key={doc.id} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>
                        {doc.title||dt.label}
                        {expired&&<span style={{ marginLeft:8, fontSize:11, color:"#E74C3C", background:"rgba(231,76,60,0.15)", padding:"2px 7px", borderRadius:8 }}>EXPIRED</span>}
                        {soon&&<span style={{ marginLeft:8, fontSize:11, color:"#F39C12", background:"rgba(243,156,18,0.15)", padding:"2px 7px", borderRadius:8 }}>Expiring Soon</span>}
                      </div>
                      {doc.number   &&<div style={{ fontSize:13, fontFamily:"monospace", color:"#4F8EF7", marginBottom:2 }}>#{doc.number}</div>}
                      {doc.issuedBy &&<div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:2 }}>{doc.issuedBy}</div>}
                      {doc.expiry   &&<div style={{ fontSize:12, color:expired?"#E74C3C":soon?"#F39C12":"rgba(255,255,255,0.45)" }}>Expires: {fmtDate(doc.expiry)}</div>}
                      {doc.notes    &&<div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:4, whiteSpace:"pre-wrap" }}>{doc.notes}</div>}
                    </div>
                    <div style={{ display:"flex", gap:6, marginLeft:8 }}>
                      <button onClick={()=>startEdit(doc)} style={S.btnGhost}>✏️</button>
                      <button onClick={()=>remove(doc.id)} style={S.btnGhost}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOLS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function ToolsTab({ trip, updateTrip, currency }) {
  const [activeTool,setActiveTool]=useState("currency");
  const tools=[{id:"currency",icon:"💱",label:"Currency"},{id:"weather",icon:"🌤️",label:"Weather"},{id:"emergency",icon:"🆘",label:"SOS"},{id:"export",icon:"📄",label:"Export"}];
  return (
    <div>
      <div style={{ display:"flex", gap:6, marginBottom:16, background:"rgba(255,255,255,0.04)", borderRadius:12, padding:4 }}>
        {tools.map(t=>(
          <button key={t.id} onClick={()=>setActiveTool(t.id)} style={{ flex:1, padding:"8px 4px", borderRadius:9, border:"none", background:activeTool===t.id?"#4F8EF7":"transparent", color:activeTool===t.id?"#fff":"rgba(255,255,255,0.45)", fontWeight:activeTool===t.id?700:400, cursor:"pointer", fontSize:12 }}>{t.icon}<br/>{t.label}</button>
        ))}
      </div>
      {activeTool==="currency"  && <CurrencyTool  baseCurrency={currency} />}
      {activeTool==="weather"   && <WeatherTool   destination={trip.destination} />}
      {activeTool==="emergency" && <EmergencyTool trip={trip} updateTrip={updateTrip} />}
      {activeTool==="export"    && <ExportTool    trip={trip} currency={currency} />}
    </div>
  );
}

// ── Currency Converter ────────────────────────────────────────────────────────

function CurrencyTool({ baseCurrency }) {
  const [amount,setAmount]=useState("1000");
  const [from,setFrom]=useState(CURRENCY_CODES[baseCurrency]||"INR");
  const [to,setTo]=useState("USD");
  const [rates,setRates]=useState(null);
  const [loading,setLoading]=useState(false);
  const [lastUpd,setLastUpd]=useState(null);
  const [error,setError]=useState(null);

  async function fetchRates() {
    setLoading(true); setError(null);
    try {
      const r=await fetch("https://open.er-api.com/v6/latest/INR");
      const d=await r.json();
      if(d.result==="success"){ setRates(d.rates); setLastUpd(new Date().toLocaleTimeString()); localStorage.setItem("ta_rates",JSON.stringify({rates:d.rates,ts:Date.now()})); }
      else throw new Error();
    } catch {
      try { const c=JSON.parse(localStorage.getItem("ta_rates")||"{}"); if(c.rates){setRates(c.rates);setError("Using cached rates");} else {setRates(RATE_FALLBACK);setError("Using offline rates");} }
      catch { setRates(RATE_FALLBACK); setError("Using offline rates"); }
    }
    setLoading(false);
  }

  useEffect(()=>{
    try { const c=JSON.parse(localStorage.getItem("ta_rates")||"{}"); if(c.rates&&Date.now()-c.ts<3600000){setRates(c.rates);setLastUpd("cached");return;} } catch {}
    fetchRates();
  },[]);

  const convert=(amt,f,t)=>{ if(!rates||!amt) return "—"; const inINR=parseFloat(amt)/(rates[f]||RATE_FALLBACK[f]||1); return (inINR*(rates[t]||RATE_FALLBACK[t]||1)).toLocaleString("en-IN",{maximumFractionDigits:2}); };
  const allCodes=Object.values(CURRENCY_CODES);

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>💱 Currency Converter</div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:8, marginBottom:8 }}>
          <div><FieldLabel>Amount</FieldLabel><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} style={S.input} /></div>
          <div><FieldLabel>From</FieldLabel><select value={from} onChange={e=>setFrom(e.target.value)} style={S.input}>{allCodes.map(c=><option key={c} value={c} style={{color:"#000"}}>{c}</option>)}</select></div>
          <div><FieldLabel>To</FieldLabel><select value={to} onChange={e=>setTo(e.target.value)} style={S.input}>{allCodes.map(c=><option key={c} value={c} style={{color:"#000"}}>{c}</option>)}</select></div>
        </div>
        <div style={{ background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.25)", borderRadius:12, padding:"14px 16px", textAlign:"center", marginBottom:10 }}>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>{amount||0} {from} =</div>
          <div style={{ fontSize:28, fontWeight:800, color:"#4F8EF7" }}>{loading?"…":convert(amount,from,to)} {to}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:4 }}>1 {from} = {convert(1,from,to)} {to}</div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:11, color:error?"#F39C12":"rgba(255,255,255,0.35)" }}>{error||`Updated: ${lastUpd||"—"}`}</div>
          <button onClick={fetchRates} disabled={loading} style={{ ...S.btnSecondary, padding:"5px 10px", fontSize:12 }}>{loading?"…":"↻ Refresh"}</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>📊 Quick Reference (1 INR =)</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {["USD","EUR","GBP","AED","SGD","JPY","THB","MYR"].map(code=>(
            <div key={code} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{code}</span>
              <span style={{ fontWeight:700, fontSize:13, color:"#4F8EF7" }}>{convert(1,"INR",code)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Weather Tool ──────────────────────────────────────────────────────────────

function WeatherTool({ destination }) {
  const [city,setCity]=useState(destination||"");
  const [weather,setWeather]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  async function fetchWeather() {
    if(!city.trim()) return;
    setLoading(true); setError(null); setWeather(null);
    try {
      const g=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const gd=await g.json();
      if(!gd.results?.length) throw new Error(`City "${city}" not found`);
      const {latitude:lat,longitude:lon,name,country}=gd.results[0];
      const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`);
      const wd=await w.json();
      setWeather({...wd,cityName:`${name}, ${country}`});
    } catch(e) { setError(e.message||"Failed to fetch weather"); }
    setLoading(false);
  }

  useEffect(()=>{ if(destination) setCity(destination); },[destination]);

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>🌤️ Weather</div>
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input placeholder="Enter city name…" value={city} onChange={e=>setCity(e.target.value)} onKeyDown={e=>e.key==="Enter"&&fetchWeather()} style={{ ...S.input, flex:1 }} />
          <button onClick={fetchWeather} disabled={loading} style={{ ...S.btnPrimary, padding:"9px 14px", flexShrink:0 }}>{loading?"…":"Search"}</button>
        </div>
        {error&&<div style={{ color:"#E74C3C", fontSize:13 }}>⚠️ {error}</div>}
      </div>
      {weather&&(
        <>
          <div style={{ ...S.card, textAlign:"center" }}>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>📍 {weather.cityName}</div>
            <div style={{ fontSize:52, marginBottom:4 }}>{(WX_CODES[weather.current.weathercode]||"🌡️").split(" ")[0]}</div>
            <div style={{ fontSize:36, fontWeight:800, marginBottom:4 }}>{Math.round(weather.current.temperature_2m)}°C</div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>{(WX_CODES[weather.current.weathercode]||"").split(" ").slice(1).join(" ")}</div>
            <div style={{ display:"flex", justifyContent:"center", gap:20, fontSize:13, color:"rgba(255,255,255,0.5)" }}>
              <span>💧 {weather.current.relative_humidity_2m}%</span>
              <span>🌬️ {Math.round(weather.current.windspeed_10m)} km/h</span>
            </div>
          </div>
          <div style={S.card}>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10 }}>7-Day Forecast</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
              {weather.daily.time.slice(0,7).map((date,i)=>{
                const d=new Date(date);
                return (
                  <div key={date} style={{ textAlign:"center", padding:"8px 4px", background:"rgba(255,255,255,0.04)", borderRadius:10 }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:4 }}>{DAYS[d.getDay()]}</div>
                    <div style={{ fontSize:20, marginBottom:4 }}>{(WX_CODES[weather.daily.weathercode[i]]||"🌡️").split(" ")[0]}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#F39C12" }}>{Math.round(weather.daily.temperature_2m_max[i])}°</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{Math.round(weather.daily.temperature_2m_min[i])}°</div>
                    {weather.daily.precipitation_sum[i]>0&&<div style={{ fontSize:10, color:"#4F8EF7", marginTop:2 }}>{weather.daily.precipitation_sum[i]}mm</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Emergency / SOS ───────────────────────────────────────────────────────────

function EmergencyTool({ trip, updateTrip }) {
  const contacts=trip.emergencyContacts||[];
  const [country,setCountry]=useState(Object.keys(EMERGENCY_PRESETS).find(c=>trip.destination?.toLowerCase().includes(c.toLowerCase()))||"India");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({ name:"", phone:"", relation:"", notes:"" });

  function addContact() { if(!form.name.trim()||!form.phone.trim()) return; updateTrip({emergencyContacts:[...contacts,{id:genId(),...form}]}); setForm({name:"",phone:"",relation:"",notes:""}); setShowForm(false); }
  function remove(id)   { updateTrip({emergencyContacts:contacts.filter(c=>c.id!==id)}); }

  const preset=EMERGENCY_PRESETS[country]||EMERGENCY_PRESETS["India"];
  const nums=[{label:"🚔 Police",num:preset.police},{label:"🚑 Ambulance",num:preset.ambulance},{label:"🚒 Fire",num:preset.fire},...(preset.tourist?[{label:"ℹ️ Tourist Helpline",num:preset.tourist}]:[])];

  return (
    <div>
      <div style={S.card}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>🆘 Local Emergency Numbers</div>
          <select value={country} onChange={e=>setCountry(e.target.value)} style={{ ...S.input, width:"auto", padding:"4px 8px", fontSize:12 }}>
            {Object.keys(EMERGENCY_PRESETS).map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {nums.map(({label,num})=>(
            <div key={label} style={{ background:"rgba(231,76,60,0.1)", border:"1px solid rgba(231,76,60,0.2)", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>{label}</div>
              <a href={`tel:${num}`} style={{ fontSize:22, fontWeight:800, color:"#E74C3C", textDecoration:"none" }}>{num}</a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontWeight:700, fontSize:14, marginBottom:10 }}>📞 Personal Emergency Contacts</div>
      <button onClick={()=>setShowForm(!showForm)} style={{ ...S.btnPrimary, width:"100%", marginBottom:12 }}>{showForm?"✕ Cancel":"+ Add Contact"}</button>

      {showForm&&(
        <div style={S.card}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
            <div><FieldLabel>Name *</FieldLabel><input placeholder="e.g. Mom" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={S.input} /></div>
            <div><FieldLabel>Phone *</FieldLabel><input placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={S.input} /></div>
            <div><FieldLabel>Relation</FieldLabel><input placeholder="Parent, Friend…" value={form.relation} onChange={e=>setForm(f=>({...f,relation:e.target.value}))} style={S.input} /></div>
            <div><FieldLabel>Notes</FieldLabel><input placeholder="e.g. Doctor" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} style={S.input} /></div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addContact}          style={{ ...S.btnPrimary,   flex:1 }}>Add Contact</button>
            <button onClick={()=>setShowForm(false)} style={{ ...S.btnSecondary, flex:1, textAlign:"center" }}>Cancel</button>
          </div>
        </div>
      )}

      {contacts.length===0&&!showForm&&<div style={{ textAlign:"center", padding:"2rem", color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:36 }}>📞</div><div style={{ marginTop:8, fontSize:13 }}>Add contacts to reach in emergencies</div></div>}

      {contacts.map(c=>(
        <div key={c.id} style={{ ...S.card, display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
            {c.relation&&<div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:1 }}>{c.relation}</div>}
            {c.notes&&<div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:1 }}>{c.notes}</div>}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <a href={`tel:${c.phone}`} style={{ background:"rgba(46,204,113,0.15)", border:"1px solid rgba(46,204,113,0.3)", color:"#2ECC71", borderRadius:8, padding:"6px 12px", textDecoration:"none", fontSize:14, fontWeight:700 }}>📞 {c.phone}</a>
            <button onClick={()=>remove(c.id)} style={S.btnGhost}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Export Tool ───────────────────────────────────────────────────────────────

function ExportTool({ trip, currency }) {
  function exportJSON() {
    const blob=new Blob([JSON.stringify(trip,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`${trip.name.replace(/\s+/g,"-")}-voyager.json`; a.click();
  }

  function printSummary() {
    const expenses=trip.expenses||[];
    const totalSpent=expenses.reduce((s,e)=>s+(e.totalAmount||e.amount||0),0);
    const totalAdv=expenses.reduce((s,e)=>s+(e.advanceAmount||0),0);
    const totalDue=expenses.reduce((s,e)=>s+(e.remainingAmount||0),0);
    const catTotals={};
    expenses.forEach(e=>{ catTotals[e.category]=(catTotals[e.category]||0)+(e.totalAmount||e.amount||0); });
    const packed=(trip.packingItems||[]).filter(i=>i.checked).length;
    const totalItems=(trip.packingItems||[]).length;
    const sym=(currency||"INR ₹").split(" ")[1]||"₹";
    const fm=n=>sym+Number(n||0).toLocaleString();

    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Voyager – ${trip.name}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;color:#1a1a2e;padding:32px;max-width:800px;margin:0 auto}h1{font-size:26px;color:#203a43;margin-bottom:4px}h2{font-size:16px;color:#4F8EF7;margin:24px 0 10px;border-bottom:2px solid #4F8EF7;padding-bottom:4px}.meta{font-size:13px;color:#666;margin-bottom:24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}.card{background:#f5f7ff;border-radius:10px;padding:12px;text-align:center}.val{font-size:18px;font-weight:700;color:#203a43}.lbl{font-size:11px;color:#888;margin-top:2px;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#203a43;color:#fff;padding:8px 10px;text-align:left}td{padding:7px 10px;border-bottom:1px solid #eee}tr:nth-child(even) td{background:#f9f9f9}.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700}.paid{background:#d5f5e3;color:#1e8449}.partial{background:#fef9e7;color:#b7950b}.unpaid{background:#fdedec;color:#922b21}.day{margin-bottom:14px}.day-hdr{background:#eaf0fb;padding:8px 12px;border-radius:8px;font-weight:700;color:#203a43;margin-bottom:4px}.ev{padding:5px 12px;font-size:13px;border-left:3px solid #4F8EF7;margin-bottom:3px;background:#fafafa}.pack{columns:2;gap:20px}.pi{font-size:13px;padding:3px 0;break-inside:avoid}.done{color:#888;text-decoration:line-through}@media print{body{padding:16px}}</style>
</head><body>
<h1>🌍 ${trip.name}</h1>
<div class="meta">${trip.destination?`📍 ${trip.destination} · `:""}${trip.from?fmtDate(trip.from):""}${trip.to?" → "+fmtDate(trip.to):""} · Generated by Voyager on ${new Date().toLocaleDateString()}</div>
<h2>💰 Budget Summary</h2>
<div class="grid">
  <div class="card"><div class="val">${fm(totalSpent)}</div><div class="lbl">Total Cost</div></div>
  <div class="card"><div class="val">${fm(totalAdv)}</div><div class="lbl">Advance Paid</div></div>
  <div class="card"><div class="val">${fm(totalDue)}</div><div class="lbl">Remaining Due</div></div>
  ${trip.budget?`<div class="card"><div class="val">${fm(trip.budget)}</div><div class="lbl">Budget</div></div>`:""}
  <div class="card"><div class="val">${fm(trip.budget?trip.budget-totalSpent:0)}</div><div class="lbl">Budget Left</div></div>
</div>
${expenses.length?`<h2>📋 Expense Details</h2><table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Total</th><th>Advance</th><th>Due</th><th>Status</th></tr></thead><tbody>${expenses.map(e=>{const cat=CATEGORIES.find(c=>c.id===e.category)||CATEGORIES[7];return`<tr><td>${e.date?fmtDate(e.date):"-"}</td><td>${cat.icon} ${cat.label}</td><td>${e.note||"-"}</td><td>${fm(e.totalAmount||e.amount)}</td><td>${fm(e.advanceAmount)}</td><td>${fm(e.remainingAmount)}</td><td><span class="badge ${e.status||"unpaid"}">${(e.status||"unpaid").toUpperCase()}</span></td></tr>`;}).join("")}</tbody></table>`:""}
${(trip.days||[]).length?`<h2>📅 Itinerary</h2>${[...(trip.days||[])].sort((a,b)=>a.date<b.date?-1:1).map(day=>`<div class="day"><div class="day-hdr">${fmtDate(day.date)} — ${day.title}</div>${[...(day.events||[])].sort((a,b)=>(a.time||"")<(b.time||"")?-1:1).map(ev=>`<div class="ev">${ev.time?`<b>${ev.time}</b> · `:""}${EVENT_TYPES.find(t=>t.id===ev.type)?.icon||"📌"} ${ev.title}${ev.location?` · 📍${ev.location}`:""}${ev.notes?`<br/><small>${ev.notes}</small>`:""}</div>`).join("")}</div>`).join("")}`:""}
${totalItems?`<h2>🎒 Packing List (${packed}/${totalItems} packed)</h2><div class="pack">${(trip.packingItems||[]).map(i=>`<div class="pi ${i.checked?"done":""}">${i.checked?"☑":"☐"} ${i.label}</div>`).join("")}</div>`:""}
${(trip.documents||[]).length?`<h2>🗂️ Documents</h2><table><thead><tr><th>Type</th><th>Name</th><th>Number</th><th>Expires</th><th>Issued By</th></tr></thead><tbody>${(trip.documents||[]).map(d=>{const dt=DOC_TYPES.find(t=>t.id===d.type)||DOC_TYPES[7];return`<tr><td>${dt.icon} ${dt.label}</td><td>${d.title||"-"}</td><td style="font-family:monospace">${d.number||"-"}</td><td>${d.expiry?fmtDate(d.expiry):"-"}</td><td>${d.issuedBy||"-"}</td></tr>`;}).join("")}</tbody></table>`:""}
${(trip.emergencyContacts||[]).length?`<h2>📞 Emergency Contacts</h2><table><thead><tr><th>Name</th><th>Phone</th><th>Relation</th></tr></thead><tbody>${(trip.emergencyContacts||[]).map(c=>`<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.relation||"-"}</td></tr>`).join("")}</tbody></table>`:""}
</body></html>`;

    const w=window.open("","_blank"); w.document.write(html); w.document.close();
    setTimeout(()=>w.print(),500);
  }

  const expenses=trip.expenses||[];
  const totalSpent=expenses.reduce((s,e)=>s+(e.totalAmount||e.amount||0),0);
  const packed=(trip.packingItems||[]).filter(i=>i.checked).length;
  const totalItems=(trip.packingItems||[]).length;

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>📄 Trip Summary</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <MiniStat label="Itinerary Days" value={(trip.days||[]).length}           color="#4F8EF7" />
          <MiniStat label="Total Expenses" value={fmtMoney(totalSpent,currency)}    color="#E67E22" />
          <MiniStat label="Packed Items"   value={`${packed}/${totalItems}`}         color="#2ECC71" />
          <MiniStat label="Documents"      value={(trip.documents||[]).length}       color="#9B59B6" />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={printSummary} style={{ ...S.btnPrimary, justifyContent:"center" }}>🖨️ Print / Save as PDF</button>
          <button onClick={exportJSON}   style={{ ...S.btnSecondary, textAlign:"center" }}>💾 Export as JSON (backup)</button>
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:10, textAlign:"center" }}>
          PDF: open print dialog → choose "Save as PDF" as printer
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function SettingsTab() {
  const trial = getTrialStatus();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const savedLicense = getSavedLicense();

  const handleActivate = async () => {
    if (!key.trim()) return setError("Enter a valid key");
    setLoading(true); setError(""); setSuccess("");
    const res = await validateLicenseKey(key);
    if (res.valid) {
      saveLicenseLocally(key);
      setSuccess("App activated successfully! Thank you for purchasing.");
      setKey("");
    } else {
      setError(res.message || "Invalid license key");
    }
    setLoading(false);
  };

  const handleClear = () => {
    if(confirm("Are you sure you want to deactivate Voyager on this device?")) {
      deactivateApp();
      window.location.reload();
    }
  };

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>🔑 Licensing Status</div>
        
        {savedLicense ? (
          <div style={{ background:"rgba(46, 204, 113, 0.15)", border:"1px solid rgba(46, 204, 113, 0.3)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
            <div style={{ color:"#2ECC71", fontWeight:800, fontSize:15, marginBottom:4 }}>✅ Premium Activated</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginBottom:10 }}>License Key: {savedLicense.substring(0,8)}...</div>
            <button onClick={handleClear} style={{ ...S.btnDanger, fontSize:11 }}>Deactivate License</button>
          </div>
        ) : (
          <div style={{ background:"rgba(243, 156, 18, 0.15)", border:"1px solid rgba(243, 156, 18, 0.3)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
            <div style={{ color:"#F39C12", fontWeight:800, fontSize:15, marginBottom:4 }}>
              {trial.hasStarted && !trial.isExpired ? `⏳ 7-Day Free Trial (${trial.daysLeft} days left)` : (trial.isExpired ? "❌ Trial Expired" : "❌ Not Activated")}
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>Upgrade to premium to use Voyager forever without limits.</div>
          </div>
        )}

        {!savedLicense && (
          <div>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:8, color:"rgba(255,255,255,0.7)" }}>Enter License Key</div>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <input value={key} onChange={e=>setKey(e.target.value.toUpperCase())} placeholder="XXXXX-XXXXX-XXXXX-XXXXX" style={S.input} />
                {error && <div style={{ color:"#E74C3C", fontSize:11, marginTop:4 }}>{error}</div>}
                {success && <div style={{ color:"#2ECC71", fontSize:11, marginTop:4 }}>{success}</div>}
              </div>
              <button onClick={handleActivate} disabled={loading} style={{ ...S.btnPrimary, padding:"9px 16px" }}>{loading?"...":"Activate"}</button>
            </div>
            
            <div style={{ marginTop:16, borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:16 }}>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>Don't have a license key yet?</div>
              <a href="https://voyager-manish.lemonsqueezy.com/checkout/buy/c69b2362-113d-44f5-93a2-d35fd1fca250" target="_blank" rel="noreferrer" style={{ ...S.btnSecondary, display:"inline-block" }}>
                Purchase Voyager ($19.99)
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div style={S.card}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>⚙️ App Data</div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:12 }}>
          Voyager stores all your data locally on your device. We do not have access to your trip details.
        </div>
        <button onClick={()=>{
          if(confirm("DANGER: This will permanently delete ALL your trips and data from this device. Are you absolutely sure?")) {
            localStorage.clear();
            window.location.reload();
          }
        }} style={{ ...S.btnDanger, width:"100%" }}>
          Delete All App Data
        </button>
      </div>
    </div>
  );
}
