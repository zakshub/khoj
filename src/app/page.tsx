const progressPercent = 55;
const achievedPercent = 42;
const remainingPercent = 58;

const summaryCards = [
  { label: "Overall Completion", value: "55%", tone: "violet" },
  { label: "Current Phase", value: "Phase 1", tone: "teal" },
  { label: "Active Workstreams", value: "6", tone: "amber" },
  { label: "ETA To Phase 1", value: "21 Days", tone: "green" },
];

const goalUpdates = [
  { item: "Deployment foundation on production", status: "Done", pct: 100 },
  { item: "Git-only release workflow", status: "Done", pct: 100 },
  { item: "Production dashboard UX build", status: "In Progress", pct: 65 },
  { item: "Weekly content tracker integration", status: "In Progress", pct: 40 },
];

const ongoing = [
  "Phase 1 dashboard execution and data blocks",
  "Nano stream: 4-7 age content roadmap structure",
  "Status-to-deliverables mapping for daily updates",
];

const upcoming = [
  "Final logo placement and brand lockups",
  "Week 1 carousel copy blocks wired into portal",
  "KPI drill-down pages for monthly and weekly views",
];

const remaining = [
  "Charts with real execution numbers",
  "Daily update protocol with timestamps",
  "Parent-community traction tracker",
  "Mission completion analytics",
];

const phasePlan = [
  { phase: "Phase 1", target: "June 2026", status: "Active", pct: 62 },
  { phase: "Phase 2", target: "Jul 2026", status: "Queued", pct: 18 },
  { phase: "Phase 3", target: "Aug 2026", status: "Queued", pct: 9 },
  { phase: "Phase 4", target: "Nov 2026", status: "Planned", pct: 4 },
];

const weeklyVelocity = [
  { week: "W1", value: 38 },
  { week: "W2", value: 56 },
  { week: "W3", value: 64 },
  { week: "W4", value: 72 },
];

function toneClass(tone: string): string {
  switch (tone) {
    case "teal":
      return "text-[var(--teal)]";
    case "amber":
      return "text-[var(--amber)]";
    case "green":
      return "text-[var(--green)]";
    default:
      return "text-[var(--violet-bright)]";
  }
}

export default function Home() {
  return (
    <main className="portal-shell px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="glass-card soft-pulse p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                KHOJ Command Portal
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
                Execution Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--muted)] md:text-base">
                Plan, goals, ongoing work, upcoming priorities, remaining scope,
                and timeline clarity from one live board.
              </p>
            </div>
            <div className="metric-glow rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="text-xs text-[var(--muted)]">Latest Update</p>
              <p className="mt-1 text-lg font-medium">31 May 2026</p>
              <p className="text-xs text-[var(--muted)]">Timezone: PKT</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="glass-card p-5">
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">
                {card.label}
              </p>
              <p className={`mt-3 text-3xl font-semibold ${toneClass(card.tone)}`}>
                {card.value}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="glass-card p-5 lg:col-span-3">
            <div className="mb-4 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold">Goal Updates</h2>
              <span className="text-xs text-[var(--muted)]">
                Live progress on key outcomes
              </span>
            </div>
            <div className="space-y-4">
              {goalUpdates.map((goal) => (
                <div key={goal.item}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <p>{goal.item}</p>
                    <span className="text-[var(--muted)]">{goal.status}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0c0f1e]">
                    <div
                      className="progress-shimmer h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--violet-bright)]"
                      style={{ width: `${goal.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card p-5 lg:col-span-2">
            <h2 className="text-xl font-semibold">Achieved vs Remaining</h2>
            <div className="mt-5 flex items-center justify-center">
              <div
                className="relative h-44 w-44 rounded-full"
                style={{
                  background: `conic-gradient(var(--violet-bright) 0 ${achievedPercent}%, #20263f ${achievedPercent}% 100%)`,
                }}
              >
                <div className="absolute inset-4 grid place-items-center rounded-full bg-[var(--background)]">
                  <div className="text-center">
                    <p className="text-3xl font-semibold">{achievedPercent}%</p>
                    <p className="text-xs text-[var(--muted)]">Achieved</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="text-[var(--muted)]">Achieved</p>
                <p className="mt-1 text-lg font-medium text-[var(--green)]">
                  {achievedPercent}%
                </p>
              </div>
              <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                <p className="text-[var(--muted)]">Remaining</p>
                <p className="mt-1 text-lg font-medium text-[var(--amber)]">
                  {remainingPercent}%
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="glass-card p-5">
            <h3 className="text-lg font-semibold">Currently Ongoing</h3>
            <ul className="mt-3 space-y-3 text-sm text-[var(--muted)]">
              {ongoing.map((item) => (
                <li key={item} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-card p-5">
            <h3 className="text-lg font-semibold">Upcoming</h3>
            <ul className="mt-3 space-y-3 text-sm text-[var(--muted)]">
              {upcoming.map((item) => (
                <li key={item} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-card p-5">
            <h3 className="text-lg font-semibold">Remaining Work</h3>
            <ul className="mt-3 space-y-3 text-sm text-[var(--muted)]">
              {remaining.map((item) => (
                <li key={item} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-card p-5">
            <h3 className="text-lg font-semibold">ETA Indicator</h3>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Expected phase-1 completion window:
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--violet-bright)]">
              21 Days
            </p>
            <div className="mt-4 h-2 rounded-full bg-[#0c0f1e]">
              <div
                className="progress-shimmer h-full rounded-full bg-gradient-to-r from-[var(--teal)] to-[var(--violet-bright)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              On-track confidence: Strong
            </p>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-5">
          <article className="glass-card p-5 lg:col-span-2">
            <h3 className="text-lg font-semibold">Phase Timeline</h3>
            <div className="mt-4 space-y-3">
              {phasePlan.map((row) => (
                <div
                  key={row.phase}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium">{row.phase}</p>
                    <span className="text-[var(--muted)]">{row.target}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{row.status}</span>
                    <span>{row.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[#0c0f1e]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--violet-bright)]"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card p-5 lg:col-span-3">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="text-lg font-semibold">Weekly Velocity</h3>
              <span className="text-xs text-[var(--muted)]">
                Graph / Execution Trend
              </span>
            </div>
            <div className="flex h-64 items-end justify-around gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              {weeklyVelocity.map((entry, idx) => (
                <div key={entry.week} className="flex flex-col items-center gap-2">
                  <div
                    className="bar-rise w-12 rounded-t-xl bg-gradient-to-t from-[var(--violet)] to-[var(--violet-bright)]"
                    style={{
                      height: `${entry.value * 2}px`,
                      animationDelay: `${idx * 120}ms`,
                    }}
                  />
                  <p className="text-xs text-[var(--muted)]">{entry.week}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
