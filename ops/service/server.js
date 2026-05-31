const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = "/var/www/khoj";
const statusRuntimePath = path.join(root, "public", "data", "status.runtime.json");
const statusSeedPath = path.join(root, "public", "data", "status.json");
const contentRuntimePath = path.join(root, "public", "content", "latest.runtime.json");
const contentSeedPath = path.join(root, "public", "content", "latest.json");

function run(cmd) {
  return execSync(cmd, { cwd: root, stdio: "pipe" }).toString();
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function loadData() {
  const status = readJson(statusRuntimePath, readJson(statusSeedPath, {
    last_updated: new Date().toISOString(),
    phase: "Phase 1 - Content Proof",
    overall_percent: 0,
    achieved_percent: 0,
    remaining_percent: 100,
    eta_days: 0,
    currently_ongoing: [],
    upcoming: [],
    remaining_work: []
  }));

  const content = readJson(contentRuntimePath, readJson(contentSeedPath, {
    generated_at: new Date().toISOString(),
    hero: {
      title: "KHOJ STEAM School",
      tagline: "Where Curiosity Finds Discovery",
      description: "Discovery-first learning for Pakistani children."
    },
    latest_cards: [],
    mission_of_day: {
      title: "Mission of the day",
      body: "Content publishing cycle in progress.",
      duration_min: 10,
      age_group: "Nano"
    }
  }));

  return { status, content };
}

function renderProductPage({ status, content }) {
  const cardsHtml = (content.latest_cards || [])
    .map(
      (card, idx) => `
      <article class="card reveal" style="animation-delay:${idx * 90}ms">
        <p class="chip">Discovery ${idx + 1}</p>
        <h3 class="urdu-rtl" lang="ur" dir="rtl">${card.ur || "-"}</h3>
        <p class="en">${card.en || ""}</p>
        <p class="body urdu-rtl" lang="ur" dir="rtl">${card.summary_ur || ""}</p>
        <p class="mission urdu-rtl" lang="ur" dir="rtl"><b>مشن:</b> ${card.mission_ur || ""}</p>
      </article>
    `
    )
    .join("");

  const ongoingHtml = (status.currently_ongoing || [])
    .map((item) => `<li>${item}</li>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KHOJ | AI STEAM School</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Noto+Sans+Arabic:wght@400;500;700&display=swap');
    :root {
      --bg:#070910;
      --text:#eef1ff;
      --muted:#a7aecb;
      --line:#2a3049;
      --card:#111523;
      --violet:#7b61ff;
      --violet2:#9d7bff;
      --teal:#30d4b2;
      --amber:#ffbd59;
      --green:#41dd90;
    }
    * { box-sizing:border-box; }
    body {
      margin:0;
      font-family: Inter, Segoe UI, Arial, sans-serif;
      color:var(--text);
      background:
        radial-gradient(1100px 700px at -10% -15%, rgba(123,97,255,.24), transparent),
        radial-gradient(1000px 700px at 120% -20%, rgba(48,212,178,.14), transparent),
        linear-gradient(180deg,#06070d,#090b13 40%, #070910);
    }
    .urdu-rtl {
      direction: rtl;
      text-align: right;
      font-family: "Tajawal", "Noto Sans Arabic", "Cairo", "Dubai", "Segoe UI", sans-serif;
      line-height: 1.7;
    }
    .shell { width:min(1220px,94vw); margin:26px auto 42px; display:grid; gap:14px; }
    .hero {
      border:1px solid var(--line);
      border-radius:22px;
      padding:26px;
      background:linear-gradient(170deg, rgba(17,21,35,.92), rgba(9,12,21,.9));
      position:relative; overflow:hidden;
    }
    .hero::before {
      content:"";
      position:absolute; inset:-40%;
      background:conic-gradient(from 45deg, transparent, rgba(157,123,255,.23), transparent);
      animation:spin 11s linear infinite;
      pointer-events:none;
    }
    .hero > * { position:relative; z-index:1; }
    .kicker { text-transform:uppercase; letter-spacing:.2em; font-size:12px; color:var(--muted); }
    h1 { margin:10px 0 6px; font-size:58px; line-height:1; letter-spacing:-.035em; }
    .tag { margin:0; color:#d2d7ef; font-size:21px; }
    .desc { margin:10px 0 0; color:var(--muted); max-width:760px; font-size:15px; }
    .hero-grid { margin-top:18px; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }
    .metric { border:1px solid var(--line); border-radius:14px; padding:12px; background:rgba(13,16,28,.7); }
    .metric .l { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.13em; }
    .metric .v { margin-top:6px; font-size:30px; font-weight:700; }
    .v1 { color:var(--violet2); } .v2 { color:var(--teal); } .v3 { color:var(--green); } .v4 { color:var(--amber); }
    .section { border:1px solid var(--line); border-radius:18px; background:linear-gradient(180deg,rgba(17,21,35,.88),rgba(11,14,24,.92)); padding:18px; }
    .h2 { margin:0 0 12px; font-size:28px; letter-spacing:-.02em; }
    .cards { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
    .card {
      border:1px solid var(--line); border-radius:14px; padding:13px;
      background:linear-gradient(180deg,rgba(17,20,33,.9),rgba(9,12,21,.96));
      transform:translateY(8px); opacity:0; animation:rise .6s ease forwards;
    }
    .chip {
      display:inline-block; border:1px solid #47508c; border-radius:999px; padding:4px 9px;
      color:#cad0ea; font-size:11px; text-transform:uppercase; letter-spacing:.08em;
    }
    .card h3 { margin:10px 0 6px; font-size:23px; line-height:1.3; }
    .card .en { margin:0; color:#d4dcff; font-size:13px; opacity:.9; }
    .card .body { margin:10px 0; color:var(--muted); font-size:14px; line-height:1.5; }
    .mission { margin:0; color:#c7ffe9; font-size:13px; }
    .panel-grid { display:grid; grid-template-columns:1.3fr 1fr; gap:10px; }
    ul { margin:0; padding:0; list-style:none; display:grid; gap:8px; }
    li { border:1px solid var(--line); border-radius:10px; padding:10px; color:var(--muted); background:rgba(10,13,23,.65); }
    .track { margin-top:8px; height:11px; border-radius:999px; background:#0b1020; border:1px solid #1f2842; overflow:hidden; }
    .track span {
      display:block; height:100%; background:linear-gradient(90deg,var(--teal),var(--violet2));
      width:${status.achieved_percent || 0}%; position:relative;
    }
    .track span::after {
      content:""; position:absolute; inset:0; transform:translateX(-120%);
      background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent); animation:glow 2.2s linear infinite;
    }
    .small { color:var(--muted); font-size:13px; margin-top:8px; }
    .cta { margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; }
    a.btn {
      border:1px solid var(--line); border-radius:999px; padding:10px 13px; text-decoration:none; color:var(--text);
      background:#131829; font-size:13px; transition:.2s ease;
    }
    a.btn:hover { transform:translateY(-1px); box-shadow:0 0 0 1px rgba(123,97,255,.35),0 10px 24px rgba(123,97,255,.2); }
    footer { text-align:center; color:var(--muted); font-size:12px; padding:8px 0 2px; }
    @media (max-width:980px) {
      h1 { font-size:40px; }
      .hero-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .cards { grid-template-columns:1fr; }
      .panel-grid { grid-template-columns:1fr; }
    }
    @keyframes spin { to { transform:rotate(1turn); } }
    @keyframes glow { to { transform:translateX(120%); } }
    @keyframes rise { to { transform:translateY(0); opacity:1; } }
  </style>
</head>
<body>
  <div class="shell">
    <section class="hero">
      <p class="kicker">KHOJ STEAM SCHOOL</p>
      <h1>${content.hero?.title || "KHOJ STEAM School"}</h1>
      <p class="tag">${content.hero?.tagline || "Where Curiosity Finds Discovery"}</p>
      <p class="desc">${content.hero?.description || ""}</p>
      <div class="hero-grid">
        <article class="metric"><div class="l">Phase</div><div class="v v1">${status.phase || "-"}</div></article>
        <article class="metric"><div class="l">Overall</div><div class="v v2">${status.overall_percent || 0}%</div></article>
        <article class="metric"><div class="l">Achieved</div><div class="v v3">${status.achieved_percent || 0}%</div></article>
        <article class="metric"><div class="l">ETA</div><div class="v v4">${status.eta_days || 0} Days</div></article>
      </div>
    </section>

    <section class="section">
      <h2 class="h2">Latest Discoveries</h2>
      <div class="cards">
        ${cardsHtml || "<p>No cards generated yet.</p>"}
      </div>
    </section>

    <section class="section panel-grid">
      <article>
        <h2 class="h2">Mission of the Day</h2>
        <ul>
          <li class="urdu-rtl" lang="ur" dir="rtl"><b>${content.mission_of_day?.title || "مشن"}</b><br>${content.mission_of_day?.body || "-"}</li>
          <li>Duration: ${content.mission_of_day?.duration_min || 10} min</li>
          <li>Age Group: ${content.mission_of_day?.age_group || "Nano"}</li>
        </ul>
        <div class="cta">
          <a class="btn" href="/status">Live JSON Status</a>
          <a class="btn" href="/ops">Ops Console</a>
          <a class="btn" href="https://lab.zuhaib.pro/khoj" target="_blank" rel="noreferrer">Tracking Control Tower</a>
        </div>
      </article>
      <article>
        <h2 class="h2">Execution Pulse</h2>
        <div class="track"><span></span></div>
        <p class="small">Last updated: ${status.last_updated || "-"}</p>
        <h3 style="margin:14px 0 8px;font-size:16px">Currently Ongoing</h3>
        <ul>${ongoingHtml || "<li>No ongoing tasks</li>"}</ul>
      </article>
    </section>

    <footer>Auto-generated by KHOJ autonomy engine • Updated ${content.generated_at || "-"}</footer>
  </div>
</body>
</html>`;
}

function renderOpsPage(status) {
  const data = JSON.stringify(status, null, 2).replace(/</g, "\\u003c");
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>KHOJ Ops Console</title>
<style>body{font-family:Inter,Segoe UI,Arial,sans-serif;background:#0b0d14;color:#e8ecff;margin:0;padding:20px}button{padding:10px 12px;border-radius:10px;border:1px solid #344065;background:#171e35;color:#fff;cursor:pointer}pre{white-space:pre-wrap;background:#111523;border:1px solid #2b3557;border-radius:12px;padding:12px}a{color:#9bb4ff}</style>
</head>
<body>
<h1>KHOJ Ops Console</h1>
<p><a href="/">Back to Product View</a></p>
<form method="post" action="/run-cycle"><button type="submit">Run Cycle Now</button></form>
<h2>Status Snapshot</h2>
<pre>${data}</pre>
</body></html>`;
}

const server = http.createServer((req, res) => {
  try {
    const data = loadData();

    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(renderProductPage(data));
    }

    if (req.url === "/ops") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(renderOpsPage(data.status));
    }

    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true, service: "khoj-executor" }));
    }

    if (req.url === "/run-cycle" && (req.method === "POST" || req.method === "GET")) {
      run("node ops/scripts/run_executor.js");
      run("node ops/scripts/run_tracker.js");
      run("node ops/scripts/run_publish.js");
      run("node ops/scripts/run_reporter.js");

      if (req.method === "POST") {
        res.writeHead(302, { Location: "/ops" });
        return res.end();
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          ok: true,
          ran: "executor+tracker+publish+reporter"
        })
      );
    }

    if (req.url === "/status") {
      const source = fs.existsSync(statusRuntimePath) ? statusRuntimePath : statusSeedPath;
      const raw = fs.readFileSync(source, "utf8");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(raw);
    }

    if (req.url === "/content") {
      const source = fs.existsSync(contentRuntimePath) ? contentRuntimePath : contentSeedPath;
      const raw = fs.readFileSync(source, "utf8");
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
