/* AskMAC — Main App */

const App = () => {
  const D = window.AskMacData;

  // Tweaks-controlled defaults — must be valid JSON between markers
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "palette": "aurora",
    "mode": "light",
    "showReasoning": true,
    "persona": "balanced",
    "defaultMode": "triage"
  }/*EDITMODE-END*/;

  const [T, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [screen, setScreen] = React.useState("welcome");
  const [currentIncident, setCurrentIncident] = React.useState(null);
  const [railCollapsed, setRailCollapsed] = React.useState(false);
  const [composerVal, setComposerVal] = React.useState("");
  const [composerMode, setComposerMode] = React.useState(T.defaultMode || "triage");
  const [messages, setMessages] = React.useState([]);
  const [streamState, setStreamState] = React.useState({ streaming: false, chars: 0, runningStep: -1, reasoningDone: false });

  // Apply theme to root
  React.useEffect(() => {
    document.documentElement.dataset.palette = T.palette;
    document.documentElement.dataset.mode = T.mode;
  }, [T.palette, T.mode]);

  // Persona note (changes the welcome sub copy / agent intro)
  const personaCopy = {
    balanced: "your incident-triage agent. I correlate signals across your stack, execute approved runbooks, and draft comms.",
    concise: "incident triage. I find root cause, propose action, and ship it once you approve. No fluff.",
    teacher: "your triage partner. I'll walk you through what I'm seeing, why it matters, and what we should try next.",
    senior: "an SRE-grade agent. I'll diagnose root cause, weigh trade-offs, and recommend the lowest-risk path to mitigation.",
  };

  // Handle prompts / capability click → start streamed conversation
  const startScriptedTriage = () => {
    const userMsg = D.conversation[0];
    const agentMsg = D.conversation[1];
    setMessages([userMsg]);
    setScreen("conversation");
    setCurrentIncident(D.activeIncident.id);

    // Begin agent reply animation
    setTimeout(() => {
      setMessages([userMsg, { ...agentMsg, content: agentMsg.content }]);
      setStreamState({ streaming: true, chars: 0, runningStep: 0, reasoningDone: false });

      // Step through tool calls
      const totalSteps = agentMsg.reasoning.steps.length;
      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        stepIdx += 1;
        if (stepIdx >= totalSteps) {
          clearInterval(stepInterval);
          setStreamState(s => ({ ...s, runningStep: totalSteps, reasoningDone: true }));
          // After reasoning, stream content
          let chars = 0;
          const totalChars = agentMsg.content
            .filter(b => b.kind === "p" || b.kind === "ul")
            .reduce((acc, b) => acc + (b.kind === "p" ? b.text.length : b.items.join(" ").length), 0);
          const charInterval = setInterval(() => {
            chars += 18;
            setStreamState(s => ({ ...s, chars }));
            if (chars >= totalChars + 50) {
              clearInterval(charInterval);
              setStreamState({ streaming: false, chars: Infinity, runningStep: -1, reasoningDone: true });
            }
          }, 24);
        } else {
          setStreamState(s => ({ ...s, runningStep: stepIdx }));
        }
      }, 850);
    }, 600);
  };

  // Send a free-form message (uses Claude for live reply if not the scripted prompt)
  const handleSend = async () => {
    const text = composerVal.trim();
    if (!text) return;

    // If it sounds like the scripted incident, run the rich scripted flow
    const lower = text.toLowerCase();
    const isScripted = lower.includes("inc-4821") || lower.includes("checkout") || lower.includes("5xx");

    if (isScripted && messages.length === 0) {
      setComposerVal("");
      startScriptedTriage();
      return;
    }

    // Otherwise — live reply from Claude
    const userMsg = {
      role: "user", author: D.user.name,
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      content: text,
    };
    const placeholder = {
      role: "agent", author: "AskMAC",
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      content: [{ kind: "p", text: "" }],
      reasoning: {
        title: "Investigating · 3 tools called",
        duration: "—",
        steps: [
          { name: "Parse intent", tool: "nlp.classify", detail: text.slice(0, 80), result: [{ label: "intent", value: "incident.query" }], dur: "0.3s" },
          { name: "Search telemetry", tool: "datadog.query", detail: "scanning relevant services…", result: [{ label: "matches", value: "—" }], dur: "0.8s" },
          { name: "Compose response", tool: "llm.generate", detail: "drafting answer", result: [{ label: "tokens", value: "—" }], dur: "0.4s" },
        ],
      },
    };

    const newMessages = [...messages, userMsg, placeholder];
    setMessages(newMessages);
    setScreen("conversation");
    setComposerVal("");
    setStreamState({ streaming: true, chars: 0, runningStep: 0, reasoningDone: false });

    // Step animation
    setTimeout(() => setStreamState(s => ({ ...s, runningStep: 1 })), 400);
    setTimeout(() => setStreamState(s => ({ ...s, runningStep: 2 })), 900);
    setTimeout(() => setStreamState(s => ({ ...s, runningStep: 3, reasoningDone: true })), 1400);

    // Call Claude
    try {
      const persona = personaCopy[T.persona] || personaCopy.balanced;
      const reply = await window.claude.complete({
        messages: [{
          role: "user",
          content: `You are AskMAC, an enterprise incident-triage agent (${persona}).
Respond to the SRE engineer's message in 2-4 short paragraphs. Be concrete, name plausible services/metrics/tools (Datadog, Grafana, Tempo, Kafka, Postgres). If they ask about an incident, propose a root-cause hypothesis, evidence to gather, and a remediation step. Use **bold** for emphasis and \`code\` for service/metric names. Don't use bullet lists.

Engineer message: ${text}`
        }],
      });

      // Convert reply to blocks
      const paragraphs = reply.split(/\n\n+/).map(p => ({ kind: "p", text: p.trim() })).filter(b => b.text);

      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: paragraphs };
        return copy;
      });

      // Stream the chars
      const totalChars = paragraphs.reduce((a, b) => a + b.text.length, 0);
      let chars = 0;
      const ci = setInterval(() => {
        chars += 18;
        setStreamState(s => ({ ...s, chars }));
        if (chars >= totalChars + 50) {
          clearInterval(ci);
          setStreamState({ streaming: false, chars: Infinity, runningStep: -1, reasoningDone: true });
        }
      }, 24);
    } catch (e) {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          ...copy[copy.length - 1],
          content: [{ kind: "p", text: "I couldn't reach my reasoning service. Try again, or run `/runbook` to use cached playbooks." }],
        };
        return copy;
      });
      setStreamState({ streaming: false, chars: Infinity, runningStep: -1, reasoningDone: true });
    }
  };

  const handlePromptClick = (text) => {
    setComposerVal(text);
    setTimeout(() => {
      // Auto-send only for the canonical INC-4821 prompt (gives the rich scripted demo)
      if (text.toLowerCase().includes("inc-4821")) {
        startScriptedTriage();
        setComposerVal("");
      }
    }, 60);
  };

  const handleCapability = (cap) => {
    handlePromptClick(`Help me with: ${cap.title}. ${cap.desc}`);
  };

  const handleAction = (action) => {
    const ack = {
      rollback: "✓ Rollback approved — executing `payments-gateway → 4d2e8c1`. ETA 3 min.",
      status: "✓ Status page draft opened in side panel.",
      page: "✓ Paged @payments-oncall (Maya Singh). ACK pending.",
      similar: "Opening INC-3914 timeline in new tab…",
    }[action];
    setMessages(m => [...m, {
      role: "agent", author: "AskMAC",
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      content: [{ kind: "p", text: ack }],
    }]);
  };

  const showWelcome = screen === "welcome" || (screen !== "conversation" && messages.length === 0);

  return (
    <div className="app" data-rail-collapsed={railCollapsed}>
      <Rail
        collapsed={railCollapsed}
        onToggleCollapse={() => setRailCollapsed(!railCollapsed)}
        currentScreen={screen}
        onSelectScreen={(s) => {
          if (s === "welcome") {
            setMessages([]);
            setCurrentIncident(null);
          }
          setScreen(s);
        }}
        currentIncident={currentIncident}
        onSelectIncident={(id) => {
          setCurrentIncident(id);
          if (id === "INC-4821") startScriptedTriage();
        }}
        palette={T.palette}
      />

      <div className="main">
        <TopBar
          screen={showWelcome ? "welcome" : screen}
          theme={T.mode}
          onTheme={(m) => setTweak("mode", m)}
        />

        <div className="viewport">
          <div className="viewport-inner">
            {showWelcome ? (
              <Welcome
                user={D.user}
                onPrompt={handlePromptClick}
                onCapability={handleCapability}
              />
            ) : (
              <Conversation
                messages={messages}
                streamState={streamState}
                showReasoning={T.showReasoning}
                onAction={handleAction}
              />
            )}
          </div>
        </div>

        <Composer
          value={composerVal}
          onChange={setComposerVal}
          onSend={handleSend}
          mode={composerMode}
          onModeChange={setComposerMode}
          disabled={streamState.streaming}
        />
      </div>

      <AskMacTweaks T={T} setTweak={setTweak} />
    </div>
  );
};

