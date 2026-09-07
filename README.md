# DaxBoard

LAN dashboard voor je homelab servers. Sla links op in secties, open ze met één klik via een modern donker dashboard. Data wordt opgeslagen in PocketBase v0.40.3.

## Functies

- Secties met een grid van klikbare server-iconen
- Eenvoudig links en secties toevoegen/verwijderen (bewerkmodus)
- Donker, responsive design (mobiel, tablet, desktop)
- PocketBase backend zonder login — alles open
- Database schema via PocketBase migraties (`pb_migrations/`)

## Snel starten met Docker

```bash
docker compose up -d --build
```

Open daarna: http://localhost:8090

## Lokaal ontwikkelen

### Backend (PocketBase)

Download PocketBase v0.40.3 en start vanuit de projectroot:

```bash
./pocketbase serve --dir=./pb_data --publicDir=./pb_public --migrationsDir=./pb_migrations --automigrate=false
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

De Vite dev server draait op http://localhost:5173 en proxy't API-verzoeken naar PocketBase.

Build voor productie:

```bash
cd frontend
npm run build
```

De build output gaat naar `pb_public/`.

## Data model

| Collectie | Velden |
|-----------|--------|
| `sections` | `name`, `sort_order` |
| `links` | `title`, `url`, `icon`, `sort_order`, `section` (relatie) |

Alle API-regels staan open (`""`) — geen authenticatie vereist.

## Migraties

Het schema wordt geïnitialiseerd via `pb_migrations/1730000000_initial_schema.js`. Bij de eerste start maakt PocketBase automatisch de collecties aan met voorbeelddata.
