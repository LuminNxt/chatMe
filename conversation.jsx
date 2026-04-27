/* AskMAC — Conversation view */

const ReasoningBlock = ({ reasoning, defaultOpen = true, done = true, runningStepIdx = -1 }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={`reasoning ${done ? "done" : ""}`} data-open={open}>
      <button className="reasoning-header" onClick={() => setOpen(!open)}>
        <div className="reasoning-icon">
          <Icon name={done ? "sparkles" : "spinner"} size={13} />
        </div>
        <div className="reasoning-title">
          <span>{done ? reasoning.title : "Investigating…"}</span>
          {!done && <span className="caret" style={{ height: 10, width: 4 }}></span>}
        </div>
        <span className="reasoning-time">{reasoning.duration}</span>
        <span className="reasoning-toggle"><Icon name="chevronDown" size={13} /></span>
      </button>
      <div className="reasoning-body">
        <div>
          <div className="reasoning-inner">
            {reasoning.steps.map((s, i) => {
              const state = !done && i > runningStepIdx ? "pending"
                          : !done && i === runningStepIdx ? "running"
                          : "done";
              return (
                <div key={i} className={`tool-step is-${state}`}>
                  <div className="tool-step-bullet"><div className="tool-step-dot"></div></div>
                  <div className="tool-step-body">
                    <div className="tool-step-head">
                      <span className="tool-step-name">{s.name}</span>
                      <span className="tool-step-tool">{s.tool}</span>
                      <span className="tool-step-dur">{state === "done" ? s.dur : state === "running" ? "…" : ""}</span>
                    </div>
                    {state !== "pending" && (
                      <>
                        <div className="tool-step-detail">{s.detail}</div>
                        {state === "done" && (
                          <div className="tool-step-result">
                            {s.result.map((r, j) => (
                              <span key={j} className="tool-result-pill" data-tone={r.tone}>
                                {r.label}: <strong>{r.value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const FindingCard = () => (
  <div className="finding-card">
    <div className="finding-head">
      <span className="badge">FINDING</span>
      <span className="finding-title">Connection-pool exhaustion in payments-gateway</span>
      <span className="finding-confidence">confidence <strong>94%</strong></span>
    </div>
    <div className="finding-body">
      <div className="finding-row">
        <span className="finding-label">Trigger</span>
        <span className="finding-value">Deploy <code>9f3c1ab</code> at 14:07 UTC by @m.singh</span>
      </div>
      <div className="finding-row">
        <span className="finding-label">Failing call</span>
        <span className="finding-value"><code>POST /v2/checkout/confirm</code> → <code>payments-gateway</code></span>
      </div>
      <div className="finding-row">
        <span className="finding-label">Symptom</span>
        <span className="finding-value">Pool 200/200 saturated · queue 1,847 · p99 8.4s</span>
      </div>
      <div className="finding-row">
        <span className="finding-label">Blast radius</span>
        <span className="finding-value">checkout-svc, cart-svc — ~12.4K affected sessions</span>
      </div>
    </div>
  </div>
);

const renderRich = (text) => {
  // bold + code support
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
};

const Message = ({ m, streaming = false, streamedChars = 0, runningStepIdx = -1, reasoningDone = true, showReasoning = true, onAction }) => {
  if (m.role === "user") {
    return (
      <div className="msg user">
        <div className="msg-avatar">{window.AskMacData.user.initials}</div>
        <div className="msg-body">
          <div className="msg-meta">
            <span className="msg-author">{m.author}</span>
            <span className="msg-time">{m.time} UTC</span>
          </div>
          <div className="msg-content"><p>{m.content}</p></div>
        </div>
      </div>
    );
  }

  // Agent — content is array of blocks
  const blocks = Array.isArray(m.content) ? m.content : [{ kind: "p", text: m.content }];

  // Streaming: char-count gate
  let charsRemaining = streaming ? streamedChars : Infinity;
  const renderedBlocks = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (charsRemaining <= 0 && streaming) break;
    if (b.kind === "p") {
      const text = b.text;
      if (charsRemaining >= text.length) {
        renderedBlocks.push(<p key={i}>{renderRich(text)}</p>);
        charsRemaining -= text.length;
      } else {
        const partial = text.slice(0, Math.max(0, charsRemaining));
        renderedBlocks.push(
          <p key={i}>
            {renderRich(partial)}
            {streaming && <span className="caret"></span>}
          </p>
        );
        charsRemaining = 0;
      }
    } else if (b.kind === "ul") {
      const itemsText = b.items.join(" ");
      if (charsRemaining >= itemsText.length || !streaming) {
        renderedBlocks.push(<ul key={i}>{b.items.map((it, j) => <li key={j}>{renderRich(it)}</li>)}</ul>);
        charsRemaining -= itemsText.length;
      } else {
        // skip until next stream tick
        break;
      }
    } else if (b.kind === "finding") {
      renderedBlocks.push(<FindingCard key={i} />);
    } else if (b.kind === "actions") {
      renderedBlocks.push(
        <div key={i} className="action-row">
          <button className="act-btn primary" onClick={() => onAction && onAction("rollback")}>
            <Icon name="play" size={13} />Approve rollback
          </button>
          <button className="act-btn" onClick={() => onAction && onAction("status")}>
            <Icon name="megaphone" size={13} />Review status update
          </button>
          <button className="act-btn" onClick={() => onAction && onAction("page")}>
            <Icon name="pager" size={13} />Page @payments-oncall
          </button>
          <button className="act-btn" onClick={() => onAction && onAction("similar")}>
            <Icon name="history" size={13} />View INC-3914
          </button>
        </div>
      );
    }
  }

  return (
    <div className="msg agent">
      <div className="msg-avatar">
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M3 13V4l3 5 2-3 2 3 3-5v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
      <div className="msg-body">
        <div className="msg-meta">
          <span className="msg-author">{m.author}</span>
          <span className="msg-time">{m.time} UTC</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-subtle)",
            padding: "1px 6px", borderRadius: 4, background: "var(--accent-soft)", color: "var(--accent)",
          }}>AGENT · sonnet-4.5</span>
        </div>
        {m.reasoning && showReasoning && (
          <ReasoningBlock
            reasoning={m.reasoning}
            done={reasoningDone}
            runningStepIdx={runningStepIdx}
            defaultOpen={true}
          />
        )}
        <div className="msg-content">{renderedBlocks}</div>
      </div>
    </div>
  );
};

const IncidentBanner = ({ inc }) => (
  <div className="incident-banner">
    <div className="banner-icon"><Icon name="flame" size={18} /></div>
    <div className="banner-meta">
      <div className="banner-id">{inc.id} · started {inc.started} · running {inc.duration}</div>
      <div className="banner-title">{inc.title}</div>
    </div>
    <div className="banner-stats">
      <span className="banner-stat">impacted <strong>{inc.impactedUsers}</strong></span>
      <span className="banner-stat">services <strong>{inc.services.length}</strong></span>
    </div>
    <span className="sev-pill" data-sev="1">SEV-1</span>
  </div>
);

const Conversation = ({ messages, streamState, showReasoning, onAction }) => {
  const D = window.AskMacData;
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });
  return (
    <div className="conversation">
      <IncidentBanner inc={D.activeIncident} />
      {messages.map((m, i) => {
        const isLast = i === messages.length - 1;
        const isStreaming = streamState && streamState.streaming && isLast && m.role === "agent";
        return (
          <Message
            key={i}
            m={m}
            streaming={isStreaming}
            streamedChars={isStreaming ? streamState.chars : Infinity}
            runningStepIdx={isStreaming ? streamState.runningStep : -1}
            reasoningDone={!isStreaming || streamState.reasoningDone}
            showReasoning={showReasoning}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
};

window.Conversation = Conversation;
window.Message = Message;
