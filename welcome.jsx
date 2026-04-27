/* AskMAC — Welcome / Empty State */

const Welcome = ({ user, onPrompt, onCapability }) => {
  const D = window.AskMacData;
  return (
    <div className="welcome">
      <div className="welcome-status">
        <span className="live-dot"></span>
        <span>Connected · 14 telemetry sources · runbook v3.2.1</span>
      </div>

      <div className="welcome-mark">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M5 28V8l8 12 5-7 5 7 8-12v20" stroke="white" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      <h1>Welcome back, <span className="highlight">{user.name.split(" ")[0]}</span></h1>
      <p className="welcome-sub">
        I'm AskMAC — your incident-triage agent. I can correlate signals across your stack,
        execute approved runbooks, and draft comms while you stay focused on the call.
      </p>

      <div className="cap-grid">
        {D.capabilities.map((c, i) => (
          <button key={i} className="cap-card" data-tone={c.tone} onClick={() => onCapability(c)}>
            <div className="cap-icon"><Icon name={c.icon} size={17} /></div>
            <div className="cap-title">{c.title}</div>
            <div className="cap-desc">{c.desc}</div>
          </button>
        ))}
      </div>

      <div className="prompts-section">
        <div className="prompts-label">Try one of these</div>
        <div className="prompts">
          {D.prompts.map((p, i) => (
            <button key={i} className="prompt-chip" onClick={() => onPrompt(p.text)}>
              <Icon name={p.icon} size={15} />
              <div className="prompt-chip-text">
                <div>{p.text}</div>
                <div className="prompt-chip-sub">{p.sub}</div>
              </div>
              <Icon name="arrowUp" size={13} style={{ transform: "rotate(45deg)" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Welcome = Welcome;