const AskMacTweaks = ({ T, setTweak }) => {
  if (typeof TweaksPanel === "undefined") return null;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Color palette">
        <TweakRadio
          value={T.palette}
          onChange={(v) => setTweak("palette", v)}
          options={[
            { value: "aurora", label: "Aurora" },
            { value: "nebula", label: "Nebula" },
            { value: "ember", label: "Ember" },
          ]}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
          {[
            { id: "aurora", c1: "oklch(48% 0.18 268)", c2: "oklch(72% 0.16 215)", c3: "oklch(78% 0.16 75)" },
            { id: "nebula", c1: "oklch(45% 0.2 305)", c2: "oklch(62% 0.24 350)", c3: "oklch(78% 0.16 85)" },
            { id: "ember", c1: "oklch(52% 0.2 25)", c2: "oklch(38% 0.13 255)", c3: "oklch(86% 0.08 75)" },
          ].map(p => (
            <button key={p.id} onClick={() => setTweak("palette", p.id)} style={{
              border: T.palette === p.id ? "2px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: 8, padding: 8, background: "var(--surface)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer"
            }}>
              <div style={{ display: "flex", gap: 3 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: p.c1 }}></span>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: p.c2 }}></span>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: p.c3 }}></span>
              </div>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "capitalize" }}>{p.id}</span>
            </button>
          ))}
        </div>
      </TweakSection>

      <TweakSection title="Theme">
        <TweakRadio
          value={T.mode}
          onChange={(v) => setTweak("mode", v)}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </TweakSection>

      <TweakSection title="Agent persona">
        <TweakSelect
          value={T.persona}
          onChange={(v) => setTweak("persona", v)}
          options={[
            { value: "balanced", label: "Balanced — collaborative" },
            { value: "concise", label: "Concise — minimal output" },
            { value: "teacher", label: "Teacher — explain reasoning" },
            { value: "senior", label: "Senior SRE — risk-weighted" },
          ]}
        />
      </TweakSection>

      <TweakSection title="Reasoning visibility">
        <TweakToggle
          checked={T.showReasoning}
          onChange={(v) => setTweak("showReasoning", v)}
          label="Show agent thinking & tool calls"
        />
      </TweakSection>
    </TweaksPanel>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
