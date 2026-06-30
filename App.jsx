import React, { useState, useEffect } from "react";
import {
  Sun, Map as MapIcon, BookOpen, Target, User, Mic, Send,
  ChevronRight, Moon, SunMedium, Sparkles, Compass, Feather,
  Lock, Bell, Volume2, Download, Mail, CalendarCheck, ArrowLeft,
} from "lucide-react";

/* ====================== DESIGN TOKENS ====================== */
const serif = { fontFamily: "'Iowan Old Style','Palatino Linotype',Georgia,serif" };
const sans = { fontFamily: "'Avenir Next','Segoe UI',system-ui,sans-serif" };

function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem("lp_dark") === "1");
  useEffect(() => localStorage.setItem("lp_dark", dark ? "1" : "0"), [dark]);
  const t = dark
    ? { bg: "#11181C", surface: "#1C2226", surface2: "#222B30", text: "#F2EEE4",
        textSoft: "#A9A296", border: "#2A3236", accent: "#C9A86A", accent2: "#7C9885" }
    : { bg: "#F8F4EC", surface: "#FFFFFF", surface2: "#EFE6D8", text: "#2B2A28",
        textSoft: "#6E6A63", border: "#E3DACB", accent: "#2C3E50", accent2: "#7C9885" };
  return { dark, setDark, t };
}

/* ---------------- Persistenza locale (i dati restano sul telefono) ---------------- */
function usePersisted(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV];
}

/* ---------------- Sentiero SVG ---------------- */
function PathLine({ t, compact, progress = 0.42 }) {
  const w = compact ? 320 : 340;
  const h = compact ? 70 : 460;
  if (compact) {
    const d = `M10,50 C 80,10 130,90 200,40 S 300,60 310,20`;
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
        <path d={d} stroke={t.border} strokeWidth="3" strokeLinecap="round" />
        <path d={d} stroke={t.accent2} strokeWidth="3" strokeLinecap="round"
          strokeDasharray="320" strokeDashoffset={320 - 320 * progress} />
        <circle cx={10 + progress * 300} cy={50 - progress * 10} r="6" fill={t.accent} />
      </svg>
    );
  }
  const d = `M170,20 C 60,90 280,160 100,230 C -40,290 260,330 150,400 C 90,430 170,440 170,440`;
  const pts = [[120, 60], [150, 190], [60, 290], [150, 400]];
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={t.border} strokeWidth="4" strokeLinecap="round" />
      <path d={d} stroke={t.accent2} strokeWidth="4" strokeLinecap="round"
        strokeDasharray="900" strokeDashoffset={900 - 900 * progress} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="8"
          fill={progress >= [0.12, 0.38, 0.64, 0.9][i] ? t.accent : t.surface}
          stroke={t.accent} strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ---------------- UI helpers ---------------- */
