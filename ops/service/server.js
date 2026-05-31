const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = "/var/www/khoj";
const statusPath = path.join(root, "public", "data", "status.json");

function run(cmd) {
  return execSync(cmd, { cwd: root, stdio: "pipe" }).toString();
}

function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(statusPath, "utf8"));
  } catch {
    return {
      last_updated: new Date().toISOString(),
      phase: "Phase 1 - Content Proof",
      overall_percent: 0,
      achieved_percent: 0,
      remaining_percent: 100,
      eta_days: 0,
      currently_ongoing: [],
      upcoming: [],
      remaining_work: []
    };
  }
}

function html(status) {
  const statusJson = JSON.stringify(status).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KHOJ Execution Engine</title>
  <style>
    :root {
      --bg: #090a11;
      --card: #121522;
      --card2: #161a2a;
      --line: #2c3450;
      --text: #eef1ff;
      --muted: #a5aecf;
      --violet: #7b61ff;
      --violet2: #9d7bff;
      --teal: #35d4b0;
      --amber: #ffbe58;
      --green: #42dd90;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Segoe UI, Arial, sans-serif;
      background:
        radial-gradient(900px 500px at -10% -10%, rgba(123,97,255,.25), transparent),
        radial-gradient(900px 500px at 110% -20%, rgba(53,212,176,.16), transparent),
        var(--bg);
      color: var(--text);
    }
    .wrap {
      width: min(1200px, 95vw);
      margin: 24px auto 42px;
      display: grid;
      gap: 16px;
    }
    .hero {
      border: 1px solid var(--line);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(20,24,41,.92), rgba(10,13,22,.9));
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: "";
      position: absolute;
      inset: -30%;
      background: conic-gradient(from 0deg, transparent, rgba(157,123,255,.24), transparent);
      animation: spin 9s linear infinite;
      pointer-events: none;
    }
    .hero > * { position: relative; z-index: 1; }
    h1 {
      margin: 0;
      font-size: 44px;
      line-height: 1.05;
      letter-spacing: -.03em;
    }
    .sub { color: var(--muted); margin-top: 8px; font-size: 15px; }
    .toolbar {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    button, .chip {
      border: 1px solid var(--line);
      background: #121728;
      color: var(--text);
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      cursor: pointer;
      transition: .2s ease;
    }
    button:hover {
      transform: translateY(-1px);
      border-color: #5062a6;
      box-shadow: 0 0 0 1px rgba(123,97,255,.4), 0 10px 30px rgba(123,97,255,.18);
    }
    .chip { cursor: default; color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }
    .card {
      background: linear-gradient(180deg, rgba(20,24,41,.88), rgba(12,16,28,.92));
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 14px;
    }
    .k {
      color: var(--muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .13em;
    }
    .v { margin-top: 8px; font-size: 34px; font-weight: 700; }
    .t-violet { color: var(--violet2); }
    .t-teal { color: var(--teal); }
    .t-amber { color: var(--amber); }
    .t-green { color: var(--green); }
    .panes {
      display: grid;
      grid-template-columns: 1.3fr 1fr 1fr;
      gap: 12px;
    }
    .panel-title {
      margin: 0 0 10px;
      font-size: 22px;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 8px;
    }
    li {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 11px;
      color: var(--muted);
      background: rgba(11,14,25,.6);
    }
    .track {
      margin-top: 10px;
      height: 10px;
      border-radius: 999px;
      background: #0c1120;
      overflow: hidden;
      border: 1px solid #1c2641;
    }
    .track > span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--teal), var(--violet2));
      width: 0;
      transition: width .8s ease;
      position: relative;
    }
    .track > span::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-120%);
      background: linear-gradient(100deg, transparent, rgba(255,255,255,.34), transparent);
      animation: gleam 2.2s linear infinite;
    }
    .split {
      margin-top: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .badge {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px;
      background: rgba(11,14,25,.6);
      color: var(--muted);
      font-size: 13px;
    }
    .badge b { display: block; margin-top: 4px; font-size: 22px; color: var(--text); }
    .mini {
      color: var(--muted);
      font-size: 13px;
      margin-top: 8px;
      word-break: break-word;
    }
    @media (max-width: 960px) {
      h1 { font-size: 34px; }
      .grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
      .panes { grid-template-columns: 1fr; }
    }
    @keyframes spin { to { transform: rotate(1turn); } }
    @keyframes gleam { to { transform: translateX(120%); } }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>KHOJ Execution Engine</h1>
      <p class="sub">Autonomous orchestration service for Executor, Tracker, and Reporter workers.</p>
      <div class="toolbar">
        <button id="runCycle">Run Cycle Now</button>
        <button id="refresh">Refresh Status</button>
        <span class="chip">Endpoints: /health • /status • /run-cycle</span>
      </div>
      <p id="lastAction" class="mini">Ready.</p>
    </section>

    <section class="grid">
      <article class="card"><div class="k">Overall Completion</div><div id="overall" class="v t-violet">0%</div></article>
      <article class="card"><div class="k">Current Phase</div><div id="phase" class="v t-teal">-</div></article>
      <article class="card"><div class="k">Achieved</div><div id="achieved" class="v t-green">0%</div></article>
      <article class="card"><div class="k">ETA</div><div id="eta" class="v t-amber">0 Days</div></article>
    </section>

    <section class="panes">
      <article class="card">
        <h2 class="panel-title">Progress</h2>
        <div class="k">Achieved vs Remaining</div>
        <div class="track"><span id="progBar"></span></div>
        <div class="split">
          <div class="badge">Achieved<b id="achievedMini">0%</b></div>
          <div class="badge">Remaining<b id="remainingMini">0%</b></div>
        </div>
        <p id="updated" class="mini"></p>
      </article>

      <article class="card">
        <h2 class="panel-title">Currently Ongoing</h2>
        <ul id="ongoing"></ul>
      </article>

      <article class="card">
        <h2 class="panel-title">Upcoming</h2>
        <ul id="upcoming"></ul>
      </article>
    </section>
  </div>

  <script id="statusSeed" type="application/json">${statusJson}</script>
  <script>
    const seed = JSON.parse(document.getElementById("statusSeed").textContent || "{}");
    const byId = (id) => document.getElementById(id);

    function setList(id, items) {
      const el = byId(id);
      el.innerHTML = "";
      (items || []).forEach((x) => {
        const li = document.createElement("li");
        li.textContent = x;
        el.appendChild(li);
      });
      if (!items || !items.length) {
        const li = document.createElement("li");
        li.textContent = "No items yet.";
        el.appendChild(li);
      }
    }

    function render(s) {
      byId("overall").textContent = (s.overall_percent ?? 0) + "%";
      byId("phase").textContent = (s.phase || "-").split("-")[0].trim();
      byId("achieved").textContent = (s.achieved_percent ?? 0) + "%";
      byId("eta").textContent = (s.eta_days ?? 0) + " Days";
      byId("achievedMini").textContent = (s.achieved_percent ?? 0) + "%";
      byId("remainingMini").textContent = (s.remaining_percent ?? 0) + "%";
      byId("updated").textContent = "Last updated: " + (s.last_updated || "-");
      byId("progBar").style.width = (s.achieved_percent ?? 0) + "%";
      setList("ongoing", s.currently_ongoing || []);
      setList("upcoming", s.upcoming || []);
    }

    async function refreshStatus() {
      try {
        const res = await fetch("/status", { cache: "no-store" });
        const data = await res.json();
        render(data);
        byId("lastAction").textContent = "Status refreshed successfully.";
      } catch (e) {
        byId("lastAction").textContent = "Refresh failed: " + String(e.message || e);
      }
    }

    async function runCycle() {
      byId("lastAction").textContent = "Running executor -> tracker -> reporter...";
      try {
        const res = await fetch("/run-cycle", { method: "POST" });
        const data = await res.json();
        byId("lastAction").textContent = data.ok
          ? "Cycle completed successfully."
          : "Cycle failed.";
        await refreshStatus();
      } catch (e) {
        byId("lastAction").textContent = "Run-cycle failed: " + String(e.message || e);
      }
    }

    byId("refresh").addEventListener("click", refreshStatus);
    byId("runCycle").addEventListener("click", runCycle);

    render(seed);
    setInterval(refreshStatus, 30000);
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  try {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html(readStatus()));
    }

    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true, service: "khoj-executor" }));
    }

    if (req.url === "/run-cycle" && req.method === "POST") {
      run("node ops/scripts/run_executor.js");
      run("node ops/scripts/run_tracker.js");
      run("node ops/scripts/run_reporter.js");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true, ran: "executor+tracker+reporter" }));
    }

    if (req.url === "/status") {
      const raw = fs.readFileSync(statusPath, "utf8");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(raw);
    }

    res.writeHead(404);
    res.end("Not found");
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
  }
});

server.listen(3010, () => {
  console.log("khoj execution service running on :3010");
});
