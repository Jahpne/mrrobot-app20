import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getDatabase, ref, push, onValue, update, remove, serverTimestamp
} from "firebase/database";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyApjjipJIlAeeh2FChJofhC4au214OuvcQ",
  authDomain: "mrrobot2-364a6.firebaseapp.com",
  projectId: "mrrobot2-364a6",
  storageBucket: "mrrobot2-364a6.firebasestorage.app",
  messagingSenderId: "603009163271",
  appId: "1:603009163271:web:56cedb3c66252a7783caa2",
  measurementId: "G-2X4B1TCTYR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ─── CLOUDINARY CONFIG ────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = "dsk9ockee";
const CLOUDINARY_UPLOAD_PRESET = "Mr-robot-app";

// ─── Firebase Helpers ─────────────────────────────────────────────────────────
const msgsRef   = () => ref(db, "messages");
const msgRef    = (id) => ref(db, `messages/${id}`);
const usersRef  = () => ref(db, "users");
const userRef   = (id) => ref(db, `users/${id}`);

// ─── Guest ID ─────────────────────────────────────────────────────────────────
function getGuestId() {
  let id = sessionStorage.getItem("mrrobot_uid");
  if (!id) {
    id = "USR-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    sessionStorage.setItem("mrrobot_uid", id);
  }
  return id;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=IBM+Plex+Mono:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #07080d;
    --bg2:       #0d0f1a;
    --panel:     #111323;
    --border:    #2a1f5e;
    --purple:    #7c3aed;
    --purple2:   #5b21b6;
    --purple3:   #4c1d95;
    --glow:      #a855f7;
    --glow2:     #c084fc;
    --onion:     #6d28d9;
    --text:      #e2d9f3;
    --muted:     #6b7280;
    --red:       #ef4444;
    --green:     #22c55e;
    --shadow:    0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15);
    --shadow2:   0 0 10px rgba(168,85,247,0.3);
    --font-main: 'IBM Plex Mono', monospace;
    --font-head: 'Orbitron', monospace;
    --font-ui:   'Share Tech Mono', monospace;
  }

  html, body, #root { height: 100%; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-main); overflow-x: hidden; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--purple3); border-radius: 2px; }

  input:focus, textarea:focus, select:focus {
    outline: none !important;
    border-color: var(--glow) !important;
    box-shadow: 0 0 0 2px rgba(168,85,247,0.25), var(--shadow2) !important;
  }

  .scanline {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  }

  .glitch { animation: glitch-flicker 8s infinite; }
  @keyframes glitch-flicker {
    0%,95%,100% { opacity:1; text-shadow: 0 0 20px var(--glow), 0 0 40px var(--purple); }
    96% { opacity:.8; text-shadow: 3px 0 0 rgba(255,0,200,0.7), -3px 0 0 rgba(0,255,255,0.7); }
    97% { opacity:1; }
    98% { opacity:.9; text-shadow: -2px 0 0 rgba(255,0,200,0.5); }
    99% { opacity:1; }
  }

  .pulse-ring { animation: pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  @keyframes pulse-ring {
    0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
    50%      { box-shadow: 0 0 0 8px rgba(124,58,237,0); }
  }

  .fade-in { animation: fadeIn 0.3s ease-out; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .slide-in { animation: slideIn 0.25s ease-out; }
  @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }

  @keyframes shakeAnim {
    0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)}
  }

  .delete-btn-visual {
    position: absolute;
    top: 5px;
    right: -30px;
    background: rgba(0,0,0,0.7);
    border: 1px solid var(--red);
    border-radius: 4px;
    color: var(--red);
    cursor: pointer;
    padding: 2px 6px;
    font-size: 10px;
    opacity: 0;
    transition: opacity 0.2s;
    font-family: var(--font-ui);
    z-index: 10;
  }
  .message-container:hover .delete-btn-visual {
    opacity: 1;
  }
  .message-container {
    position: relative;
  }
  .image-preview {
    max-width: 200px;
    max-height: 150px;
    border-radius: 8px;
    margin-top: 8px;
    cursor: pointer;
    border: 1px solid var(--border);
  }
  .file-input-label {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-family: var(--font-ui);
    color: var(--muted);
    transition: all 0.2s;
  }
  .file-input-label:hover {
    border-color: var(--glow);
    color: var(--glow);
  }
  input[type="file"] {
    display: none;
  }
  .uploading {
    font-size: 10px;
    color: var(--glow);
    animation: pulse 1s infinite;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// ─── Icon Component ───────────────────────────────────────────────────────────
function Icon({ name, size = 16, style }) {
  const icons = {
    lock:   "M12 1C9.243 1 7 3.243 7 6v2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2V6c0-2.757-2.243-5-5-5zm0 2a3 3 0 013 3v2H9V6a3 3 0 013-3zm0 9a2 2 0 110 4 2 2 0 010-4z",
    send:   "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
    timer:  "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.5-13H11v6l4.25 2.55.75-1.23-3.5-2.07V7z",
    user:   "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    chat:   "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
    skull:  "M12 2a9 9 0 00-9 9c0 3.5 2 6.6 5 8.2V21h2v-1h4v1h2v-1.8c3-1.6 5-4.7 5-8.2a9 9 0 00-9-9zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z",
    menu:   "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
    close:  "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    wifi:   "M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    image:  "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
    upload: "M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d={icons[name] || ""} />
    </svg>
  );
}

// ─── Image Upload Function (Cloudinary) ───────────────────────────────────────
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  
  const data = await response.json();
  return data.secure_url;
}

