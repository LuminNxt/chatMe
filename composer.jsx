/* AskMAC — Composer */

const Composer = ({ value, onChange, onSend, mode, onModeChange, disabled }) => {
  const taRef = React.useRef(null);
  React.useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(180, taRef.current.scrollHeight) + "px";
    }
  }, [value]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const modes = [
    { id: "triage", label: "Smart Triage", icon: "sparkles" },
    { id: "runbook", label: "Runbook", icon: "runbook" },
    { id: "knowledge", label: "Knowledge", icon: "book" },
    { id: "comms", label: "Comms Draft", icon: "megaphone" },
  ];

  return (
    <div className="composer-wrap">
      <div className="composer">
        <div className="mode-tabs">
          {modes.map(m => (
            <button
              key={m.id}
              className="mode-tab"
              aria-pressed={mode === m.id}
              onClick={() => onModeChange(m.id)}
            >
              <Icon name={m.icon} size={13} />{m.label}
            </button>
          ))}
        </div>
        <div className="composer-input-wrap">
          <textarea
            ref={taRef}
            className="composer-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe the symptom, paste an alert, or ask a question — e.g. ‘checkout 5xx after 14:07 deploy’"
            rows={1}
          />
          <div className="composer-bar">
            <button className="compose-tool"><Icon name="at" size={12} />Mention service</button>
            <button className="compose-tool"><Icon name="paperclip" size={12} />Attach</button>
            <button className="compose-tool"><Icon name="slash" size={12} />Commands</button>
            <span className="compose-spacer"></span>
            <span className="compose-hint"><kbd>↵</kbd> send · <kbd>⇧↵</kbd> newline</span>
            <button className="send-btn" disabled={disabled || !value.trim()} onClick={onSend} aria-label="Send">
              <Icon name="arrowUp" size={14} />
            </button>
          </div>
        </div>
        <div className="composer-footnote">
          AskMAC will request approval before any production action · all activity logged to incident timeline
        </div>
      </div>
    </div>
  );
};

window.Composer = Composer;
