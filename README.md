# tuiphonepremium

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nicopastorinos-projects/v0-tuiphonepremium)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/thlzES0cSz1)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/nicopastorinos-projects/v0-tuiphonepremium](https://vercel.com/nicopastorinos-projects/v0-tuiphonepremium)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/thlzES0cSz1](https://v0.dev/chat/projects/thlzES0cSz1)**

## Supabase setup

To enable the admin panels (productos, plan canje y configuración de portada) run the SQL scripts inside the `scripts/` folder from the Supabase SQL editor in this order:

1. `create-products-table.sql` (si no existe la tabla)
2. `create-site-config-table.sql` *(crea/actualiza home, plan canje, cuotas y dólar)*
3. `update-rls-policies.sql`

Whenever policies need to be reset for troubleshooting you can run `disable-rls-temporarily.sql` followed by `fix-admin-permissions.sql`, and finally `update-rls-policies.sql` again to restore the final policy set.

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
