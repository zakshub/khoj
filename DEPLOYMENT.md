# KHOJ Deployment (Git-Only + Automatic)

## Flow
1. Edit locally
2. Push to `main`
3. GitHub Actions deploys automatically to `lab.zuhaib.pro/khoj`

## Required GitHub Secrets
Add these in repo settings:

- `DEPLOY_HOST` -> server IP or hostname
- `DEPLOY_USER` -> SSH user (recommended: deploy user)
- `DEPLOY_SSH_KEY` -> private SSH key (full text)

## Server Expectations
- Project path: `/var/www/khoj`
- PM2 process: `khoj`
- Node + pnpm + pm2 installed
- Nginx already routing `/khoj` to app

## Automatic Deploy Script (in workflow)
- `git pull --ff-only origin main`
- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pm2 restart khoj`
- `pm2 save`

## Manual Fallback
```bash
cd /var/www/khoj
git pull origin main
pnpm build
pm2 restart khoj
pm2 save
```