// ─── Countdown Badge ──────────────────────────────────────────────────────────
function CountdownBadge({ seconds }) {
  const color = seconds <= 10 ? "#ef4444" : seconds <= 30 ? "#f59e0b" : "#22c55e";
  return (
    <span style={{
      fontSize: 10, fontFamily: "var(--font-ui)", color,
      background: `${color}18`, border: `1px solid ${color}44`,
      borderRadius: 4, padding: "1px 5px", marginLeft: 6,
      textShadow: `0 0 8px ${color}`,
    }}>
      {seconds}s
    </span>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = "normal" }) {
  const big = size === "big";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: big ? 12 : 8 }}>
      <div style={{
        width: big ? 44 : 32, height: big ? 44 : 32, borderRadius: "50%",
        background: "radial-gradient(circle, var(--purple2), var(--bg))",
        border: "2px solid var(--glow)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "var(--shadow)",
      }}>
        <Icon name="skull" size={big ? 22 : 16} style={{ color: "var(--glow)" }} />
      </div>
      <div>
        <div className={big ? "glitch" : ""} style={{
          fontFamily: "var(--font-head)", fontWeight: 900,
          fontSize: big ? 28 : 18, letterSpacing: 3,
          color: "var(--glow2)",
          textShadow: "0 0 20px var(--glow), 0 0 40px var(--purple)",
        }}>
          MR<span style={{ color: "var(--glow)" }}>ROBOT</span>
        </div>
        {big && <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-ui)", letterSpacing: 4 }}>SECURE CHANNEL</div>}
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, currentUserId, isAdmin, onUnlock, onDelete }) {
  const isFromAdmin = msg.from === "admin";
  const isOwnMessage = (isAdmin && isFromAdmin) || (!isAdmin && !isFromAdmin && msg.userId === currentUserId);
  
  const align = isOwnMessage ? "flex-end" : "flex-start";
  const bgColor = isOwnMessage
    ? "linear-gradient(135deg, #1e0a3c, #2d1160)"
    : "linear-gradient(135deg, #0f1030, #1a0e40)";
  const borderColor = isOwnMessage ? "var(--glow)" : "var(--border)";

  // Message is LOCKED for the receiver if:
  // 1. NOT your own message
  // 2. AND it has a timer
  // 3. AND it's not yet unlocked
  const shouldBeLocked = !isOwnMessage && msg.timerSeconds && msg.timerSeconds > 0 && msg.locked !== false;
  
  // Show timer for your OWN messages (sender sees timer immediately)
  const showTimer = isOwnMessage && msg.countdown != null && msg.countdown > 0;
  
  // Show timer for received messages AFTER they are unlocked
  const showReceivedTimer = !isOwnMessage && !shouldBeLocked && msg.countdown != null && msg.countdown > 0;

  return (
    <div className="message-container" style={{ display: "flex", justifyContent: align, marginBottom: 12 }}>
      <div style={{
        maxWidth: "72%", padding: "10px 14px",
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: isOwnMessage ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        boxShadow: "0 0 16px rgba(124,58,237,0.25), 0 2px 8px rgba(0,0,0,0.5)",
        position: "relative",
      }}>
        <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-ui)", marginBottom: 4, letterSpacing: 1 }}>
          {isFromAdmin ? "[ ADMIN ]" : `[ ${msg.userId} ]`}
        </div>

        {shouldBeLocked ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            onClick={() => onUnlock && onUnlock(msg.id)}>
            <div className="pulse-ring" style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(124,58,237,0.15)",
              border: "1px solid var(--purple)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 12px rgba(124,58,237,0.5)",
            }}>
              <Icon name="lock" size={16} style={{ color: "var(--glow)" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--glow2)", fontFamily: "var(--font-ui)" }}>ENCRYPTED MESSAGE</div>
              <div style={{ fontSize: 9, color: "var(--muted)" }}>CLICK TO DECRYPT</div>
            </div>
          </div>
        ) : (
          <div>
            {msg.type === "image" ? (
              <img 
                src={msg.imageUrl} 
                alt="Shared content"
                className="image-preview"
                style={{ maxWidth: "200px", maxHeight: "150px", borderRadius: "8px", cursor: "pointer" }}
                onClick={() => window.open(msg.imageUrl, "_blank")}
              />
            ) : (
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text)", wordBreak: "break-word" }}>
                {msg.text}
              </span>
            )}
            {showTimer && <CountdownBadge seconds={msg.countdown} />}
            {showReceivedTimer && <CountdownBadge seconds={msg.countdown} />}
          </div>
        )}

        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 6, textAlign: "right", fontFamily: "var(--font-ui)" }}>
          {msg.ts ? new Date(msg.ts).toLocaleTimeString() : "..."}
        </div>
      </div>
      
      <button
        onClick={() => onDelete && onDelete(msg.id)}
        className="delete-btn-visual"
      >
        <Icon name="delete" size={10} /> DEL
      </button>
    </div>
  );
}

