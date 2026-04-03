import { useEffect, useRef, useState } from "react";
import refreshIcon from "../assets/refresh.png";
import Previous from "../assets/previous.png";
import profile from "../assets/ChatProfile.png";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 0, from: "bot", text: "Hello! I'm Sanket. How can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const endRef = useRef(null);

  useEffect(() => { 
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const addMessage = (from, text) => {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), from, text }]);
  };

  const send = async () => {
    const question = input.trim();
    if (!question) return;
    setInput("");
    addMessage("user", question);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8081/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        const detail =
          (data && (data.error || data.message || data.detail)) ||
          raw ||
          res.statusText ||
          `Server error ${res.status}`;
        throw new Error(detail);
      }

      const answer =
        (data && (data.answer || data?.choices?.[0]?.message?.content)) ||
        "No answer returned.";
      addMessage("bot", String(answer));
    } catch (err) {
      console.error("Chat error:", err);
      const message = err?.message || "Failed to call chat backend.";
      setError(message);
      addMessage("bot", "Sorry — I couldn't fetch an answer. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button + chat window container */}
      <div style={styles.container}>
        {open && (
          <div style={styles.chatWindow} role="dialog" aria-label="Chat Bot">
            <div style={styles.header}>
              <div style={{ fontWeight: 600 }}>Sanket</div>
              <div style={{ ...styles.headerBtns, gap: 0.1 }}>
                <button
                  title="Clear"
                  onClick={() =>
                    setMessages([
                      { id: 0, from: "bot", text: "Hello! I'm Sanket. How can I help you today?" },
                    ])
                  }
                  style={styles.iconBtn}
                >
                  <img src={refreshIcon} alt="Clear" style={{ width: 25 }} />
                </button>
                <button title="Close" onClick={() => setOpen(false)} style={styles.iconBtn}>
                  <img src={Previous} alt="Close" style={{ width: 25 }} />
                </button>
              </div>
            </div>

            <div style={styles.messages}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: m.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "8px 12px",
                      borderRadius: 12,
                      background: m.from === "user" ? "#0d6efd" : "#f1f3f5",
                      color: m.from === "user" ? "white" : "rgba(78, 154, 187, 1)",
                      whiteSpace: "pre-wrap",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.29)",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div style={styles.inputArea}>
              <textarea
                rows={2}
                placeholder="Type a question and press Enter..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                style={styles.textarea}
                disabled={loading}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={send}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? <img src="https://media.tenor.com/EvGxn5MXOTgAAAAi/loading.gif" alt="Loading" style={{ width: 35 }} /> : "Send"}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setInput("");
                  }}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
              {error && <div style={styles.error}>Error: {error}</div>}
            </div>
          </div>
        )}

        {/* Floating icon */}
        <button
          aria-label={open ? "Close chat" : "Open chat"}
          title={open ? "Close chat" : "Open chat"}
          onClick={() => setOpen((v) => !v)}
          style={{
            ...styles.fab,
            transform: open ? "rotate(0deg)" : "none",
            boxShadow: "0 6px 18px rgba(163, 100, 37, 0.86)",
          }}
        > 
          <img src={profile} alt="Sanket" style={{ width: 55, margin: "-32px 0px 45px -30px" }} />
        </button>
      </div>
    </>
  );
}

const styles = {
  container: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 9999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    background: "#0d6efd",
    color: "white",
    fontSize: 24,
    cursor: "pointer",
  },
  chatWindow: {
    width: 320,
    height: 420,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 12px 40px rgba(2,6,23,0.12)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "10px 12px",
    borderBottom: "1px solid #eef1f4",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
  },
  headerBtns: { display: "flex", gap: 6, alignItems: "center" },
  iconBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 14,
  },
  messages: {
    padding: 12,
    flex: 1,
    overflowY: "auto",
    background: "#fafbfc",
  },
  inputArea: {
    padding: 12,
    borderTop: "1px solid #eef1f4",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    resize: "none",
    borderRadius: 8,
    padding: 8,
    border: "1px solid #e6e9ee",
    fontSize: 14,
    outline: "none",
  },
  error: {
    marginTop: 8,
    color: "#b12d2d",
    fontSize: 13,
  },
};
