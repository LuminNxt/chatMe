/* AskMAC — Rail (left navigation) */

const Rail = ({ collapsed, onToggleCollapse, currentScreen, onSelectScreen, currentIncident, onSelectIncident, palette }) => {
  const D = window.AskMacData;

  return (
    <aside className="rail">
      <div className="rail-header">
        <div className="rail-logo">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 16V5l4 6 3-4 3 4 4-6v11" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <div className="rail-brand">AskMAC<sup>ENT</sup></div>
        <button className="rail-collapse" onClick={onToggleCollapse} aria-label="Collapse">
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={14} />
        </button>
      </div>

      <button className="rail-new" onClick={() => onSelectScreen("welcome")}>
        <Icon name="plus" size={14} />
        <span>New triage</span>
      </button>

      <div className="rail-section">
        <div className="rail-section-label"><span>Workspace</span></div>
        <div className="rail-nav">
          <button className="rail-item" aria-current={currentScreen === "inbox"} onClick={() => onSelectScreen("inbox")}>
            <Icon name="inbox" size={15} /><span>Inbox</span><span className="rail-count is-hot">3</span>
          </button>
          <button className="rail-item" aria-current={currentScreen === "active"} onClick={() => onSelectScreen("conversation")}>
            <Icon name="activity" size={15} /><span>Active incidents</span><span className="rail-count">7</span>
          </button>
          <button className="rail-item" aria-current={currentScreen === "resolved"} onClick={() => onSelectScreen("resolved")}>
            <Icon name="check" size={15} /><span>Resolved</span><span className="rail-count">142</span>
          </button>
          <button className="rail-item" aria-current={currentScreen === "runbooks"} onClick={() => onSelectScreen("runbooks")}>
            <Icon name="runbook" size={15} /><span>Runbooks</span>
          </button>
          <button className="rail-item" aria-current={currentScreen === "topology"} onClick={() => onSelectScreen("topology")}>
            <Icon name="network" size={15} /><span>Service map</span>
          </button>
        </div>
      </div>

      <div className="rail-section" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div className="rail-section-label"><span>Recent triage</span><Icon name="chevronDown" size={12} /></div>
        <div className="rail-history">
          {D.history.map(h => (
            <button
              key={h.id}
              className="history-item"
              aria-current={currentIncident === h.id}
              onClick={() => onSelectIncident(h.id)}
            >
              <div className="history-title">
                <span className="sev-dot" data-sev={h.sev}></span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</span>
              </div>
              <div className="history-meta">
                <span>{h.id}</span>
                <span>·</span>
                <span>{h.time}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rail-footer">
        <div className="avatar">{D.user.initials}</div>
        <div className="user-info">
          <div className="user-name">{D.user.name}</div>
          <div className="user-role">{D.user.role}</div>
        </div>
        <div className="rail-status-dot" title="On-call active"></div>
      </div>
    </aside>
  );
};

window.Rail = Rail;