// ─── Timer Select ─────────────────────────────────────────────────────────────
function TimerInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Icon name="timer" size={14} style={{ color: "var(--glow)", flexShrink: 0 }} />
      <select value={value} onChange={e => onChange(Number(e.target.value))} style={{
        background: "var(--panel)", border: "1px solid var(--border)",
        color: value ? "var(--glow)" : "var(--muted)",
        borderRadius: 6, padding: "4px 6px",
        fontSize: 11, fontFamily: "var(--font-ui)", cursor: "pointer",
      }}>
        <option value={0}>No timer (stays forever)</option>
        <option value={10}>10s</option>
        <option value={30}>30s</option>
        <option value={60}>1m</option>
        <option value={120}>2m</option>
        <option value={300}>5m</option>
        <option value={600}>10m</option>
      </select>
    </div>
  );
}

// ─── Input Row with Image Upload ──────────────────────────────────────────────
function InputRow({ onSend, onSendImage, placeholder = "TYPE MESSAGE...", uploading }) {
  const [text, setText] = useState("");
  const [timer, setTimer] = useState(0);
  const fileInputRef = useRef(null);

  function handleSend() {
    if (!text.trim()) return;
    onSend(text.trim(), timer || null);
    setText("");
    setTimer(0);
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file && onSendImage) {
      onSendImage(file, timer || null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div style={{
      padding: "12px 16px", background: "var(--panel)",
      borderTop: "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={placeholder}
          style={{
            flex: 1, background: "var(--bg2)",
            border: "1px solid var(--border)", borderRadius: 8,
            color: "var(--text)", fontSize: 13, fontFamily: "var(--font-main)",
            padding: "10px 14px", transition: "all 0.2s",
          }}
        />
        
        <label className="file-input-label">
          <Icon name="image" size={14} />
          {uploading ? "📤" : "IMG"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={uploading}
          />
        </label>
        
        <button onClick={handleSend} disabled={uploading} style={{
          background: "linear-gradient(135deg, var(--purple), var(--onion))",
          border: "none", borderRadius: 8, color: "#fff", cursor: uploading ? "not-allowed" : "pointer",
          padding: "0 16px", fontSize: 12, fontFamily: "var(--font-ui)", letterSpacing: 1,
          boxShadow: "0 0 16px rgba(124,58,237,0.5)", transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 6, opacity: uploading ? 0.5 : 1,
        }}>
          <Icon name="send" size={14} /> SEND
        </button>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <TimerInput value={timer} onChange={setTimer} />
        {uploading && <span className="uploading">Uploading image...</span>}
      </div>
    </div>
  );
}

// ─── Clear Chat Button ────────────────────────────────────────────────────────
function ClearChatButton({ onClear, disabled }) {
  return (
    <button onClick={onClear} disabled={disabled} style={{
      background: "rgba(239,68,68,0.2)",
      border: "1px solid var(--red)",
      borderRadius: 6,
      color: "var(--red)",
      cursor: disabled ? "not-allowed" : "pointer",
      padding: "4px 10px",
      fontSize: 10,
      fontFamily: "var(--font-ui)",
      letterSpacing: 1,
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}>
      <Icon name="delete" size={12} /> CLEAR ALL
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function UserView() {
  const userId = getGuestId();
  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    update(userRef(userId), { id: userId, lastSeen: Date.now() });
  }, [userId]);

  useEffect(() => {
    const unsub = onValue(msgsRef(), snap => {
      const data = snap.val() || {};
      const mine = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .filter(m => m.userId === userId && !m.deleted)
        .sort((a, b) => (a.ts || 0) - (b.ts || 0));
      setMessages(mine);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        let hasChanges = false;
        const updated = prev.map(msg => {
          if (msg.countdown == null || msg.countdown <= 0) return msg;
          if (msg.locked === true) return msg;
          
          const newCountdown = msg.countdown - 1;
          hasChanges = true;
          
          if (newCountdown <= 0) {
            update(msgRef(msg.id), { deleted: true });
            return { ...msg, countdown: 0, deleted: true };
          }
          
          update(msgRef(msg.id), { countdown: newCountdown });
          return { ...msg, countdown: newCountdown };
        });
        
        return hasChanges ? updated.filter(m => !m.deleted) : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  async function handleSendImage(file, timerSeconds) {
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      push(msgsRef(), {
        userId,
        from: "user",
        type: "image",
        imageUrl,
        ts: Date.now(),
        timerSeconds: timerSeconds || null,
        countdown: timerSeconds || null,
        locked: timerSeconds ? true : false,  // LOCK for receiver if timer exists
        deleted: false,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
    }
  }

  function handleSend(text, timerSeconds) {
    push(msgsRef(), {
      userId,
      from: "user",
      text,
      ts: Date.now(),
      timerSeconds: timerSeconds || null,
      countdown: timerSeconds || null,
      locked: timerSeconds ? true : false,  // LOCK for receiver if timer exists
      deleted: false,
    });
  }

  function handleUnlock(msgId) {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    update(msgRef(msgId), {
      locked: false,
      countdown: msg.timerSeconds || null,
    });
  }

  function handleDelete(msgId) {
    if (window.confirm("Delete this message?")) {
      update(msgRef(msgId), { deleted: true });
    }
  }

  function handleClearAll() {
    if (window.confirm("⚠️ DELETE ALL MESSAGES? This cannot be undone! ⚠️")) {
      messages.forEach(msg => {
        update(msgRef(msg.id), { deleted: true });
      });
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <div style={{
        padding: "12px 20px", background: "var(--panel)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
      }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ClearChatButton onClear={handleClearAll} disabled={!hasMessages} />
          <div style={{
            fontSize: 10, fontFamily: "var(--font-ui)", color: "var(--muted)",
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 20, padding: "4px 10px",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)" }} />
            {userId}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: "var(--muted)", fontFamily: "var(--font-ui)" }}>
            <Icon name="chat" size={40} style={{ color: "var(--border)", marginBottom: 12 }} />
            <div style={{ fontSize: 12, letterSpacing: 2 }}>BEGIN TRANSMISSION</div>
            <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6 }}>Send text or images with timers for secure messaging</div>
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble 
            key={msg.id} 
            msg={msg} 
            currentUserId={userId}
            isAdmin={false} 
            onUnlock={handleUnlock} 
            onDelete={handleDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <InputRow 
        onSend={handleSend} 
        onSendImage={handleSendImage}
        placeholder="TYPE YOUR MESSAGE..." 
        uploading={uploading}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [shake, setShake] = useState(false);

  function handleLogin() {
    // Email is DontBeACunt (exactly as you requested)
    if (email === "DontBeACunt" && pass === "admin123") {
      onLogin();
    } else {
      setErr("ACCESS DENIED — INVALID CREDENTIALS");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  const inp = {
    width: "100%", background: "var(--bg2)",
    border: "1px solid var(--border)", borderRadius: 8,
    color: "var(--text)", fontSize: 13, fontFamily: "var(--font-main)",
    padding: "12px 16px", marginBottom: 12, transition: "all 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at center, #0d0520 0%, var(--bg) 70%)",
    }}>
      <div style={{
        width: 360, padding: 36,
        background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 16,
        boxShadow: "var(--shadow), 0 0 80px rgba(124,58,237,0.2)",
        animation: shake ? "shakeAnim 0.5s" : "none",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo size="big" />
          <div style={{ marginTop: 12, fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-ui)", letterSpacing: 3 }}>
            ADMIN TERMINAL
          </div>
        </div>

        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-ui)", letterSpacing: 2, marginBottom: 6 }}>EMAIL</div>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="DontBeACunt" style={inp}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />

        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-ui)", letterSpacing: 2, marginBottom: 6 }}>PASSWORD</div>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)}
          placeholder="••••••••" style={inp}
          onKeyDown={e => e.key === "Enter" && handleLogin()} />

        {err && (
          <div style={{
            fontSize: 10, color: "var(--red)", fontFamily: "var(--font-ui)",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 6, padding: "8px 12px", marginBottom: 12, letterSpacing: 1,
          }}>⚠ {err}</div>
        )}

        <button onClick={handleLogin} style={{
          width: "100%", padding: 14,
          background: "linear-gradient(135deg, var(--purple), var(--onion))",
          border: "none", borderRadius: 8, color: "#fff", cursor: "pointer",
          fontSize: 12, fontFamily: "var(--font-head)", letterSpacing: 3, fontWeight: 700,
          boxShadow: "0 0 20px rgba(124,58,237,0.5)", transition: "all 0.2s",
        }}>
          AUTHENTICATE
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPanel({ onLogout }) {
  const [messages, setMessages]       = useState([]);
  const [users, setUsers]             = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = onValue(msgsRef(), snap => {
      const data = snap.val() || {};
      const all = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .filter(m => !m.deleted)
        .sort((a, b) => (a.ts || 0) - (b.ts || 0));
      setMessages(all);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onValue(usersRef(), snap => {
      const data = snap.val() || {};
      setUsers(Object.keys(data));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        let hasChanges = false;
        const updated = prev.map(msg => {
          if (msg.countdown == null || msg.countdown <= 0) return msg;
          if (msg.locked === true) return msg;
          
          const newCountdown = msg.countdown - 1;
          hasChanges = true;
          
          if (newCountdown <= 0) {
            update(msgRef(msg.id), { deleted: true });
            return { ...msg, countdown: 0, deleted: true };
          }
          
          update(msgRef(msg.id), { countdown: newCountdown });
          return { ...msg, countdown: newCountdown };
        });
        
        return hasChanges ? updated.filter(m => !m.deleted) : prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  const threadMessages = selectedUser
    ? messages.filter(m => m.userId === selectedUser)
    : [];

  async function handleSendImage(file, timerSeconds) {
    if (!selectedUser || !file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      push(msgsRef(), {
        userId: selectedUser,
        from: "admin",
        type: "image",
        imageUrl,
        ts: Date.now(),
        timerSeconds: timerSeconds || null,
        countdown: null,
        locked: timerSeconds ? true : false,  // LOCK for receiver if timer exists
        deleted: false,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
    }
  }

  function handleSend(text, timerSeconds) {
    if (!selectedUser) return;
    push(msgsRef(), {
      userId: selectedUser,
      from: "admin",
      text,
      ts: Date.now(),
      timerSeconds: timerSeconds || null,
      countdown: null,
      locked: timerSeconds ? true : false,  // LOCK for receiver if timer exists
      deleted: false,
    });
  }

  function handleUnlock(msgId) {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    update(msgRef(msgId), {
      locked: false,
      countdown: msg.timerSeconds || null,
    });
  }

  function handleDelete(msgId) {
    if (window.confirm("Delete this message?")) {
      update(msgRef(msgId), { deleted: true });
    }
  }

  function handleClearUserChat() {
    if (!selectedUser) return;
    if (window.confirm(`⚠️ DELETE ALL MESSAGES with ${selectedUser}? This cannot be undone! ⚠️`)) {
      const userMessages = messages.filter(m => m.userId === selectedUser);
      userMessages.forEach(msg => {
        update(msgRef(msg.id), { deleted: true });
      });
    }
  }

  const unreadCount = uid =>
    messages.filter(m => m.userId === uid && m.from !== "admin" && m.locked === true && m.timerSeconds > 0).length;

  const hasMessages = threadMessages.length > 0;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <div style={{
        width: sidebarOpen ? 220 : 52, flexShrink: 0,
        background: "var(--panel)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s ease", overflow: "hidden",
      }}>
        <div style={{
          padding: "12px 10px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
        }}>
          {sidebarOpen && (
            <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "var(--font-ui)", letterSpacing: 2, whiteSpace: "nowrap" }}>
              USERS ({users.length})
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "none", border: "1px solid var(--border)", color: "var(--muted)",
            borderRadius: 6, cursor: "pointer", padding: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={sidebarOpen ? "close" : "menu"} size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "6px 4px" }}>
          {users.map(uid => {
            const count = unreadCount(uid);
            const active = selectedUser === uid;
            return (
              <div key={uid} className="slide-in" onClick={() => setSelectedUser(uid)} style={{
                padding: sidebarOpen ? "8px 10px" : "8px 6px",
                borderRadius: 8, marginBottom: 4, cursor: "pointer",
                background: active ? "rgba(124,58,237,0.2)" : "transparent",
                border: `1px solid ${active ? "var(--purple)" : "transparent"}`,
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 8,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                position: "relative",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: active ? "var(--purple2)" : "var(--bg2)",
                  border: `1px solid ${active ? "var(--glow)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: active ? "0 0 10px rgba(168,85,247,0.5)" : "none",
                }}>
                  <Icon name="user" size={13} style={{ color: active ? "var(--glow)" : "var(--muted)" }} />
                </div>
                {sidebarOpen && (
                  <div style={{ overflow: "hidden", flex: 1 }}>
                    <div style={{ fontSize: 10, color: active ? "var(--glow2)" : "var(--text)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {uid}
                    </div>
                    {count > 0 && (
                      <div style={{ fontSize: 9, color: "var(--red)", marginTop: 1 }}>
                        🔒 {count} encrypted
                      </div>
                    )}
                  </div>
                )}
                {!sidebarOpen && count > 0 && (
                  <div style={{
                    position: "absolute", top: 2, right: 2,
                    width: 14, height: 14, borderRadius: "50%",
                    background: "var(--red)", fontSize: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff",
                  }}>{count}</div>
                )}
              </div>
            );
          })}
          {users.length === 0 && sidebarOpen && (
            <div style={{ padding: "20px 10px", textAlign: "center", fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-ui)" }}>
              NO USERS YET
            </div>
          )}
        </div>

        <div style={{ padding: 8, borderTop: "1px solid var(--border)" }}>
          <button onClick={onLogout} style={{
            width: "100%", background: "none",
            border: "1px solid var(--border)", borderRadius: 8,
            color: "var(--muted)", cursor: "pointer",
            padding: "8px 4px", fontSize: 10,
            fontFamily: "var(--font-ui)", letterSpacing: 1,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <Icon name="logout" size={13} />
            {sidebarOpen && "LOGOUT"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{
          padding: "12px 20px", background: "var(--panel)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selectedUser && (
              <ClearChatButton onClear={handleClearUserChat} disabled={!hasMessages} />
            )}
            {selectedUser ? (
              <div style={{
                fontSize: 10, fontFamily: "var(--font-ui)", color: "var(--glow)",
                background: "rgba(124,58,237,0.1)", border: "1px solid var(--purple)",
                borderRadius: 20, padding: "4px 12px",
              }}>
                CHATTING: {selectedUser}
              </div>
            ) : (
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-ui)", letterSpacing: 2 }}>
                SELECT A USER
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {!selectedUser ? (
            <div style={{ textAlign: "center", marginTop: 80, color: "var(--muted)" }}>
              <Icon name="user" size={44} style={{ color: "var(--border)" }} />
              <div style={{ fontSize: 12, fontFamily: "var(--font-ui)", letterSpacing: 2, marginTop: 12 }}>
                SELECT A USER FROM THE PANEL
              </div>
            </div>
          ) : threadMessages.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 80, color: "var(--muted)" }}>
              <div style={{ fontSize: 12, fontFamily: "var(--font-ui)", letterSpacing: 2 }}>NO MESSAGES YET</div>
              <div style={{ fontSize: 10, marginTop: 8, opacity: 0.6 }}>Send a message with a timer to encrypt it</div>
            </div>
          ) : (
            threadMessages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                msg={msg} 
                currentUserId="admin"
                isAdmin={true} 
                onUnlock={handleUnlock} 
                onDelete={handleDelete}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {selectedUser && (
          <InputRow 
            onSend={handleSend} 
            onSendImage={handleSendImage}
            placeholder={`REPLY TO ${selectedUser}...`}
            uploading={uploading}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [route, setRoute]           = useState(window.location.hash);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const isAdmin = route === "#/admin" || route === "#/admin.html";

  return (
    <>
      <style>{globalStyles}</style>
      <div className="scanline" />
      {isAdmin
        ? adminAuthed
          ? <AdminPanel onLogout={() => setAdminAuthed(false)} />
          : <AdminLogin onLogin={() => setAdminAuthed(true)} />
        : <UserView />
      }
    </>
  );
}