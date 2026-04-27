/* Demo data for AskMAC */

window.AskMacData = {
  user: { name: "KA", role: "SRE · Tier 2", initials: "KA" },

  history: [
    { id: "INC-4821", title: "Payments 5xx spike — checkout-svc", sev: 1, time: "2m ago", active: true },
    { id: "INC-4815", title: "Kafka consumer lag → orders pipeline", sev: 2, time: "1h ago" },
    { id: "INC-4807", title: "Redis eviction storm", sev: "resolved", time: "Today" },
    { id: "INC-4801", title: "Postgres replica lag — analytics-db-2", sev: 3, time: "Today" },
    { id: "INC-4794", title: "TLS cert expiring · auth.api", sev: 2, time: "Yesterday" },
    { id: "INC-4788", title: "CDN egress anomaly — eu-west-1", sev: "resolved", time: "Yesterday" },
    { id: "INC-4772", title: "OOMKilled — recommender-v3", sev: "resolved", time: "2d ago" },
    { id: "INC-4761", title: "Cassandra repair backlog", sev: "resolved", time: "3d ago" },
  ],

  capabilities: [
    { tone: 1, icon: "explore", title: "Root cause analysis", desc: "Correlate logs, traces, and metrics across services to localize the failure." },
    { tone: 2, icon: "runbook", title: "Runbook execution", desc: "Suggest and run remediation steps with approval gates and audit trail." },
    { tone: 3, icon: "history", title: "Similar past incidents", desc: "Vector search over postmortems to surface the closest historical match." },
    { tone: 1, icon: "pager", title: "Escalation routing", desc: "Page the right on-call based on service ownership and severity." },
    { tone: 2, icon: "network", title: "Service map awareness", desc: "Reason over topology to find blast radius and upstream dependencies." },
    { tone: 3, icon: "docs", title: "Postmortem drafts", desc: "Generate timeline, contributing factors, and action items in your template." },
    { tone: 1, icon: "megaphone", title: "Stakeholder comms", desc: "Draft status page, exec, Slack and email updates tuned to each audience." },
    { tone: 2, icon: "git", title: "Change correlation", desc: "Match incident onset against deploys, feature flags, and config changes." },
  ],

  prompts: [
    { icon: "flame", text: "Triage INC-4821 — checkout 5xx spike", sub: "/incident triage" },
    { icon: "chart", text: "Show me anomalous metrics in the last 30 min", sub: "/metrics anomaly" },
    { icon: "history", text: "Find similar incidents to this Kafka lag", sub: "/find similar" },
    { icon: "megaphone", text: "Draft a status page update for active SEV-1", sub: "/comms draft" },
  ],

  // Active conversation script — one user turn, one streamed agent reply
  activeIncident: {
    id: "INC-4821",
    title: "Payments 5xx spike — checkout-svc · prod / us-east-1",
    severity: 1,
    started: "14:08 UTC",
    duration: "00:14:32",
    services: ["checkout-svc", "payments-gateway", "user-auth"],
    impactedUsers: "~12.4K",
  },

  conversation: [
    {
      role: "user",
      author: "Kotti Anil",
      time: "14:22",
      content: "Triage INC-4821. Checkout is throwing 5xx — what's going on and what should I do first?",
    },
    {
      role: "agent",
      author: "TestAgent",
      time: "14:22",
      reasoning: {
        title: "Investigating · 6 tools called",
        duration: "8.2s",
        steps: [
          {
            name: "Pull recent error metrics",
            tool: "datadog.query",
            detail: "service:checkout-svc env:prod status:5xx | last(15m)",
            result: [
              { label: "5xx rate", value: "12.8%", tone: "bad" },
              { label: "baseline", value: "0.04%" },
              { label: "onset", value: "14:08 UTC", tone: "warn" },
            ],
            dur: "1.1s",
          },
          {
            name: "Trace top failing endpoint",
            tool: "tempo.search",
            detail: "POST /v2/checkout/confirm — 1,284 traces · sample 50",
            result: [
              { label: "p99 latency", value: "8420 ms", tone: "bad" },
              { label: "downstream", value: "payments-gateway", tone: "warn" },
              { label: "error", value: "ConnectionPoolTimeout" },
            ],
            dur: "1.6s",
          },
          {
            name: "Inspect downstream service",
            tool: "service.health",
            detail: "payments-gateway · pool=db.transactions",
            result: [
              { label: "active conns", value: "200/200", tone: "bad" },
              { label: "wait queue", value: "1,847" },
              { label: "host", value: "pg-tx-primary" },
            ],
            dur: "0.9s",
          },
          {
            name: "Correlate with deploys/changes",
            tool: "deploy.diff",
            detail: "window=14:00–14:15 UTC · all services in blast radius",
            result: [
              { label: "deploys", value: "1", tone: "warn" },
              { label: "service", value: "payments-gateway" },
              { label: "sha", value: "9f3c1ab" },
              { label: "by", value: "@m.singh" },
            ],
            dur: "0.7s",
          },
          {
            name: "Search similar past incidents",
            tool: "memory.search",
            detail: "vector_query: \"payments connection pool exhaustion after deploy\"",
            result: [
              { label: "match", value: "INC-3914", tone: "warn" },
              { label: "similarity", value: "94%" },
              { label: "resolved by", value: "rollback + pool tuning" },
            ],
            dur: "2.3s",
          },
          {
            name: "Compose remediation plan",
            tool: "runbook.compose",
            detail: "from: rb-payments-degradation-v3 · with deploy correlation",
            result: [
              { label: "steps", value: "4" },
              { label: "approval", value: "required" },
              { label: "ETA to mitigate", value: "~3 min" },
            ],
            dur: "1.6s",
          },
        ],
      },
      content: [
        { kind: "p", text: "**Root cause (94% confidence):** A deploy of `payments-gateway @ 9f3c1ab` at **14:07 UTC** introduced a connection-pool regression. The pool to `pg-tx-primary` is fully saturated (200/200), causing `ConnectionPoolTimeout` errors that cascade to `checkout-svc` as 5xx responses." },
        { kind: "finding" },
        { kind: "p", text: "**This pattern matches `INC-3914` (94% similarity)** — same service, same fix path. Recommended sequence:" },
        { kind: "ul", items: [
          "Roll back `payments-gateway` to `4d2e8c1` (last green) — mitigates in ~3 min",
          "Bump pool size to 400 on `pg-tx-primary` as immediate buffer",
          "Page `@payments-oncall` (Maya Singh is already on this channel)",
          "Draft status-page update — I have a copy ready for review",
        ]},
        { kind: "p", text: "I can execute step 1 with one approval. Want me to proceed?" },
        { kind: "actions" },
      ],
    },
  ],
};
