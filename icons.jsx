/* Inline SVG icons — single stroke style */
const Icon = ({ name, size = 16, ...rest }) => {
  const paths = {
    plus: <path d="M8 3v10M3 8h10" />,
    history: <><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 1" /></>,
    bulb: <><path d="M5.5 9.5a3.5 3.5 0 1 1 5 0c-.5.5-1 1-1 2v.5h-3v-.5c0-1-.5-1.5-1-2z" /><path d="M6.5 14h3" /></>,
    book: <><path d="M3 3h7a2 2 0 0 1 2 2v8H5a2 2 0 0 0-2 2V3z" /><path d="M3 13a2 2 0 0 1 2-2h7" /></>,
    info: <><circle cx="8" cy="8" r="6" /><path d="M8 5.5v.01M7 8h1v3.5h1" /></>,
    lock: <><rect x="3.5" y="7" width="9" height="6.5" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></>,
    chevronLeft: <path d="M10 4l-4 4 4 4" />,
    chevronRight: <path d="M6 4l4 4-4 4" />,
    chevronDown: <path d="M4 6l4 4 4-4" />,
    chevronUp: <path d="M4 10l4-4 4 4" />,
    arrowUp: <path d="M8 13V3M4 7l4-4 4 4" />,
    inbox: <><path d="M2.5 9.5L4 4h8l1.5 5.5" /><path d="M2.5 9.5v3h11v-3h-3.5L9 11H7l-1-1.5H2.5z" /></>,
    activity: <path d="M2 8h2.5l1.5-4 3 8 1.5-4H14" />,
    check: <path d="M3 8.5l3 3 7-7" />,
    runbook: <><rect x="3" y="3" width="10" height="10" rx="1.5" /><path d="M5.5 6h5M5.5 8h5M5.5 10h3" /></>,
    map: <><path d="M2 4l4-1 4 1 4-1v9l-4 1-4-1-4 1z" /><path d="M6 3v9M10 4v9" /></>,
    bell: <><path d="M4 11h8l-1-2V7a3 3 0 0 0-6 0v2l-1 2z" /><path d="M6.5 13a1.5 1.5 0 0 0 3 0" /></>,
    settings: <><circle cx="8" cy="8" r="2" /><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" /></>,
    sparkles: <><path d="M8 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" /><path d="M12.5 9.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5z" /></>,
    flame: <path d="M8 2c0 2 2 3 2 5a2 2 0 0 1-4 0c0-1 .5-1.5 1-2-.5 2 1 3 1 5a2 2 0 1 1-4 0c0-3 4-5 4-8z" />,
    chart: <path d="M2 13h12M4 11V8M7 11V5M10 11V9M13 11V6" />,
    network: <><circle cx="3" cy="8" r="1.5" /><circle cx="13" cy="3" r="1.5" /><circle cx="13" cy="13" r="1.5" /><circle cx="8" cy="8" r="1.5" /><path d="M4.5 8h2M9.5 8L11.5 4M9.5 8L11.5 12" /></>,
    docs: <><path d="M9 2H4v12h8V5z" /><path d="M9 2v3h3" /><path d="M6 8h4M6 10h4M6 12h2" /></>,
    git: <><circle cx="4" cy="4" r="1.5" /><circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="8" r="1.5" /><path d="M4 5.5v5M5.5 4h5a2 2 0 0 1 2 2v.5" /></>,
    megaphone: <><path d="M3 6v4l8 3V3z" /><path d="M11 5.5a2 2 0 0 1 0 5" /></>,
    pager: <><rect x="2" y="4" width="12" height="8" rx="1.5" /><path d="M5 7h6M5 9.5h4" /></>,
    shield: <path d="M8 2l5 2v4c0 3-2 5-5 6-3-1-5-3-5-6V4z" />,
    paperclip: <path d="M11 5L6 10a2 2 0 0 1-3-3l5-5a3 3 0 0 1 4 4l-5 5" />,
    mic: <><rect x="6" y="2" width="4" height="7" rx="2" /><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2" /></>,
    slash: <path d="M5 12L11 4" />,
    at: <><circle cx="8" cy="8" r="2.5" /><path d="M10.5 8v1a1.5 1.5 0 0 0 3 0v-1a5.5 5.5 0 1 0-2 4" /></>,
    sun: <><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5L3.4 3.4" /></>,
    moon: <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3 4.5 4.5 0 0 0 13 9.5z" />,
    panel: <><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M6 3v10" /></>,
    askmac: <><path d="M3 14V4l5 6 5-6v10" strokeLinejoin="round" /></>,
    spinner: <><circle cx="8" cy="8" r="5" opacity="0.25" /><path d="M13 8a5 5 0 0 0-5-5" /></>,
    tool: <path d="M11 3l2 2-3 3-1-1-3 3-1 1-2-2 1-1 3-3-1-1z" />,
    clock: <><circle cx="8" cy="8" r="6" /><path d="M8 5v3.5l2 1.5" /></>,
    user: <><circle cx="8" cy="6" r="2.5" /><path d="M3.5 13a4.5 4.5 0 0 1 9 0" /></>,
    play: <path d="M5 3v10l8-5z" />,
    explore: <><circle cx="8" cy="8" r="6" /><path d="M11 5L9 9l-4 2 2-4z" /></>,
    robot: <><rect x="3" y="6" width="10" height="7" rx="1.5" /><circle cx="6.5" cy="9.5" r="0.8" fill="currentColor" /><circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" /><path d="M8 3v3M6 3h4" /></>,
  };
  const p = paths[name];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" {...rest}>{p}</svg>
  );
};

window.Icon = Icon;