function Card({ t, children, style }) {
  return <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: 18, ...style }}>{children}</div>;
}
function ScreenHeader({ t, title, subtitle, onBack }) {
  return (
    <div style={{ padding: "26px 22px 6px", display: "flex", alignItems: "flex-start", gap: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>
          <ArrowLeft size={20} color={t.textSoft} />
        </button>
      )}
      <div>
        <h1 style={{ ...serif, fontSize: 26, color: t.text, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ ...sans, fontSize: 13, color: t.textSoft, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

/* ====================== TAB BAR ====================== */
function TabBar({ t, active, setActive }) {
  const tabs = [
    { id: "home", label: "Oggi", icon: Sun },
    { id: "map", label: "Mappa", icon: MapIcon },
    { id: "journal", label: "Diario", icon: BookOpen },
    { id: "goals", label: "Obiettivi", icon: Target },
    { id: "profile", label: "Profilo", icon: User },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, background: t.surface,
      borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-around",
      padding: "10px 6px max(18px, env(safe-area-inset-bottom))", zIndex: 20,
    }}>
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => setActive(id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            background: "none", border: "none", cursor: "pointer",
            color: isActive ? t.accent : t.textSoft, padding: "2px 6px",
          }}>
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
            <span style={{ ...sans, fontSize: 10.5 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ====================== ONBOARDING ====================== */
const ONBOARD_QUESTIONS = [
  { q: "Chi sei oggi?", a: "Grazie. Iniziamo da qui." },
  { q: "Com'è stata la tua storia finora?", a: "Sto ascoltando ogni parte di questo racconto." },
  { q: "Cosa ti ha reso forte?", a: "Questa è una risorsa che porterai con te." },
  { q: "Cosa ti ha ferito?", a: "Non serve dire tutto ora. Resta qui, al sicuro." },
  { q: "Quali sono le tue abitudini attuali?", a: "Capire da dove parti aiuta a tracciare la strada." },
  { q: "Cosa ti entusiasma davvero?", a: "Questo dirà molto sulla direzione giusta." },
  { q: "Come immagini la tua vita tra 5 anni?", a: "Comincio a vedere un orizzonte possibile." },
  { q: "Cosa non vuoi più tollerare nella tua vita?", a: "Forse il punto di partenza più importante." },
];

function Onboarding({ t, onDone }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState("");
  const [showAck, setShowAck] = useState(false);
  const last = step === ONBOARD_QUESTIONS.length - 1;
  const next = () => {
    if (!value.trim()) return;
    setShowAck(true);
    setTimeout(() => {
      setShowAck(false); setValue("");
      if (last) onDone(); else setStep((s) => s + 1);
    }, 900);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: t.bg }}>
      <div style={{ padding: "40px 26px 0" }}>
        <div style={{ height: 3, background: t.border, borderRadius: 2 }}>
          <div style={{ height: 3, width: `${((step + 1) / ONBOARD_QUESTIONS.length) * 100}%`, background: t.accent2, borderRadius: 2, transition: "width .5s ease" }} />
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
        {!showAck ? (
          <>
            <Compass size={22} color={t.accent2} style={{ marginBottom: 18 }} />
            <h2 style={{ ...serif, fontSize: 25, lineHeight: 1.35, color: t.text, margin: "0 0 28px" }}>{ONBOARD_QUESTIONS[step].q}</h2>
            <textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Scrivi con calma, o usa la voce…" rows={4}
              style={{ ...sans, fontSize: 15.5, color: t.text, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: 16, resize: "none", outline: "none", lineHeight: 1.5 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center" }}>
              <button style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${t.border}`, background: t.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Mic size={18} color={t.textSoft} />
              </button>
              <button onClick={next} disabled={!value.trim()} style={{ ...sans, fontSize: 14.5, fontWeight: 600, color: "#fff", background: value.trim() ? t.accent : t.border, border: "none", padding: "13px 26px", borderRadius: 26, cursor: value.trim() ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}>
                {last ? "Componi la mia mappa" : "Continua"} <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Sparkles size={20} color={t.accent2} style={{ marginBottom: 14 }} />
            <p style={{ ...serif, fontSize: 19, color: t.text, lineHeight: 1.5 }}>{ONBOARD_QUESTIONS[step].a}</p>
          </div>
        )}
      </div>
      <div style={{ textAlign: "center", paddingBottom: 30, ...sans, fontSize: 11.5, color: t.textSoft }}>{step + 1} di {ONBOARD_QUESTIONS.length}</div>
    </div>
  );
}

/* ====================== HOME ====================== */
function Home({ t, setActive, energy, setEnergy }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buongiorno" : hour < 19 ? "Buon pomeriggio" : "Buonasera";
  return (
    <div style={{ padding: "26px 20px 110px" }}>
      <p style={{ ...sans, fontSize: 13, color: t.textSoft, margin: 0 }}>{greeting}</p>
      <h1 style={{ ...serif, fontSize: 24, color: t.text, margin: "4px 0 18px", lineHeight: 1.4 }}>
        "Non serve vedere tutta la strada.<br />Basta vedere il passo di oggi."
      </h1>
      <Card t={t} style={{ marginBottom: 14 }}>
        <p style={{ ...sans, fontSize: 11.5, letterSpacing: 0.6, color: t.textSoft, textTransform: "uppercase", margin: "0 0 6px" }}>Il tuo sentiero</p>
        <PathLine t={t} compact progress={0.42} />
        <button onClick={() => setActive("map")} style={{ ...sans, fontSize: 12.5, color: t.accent2, background: "none", border: "none", padding: 0, marginTop: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          Sei nella fase di costruzione delle basi <ChevronRight size={13} />
        </button>
      </Card>
      <Card t={t} style={{ marginBottom: 14, background: "#2C3E50" }}>
        <p style={{ ...sans, fontSize: 11.5, letterSpacing: 0.6, color: "#C9A86A", textTransform: "uppercase", margin: "0 0 8px" }}>Il passo di oggi</p>
        <p style={{ ...serif, fontSize: 19, color: "#F8F4EC", margin: "0 0 14px", lineHeight: 1.4 }}>Scrivi la prima riga del progetto che rimandi da settimane.</p>
        <button style={{ ...sans, fontSize: 13.5, fontWeight: 600, color: "#2C3E50", background: "#F8F4EC", border: "none", borderRadius: 22, padding: "10px 20px", cursor: "pointer" }}>Inizia ora</button>
      </Card>
      <p style={{ ...sans, fontSize: 11.5, letterSpacing: 0.6, color: t.textSoft, textTransform: "uppercase", margin: "18px 0 8px" }}>Tre azioni possibili</p>
      {[
        { tag: "Minima · 5 min", text: "Rileggi la tua frase guida della settimana." },
        { tag: "Media · 20 min", text: "Organizza i prossimi tre passi del progetto." },
        { tag: "Decisiva · variabile", text: "Manda il messaggio che stai rimandando." },
      ].map((a, i) => (
        <Card key={i} t={t} style={{ marginBottom: 10, padding: 14 }}>
          <p style={{ ...sans, fontSize: 10.5, color: t.accent2, letterSpacing: 0.4, margin: "0 0 4px" }}>{a.tag}</p>
          <p style={{ ...sans, fontSize: 14.5, color: t.text, margin: 0 }}>{a.text}</p>
        </Card>
      ))}
      <Card t={t} style={{ margin: "14px 0" }}>
        <p style={{ ...sans, fontSize: 11.5, letterSpacing: 0.6, color: t.textSoft, textTransform: "uppercase", margin: "0 0 10px" }}>Energia di oggi</p>
        <input type="range" min="0" max="100" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} style={{ width: "100%", accentColor: t.accent2 }} />
        <p style={{ ...sans, fontSize: 12.5, color: t.textSoft, margin: "6px 0 0" }}>
          {energy < 35 ? "Giornata leggera — andremo piano." : energy < 70 ? "Ritmo equilibrato." : "Energia alta — possiamo osare di più."}
        </p>
      </Card>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {[{ icon: Mic, label: "Voce" }, { icon: Feather, label: "Diario", go: "journal" }, { icon: Sparkles, label: "Check-in" }].map(({ icon: Icon, label, go }, i) => (
          <button key={i} onClick={() => go && setActive(go)} style={{ flex: 1, ...sans, fontSize: 12, color: t.text, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <Icon size={17} color={t.accent2} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ====================== MAPPA ====================== */
function MapScreen({ t, setActive }) {
  const [sel, setSel] = useState(null);
  const stations = [
    { name: "Le basi", detail: "Hai stabilizzato abitudini quotidiane e una routine sostenibile.", state: "done" },
    { name: "Prima svolta", detail: "Il cambio di prospettiva sul lavoro vissuto due mesi fa.", state: "done" },
    { name: "Costruzione", detail: "Competenze da consolidare: scrittura pubblica, gestione del tempo.", state: "current" },
    { name: "Orizzonte", detail: "La direzione tra 3 anni: maggiore libertà e un progetto tuo.", state: "future" },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="La tua mappa" subtitle="Il sentiero cambia mentre cambi tu" />
      <div style={{ padding: "0 26px" }}><PathLine t={t} progress={0.42} /></div>
      <div style={{ padding: "10px 20px 0" }}>
        {stations.map((s, i) => (
          <button key={i} onClick={() => setSel(s)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ width: 10, height: 10, borderRadius: 6, background: s.state === "future" ? "transparent" : t.accent2, border: `2px solid ${t.accent2}`, flexShrink: 0 }} />
            <div>
              <p style={{ ...sans, fontSize: 15, color: t.text, margin: 0, fontWeight: 600 }}>{s.name}</p>
              <p style={{ ...sans, fontSize: 12, color: t.textSoft, margin: "2px 0 0" }}>{s.state === "done" ? "Tappa raggiunta" : s.state === "current" ? "Sei qui ora" : "Tappa futura"}</p>
            </div>
            <ChevronRight size={16} color={t.textSoft} style={{ marginLeft: "auto" }} />
          </button>
        ))}
        <button onClick={() => setActive("future")} style={{ width: "100%", marginTop: 6, ...sans, fontSize: 13.5, color: t.accent2, background: "none", border: `1px dashed ${t.border}`, borderRadius: 18, padding: "14px", cursor: "pointer" }}>
          Guarda il tuo futuro visualizzato →
        </button>
      </div>
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "flex-end", zIndex: 30 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: t.surface, width: "100%", borderRadius: "26px 26px 0 0", padding: "22px 24px 36px" }}>
            <div style={{ width: 36, height: 4, background: t.border, borderRadius: 2, margin: "0 auto 16px" }} />
            <h3 style={{ ...serif, fontSize: 20, color: t.text, margin: "0 0 8px" }}>{sel.name}</h3>
            <p style={{ ...sans, fontSize: 14.5, color: t.textSoft, lineHeight: 1.55, margin: 0 }}>{sel.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== DIARIO (con salvataggio reale) ====================== */
function Journal({ t }) {
  const [entries, setEntries] = usePersisted("lp_entries", [
    { date: "28 giugno", text: "Ho ripreso in mano il progetto che avevo lasciato.", synth: "Una piccola ripresa che vale più di quanto sembri." },
  ]);
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    setEntries([{ date: "Oggi", text: draft, synth: "Sto ascoltando questa giornata. La sintesi sarà pronta stasera." }, ...entries]);
    setDraft("");
  };
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="Diario" subtitle="Racconta, anche solo con poche righe" />
      <div style={{ padding: "8px 20px 0" }}>
        <Card t={t} style={{ marginBottom: 16 }}>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Com'è andata oggi?" rows={3}
            style={{ ...sans, fontSize: 14.5, color: t.text, background: "transparent", border: "none", outline: "none", width: "100%", resize: "none", lineHeight: 1.5 }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button style={{ width: 38, height: 38, borderRadius: 19, border: `1px solid ${t.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Mic size={16} color={t.textSoft} /></button>
            <button onClick={add} style={{ width: 38, height: 38, borderRadius: 19, border: "none", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Send size={15} color="#fff" /></button>
          </div>
        </Card>
        {entries.map((e, i) => (
          <Card key={i} t={t} style={{ marginBottom: 12 }}>
            <p style={{ ...sans, fontSize: 11, color: t.textSoft, margin: "0 0 6px" }}>{e.date}</p>
            <p style={{ ...sans, fontSize: 14.5, color: t.text, margin: "0 0 10px", lineHeight: 1.5 }}>{e.text}</p>
            <p style={{ ...serif, fontSize: 13.5, color: t.accent2, margin: 0, fontStyle: "italic" }}>{e.synth}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ====================== OBIETTIVI ====================== */
function Goals({ t }) {
  const goals = [
    { title: "Lanciare il mio progetto", why: "È la prova che posso costruire qualcosa di mio.", state: "In corso", pct: 0.4 },
    { title: "Ritrovare equilibrio col lavoro", why: "Per smettere di sentirmi sempre in debito di tempo.", state: "Stabile", pct: 0.65 },
    { title: "Coltivare una relazione vera", why: "Vuoi sentirti meno solo nei momenti che contano.", state: "Da rivedere", pct: 0.2 },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="Obiettivi" subtitle="Tappe vive, non caselle da spuntare" />
      <div style={{ padding: "8px 20px 0" }}>
        {goals.map((g, i) => (
          <Card key={i} t={t} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ ...serif, fontSize: 17, color: t.text, margin: 0 }}>{g.title}</p>
              <span style={{ ...sans, fontSize: 11, color: t.accent2, border: `1px solid ${t.border}`, borderRadius: 12, padding: "3px 9px" }}>{g.state}</span>
            </div>
            <p style={{ ...sans, fontSize: 13, color: t.textSoft, margin: "8px 0 12px", lineHeight: 1.5 }}>{g.why}</p>
            <div style={{ height: 5, background: t.border, borderRadius: 3 }}>
              <div style={{ height: 5, width: `${g.pct * 100}%`, background: t.accent2, borderRadius: 3 }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ====================== FUTURO VISUALIZZATO (nuova) ====================== */
function Future({ t, onBack }) {
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="Futuro visualizzato" subtitle="Una giornata possibile, tra qualche anno" onBack={onBack} />
      <div style={{ padding: "8px 20px 0" }}>
        <Card t={t} style={{ background: "#2C3E50" }}>
          <p style={{ ...serif, fontSize: 18, color: "#F8F4EC", lineHeight: 1.6, margin: 0 }}>
            Ti svegli senza sveglia. La luce entra da una finestra che hai scelto tu.
            Il lavoro che fai oggi è quello che hai costruito un passo alla volta, non quello
            che ti è capitato. Nel pomeriggio rispondi solo ai messaggi che contano davvero.
            La sera, qualcuno ti aspetta per cena: non di corsa, non per dovere.
          </p>
        </Card>
        <p style={{ ...sans, fontSize: 12.5, color: t.textSoft, margin: "14px 0 0", lineHeight: 1.6 }}>
          Questa scena si aggiorna ogni tre mesi, in base a come cambiano le tue risposte nel diario e nella mappa.
          Non è una promessa: è una direzione resa visibile.
        </p>
      </div>
    </div>
  );
}

/* ====================== LETTERE (nuova) ====================== */
function Letters({ t, onBack }) {
  const letters = [
    { title: "Lettera dal futuro", date: "Generata oggi" },
    { title: "Riepilogo della settimana", date: "23–29 giugno" },
    { title: "Lettera di incoraggiamento", date: "Salvata il 12 giugno" },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="Lettere" subtitle="Parole scritte per te, da te" onBack={onBack} />
      <div style={{ padding: "8px 20px 0" }}>
        {letters.map((l, i) => (
          <Card key={i} t={t} style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Mail size={18} color={t.accent2} />
            <div>
              <p style={{ ...sans, fontSize: 14.5, color: t.text, margin: 0, fontWeight: 600 }}>{l.title}</p>
              <p style={{ ...sans, fontSize: 12, color: t.textSoft, margin: "2px 0 0" }}>{l.date}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ====================== REVISIONE SETTIMANALE (nuova) ====================== */
function WeeklyReview({ t, onBack }) {
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="Revisione settimanale" subtitle="23 — 29 giugno" onBack={onBack} />
      <div style={{ padding: "8px 20px 0" }}>
        <Card t={t} style={{ marginBottom: 12 }}>
          <p style={{ ...sans, fontSize: 11, color: t.accent2, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 6px" }}>Cosa è successo</p>
          <p style={{ ...sans, fontSize: 14, color: t.text, lineHeight: 1.55, margin: 0 }}>
            Hai ripreso il progetto che avevi messo in pausa e hai scritto nel diario 4 volte su 7 giorni.
          </p>
        </Card>
        <Card t={t} style={{ marginBottom: 12 }}>
          <p style={{ ...sans, fontSize: 11, color: t.accent2, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 6px" }}>Cosa ha funzionato</p>
          <p style={{ ...sans, fontSize: 14, color: t.text, lineHeight: 1.55, margin: 0 }}>
            Le azioni minime al mattino: le hai completate quasi ogni giorno, anche nei giorni di poca energia.
          </p>
        </Card>
        <Card t={t}>
          <p style={{ ...sans, fontSize: 11, color: t.accent2, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 6px" }}>Per la prossima settimana</p>
          <p style={{ ...sans, fontSize: 14, color: t.text, lineHeight: 1.55, margin: 0 }}>
            Manteniamo il ritmo attuale. Una sola priorità nuova: dedicare 20 minuti decisi al progetto, due volte.
          </p>
        </Card>
      </div>
    </div>
  );
}

/* ====================== PROFILO ====================== */
function Profile({ t, dark, setDark, setActive }) {
  const traits = [
    { k: "Valori principali", v: "Libertà, coerenza, profondità" },
    { k: "Motivazione profonda", v: "Costruire qualcosa che porti la tua firma" },
    { k: "Stile decisionale", v: "Riflessivo, lento ma solido" },
    { k: "Area da lavorare", v: "Fidarti dei primi passi imperfetti" },
  ];
  return (
    <div style={{ paddingBottom: 110 }}>
      <ScreenHeader t={t} title="Profilo" subtitle="Un ritratto che cambia con te" />
      <div style={{ padding: "8px 20px 0" }}>
        <Card t={t} style={{ marginBottom: 16 }}>
          {traits.map((tr, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < traits.length - 1 ? `1px solid ${t.border}` : "none" }}>
              <p style={{ ...sans, fontSize: 11, color: t.textSoft, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.4 }}>{tr.k}</p>
              <p style={{ ...sans, fontSize: 14.5, color: t.text, margin: 0 }}>{tr.v}</p>
            </div>
          ))}
        </Card>

        <p style={{ ...sans, fontSize: 11.5, letterSpacing: 0.6, color: t.textSoft, textTransform: "uppercase", margin: "8px 0 8px" }}>Altre sezioni</p>
        <Card t={t} style={{ marginBottom: 16 }}>
          {[
            { icon: Mail, label: "Lettere", go: "letters" },
            { icon: CalendarCheck, label: "Revisione settimanale", go: "review" },
          ].map(({ icon: Icon, label, go }, i, arr) => (
            <button key={i} onClick={() => setActive(go)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none" }}>
              <Icon size={17} color={t.accent2} />
              <span style={{ ...sans, fontSize: 14.5, color: t.text, flex: 1 }}>{label}</span>
              <ChevronRight size={14} color={t.textSoft} />
            </button>
          ))}
        </Card>

        <p style={{ ...sans, fontSize: 11.5, letterSpacing: 0.6, color: t.textSoft, textTransform: "uppercase", margin: "8px 0 8px" }}>Impostazioni</p>
        <Card t={t}>
          {[
            { icon: dark ? Moon : SunMedium, label: "Aspetto", value: dark ? "Scuro" : "Chiaro", action: () => setDark(!dark) },
            { icon: Volume2, label: "Voce", value: "Calma, naturale" },
            { icon: Bell, label: "Notifiche", value: "Essenziali" },
            { icon: Lock, label: "Privacy e memoria", value: "Sotto controllo" },
            { icon: Download, label: "Esporta i tuoi dati", value: "" },
          ].map(({ icon: Icon, label, value, action }, i, arr) => (
            <button key={i} onClick={action} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", textAlign: "left", cursor: action ? "pointer" : "default", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : "none" }}>
              <Icon size={17} color={t.accent2} />
              <span style={{ ...sans, fontSize: 14.5, color: t.text, flex: 1 }}>{label}</span>
              <span style={{ ...sans, fontSize: 12.5, color: t.textSoft }}>{value}</span>
              <ChevronRight size={14} color={t.textSoft} />
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ====================== APP ROOT ====================== */
export default function App() {
  const { dark, setDark, t } = useTheme();
  const [onboarded, setOnboarded] = usePersisted("lp_onboarded", false);
  const [active, setActive] = useState("home");
  const [energy, setEnergy] = usePersisted("lp_energy", 60);

  const mainTabs = ["home", "map", "journal", "goals", "profile"];
  const isMainTab = mainTabs.includes(active);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, transition: "background .3s ease" }}>
      {!onboarded ? (
        <Onboarding t={t} onDone={() => setOnboarded(true)} />
      ) : (
        <>
          {active === "home" && <Home t={t} setActive={setActive} energy={energy} setEnergy={setEnergy} />}
          {active === "map" && <MapScreen t={t} setActive={setActive} />}
          {active === "journal" && <Journal t={t} />}
          {active === "goals" && <Goals t={t} />}
          {active === "profile" && <Profile t={t} dark={dark} setDark={setDark} setActive={setActive} />}
          {active === "future" && <Future t={t} onBack={() => setActive("map")} />}
          {active === "letters" && <Letters t={t} onBack={() => setActive("profile")} />}
          {active === "review" && <WeeklyReview t={t} onBack={() => setActive("profile")} />}
          <TabBar t={t} active={isMainTab ? active : "profile"} setActive={setActive} />
        </>
      )}
    </div>
  );
}
