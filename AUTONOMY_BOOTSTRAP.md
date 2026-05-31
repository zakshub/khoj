# KHOJ Autonomy Bootstrap (Director Mode)

This sets up one autonomous system with three worker roles:

1. `executor` -> works on original KHOJ plan tasks
2. `tracker` -> updates `lab.zuhaib.pro/khoj` dashboard data
3. `reporter` -> sends WhatsApp status every 4 hours

## Recommended Architecture

- One repo for now: `khoj` (faster setup)
- Later optional split:
  - `khoj-dashboard` (UI only)
  - `khoj-ops` (automation engine only)

## Subdomains

- `khoj.zuhaib.pro` -> autonomy engine API + admin
- `lab.zuhaib.pro/khoj` -> public/internal tracking dashboard

## Phase Order

1. Infra ready on VPS (Node, PM2, Nginx, SSL)
2. Run orchestrator service on `khoj.zuhaib.pro`
3. Dashboard reads live JSON from orchestrator output
4. WhatsApp report job every 4 hours

## Non-Negotiable Rule

All updates go through Git:
- local edit -> push -> auto deploy

No manual app-file edits on VPS.

## Week 1 Execution Scope (Nano only)

- 3 Urdu carousels
- Instagram profile setup block
- WhatsApp welcome message
- 4-week content calendar

No videos, no bot rollout, no extra age groups.
