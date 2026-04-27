/* AskMAC — Top bar */

const TopBar = ({ screen, theme, onTheme, onPanel }) => {
  const breadcrumbs = {
    welcome: ["Triage", "New session"],
    conversation: ["Triage", "Active", "INC-4821"],
    inbox: ["Triage", "Inbox"],
    resolved: ["Triage", "Resolved"],
    runbooks: ["Triage", "Runbooks"],
    topology: ["Triage", "Service map"],
  }[screen] || ["Triage"];

  return (
    <div className="topbar">
      <div className="crumbs">
        {breadcrumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep"><Icon name="chevronRight" size={11} /></span>}
            {i === breadcrumbs.length - 1
              ? <strong>{c}</strong>
              : <span>{c}</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-status">
        <span className="pulse"></span>
        <span>All agents healthy · 42ms</span>
      </div>

      <div className="topbar-spacer"></div>

      <div className="theme-toggle">
        <button aria-pressed={theme === "light"} onClick={() => onTheme("light")}>
          <Icon name="sun" size={12} />Light
        </button>
        <button aria-pressed={theme === "dark"} onClick={() => onTheme("dark")}>
          <Icon name="moon" size={12} />Dark
        </button>
      </div>

      <button className="topbar-action has-badge" aria-label="Notifications">
        <Icon name="bell" size={16} />
      </button>
      <button className="topbar-action" aria-label="Settings">
        <Icon name="settings" size={16} />
      </button>
    </div>
  );
};

window.TopBar = TopBar;
