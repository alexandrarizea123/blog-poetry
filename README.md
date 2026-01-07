# Blog Poetry

## Functionalitati
- autentificare si inregistrare
- roluri: poet / cititor
- creare, editare si stergere poezii
- galerie cu poezii existente

## Mockups
![Homepage Jurnal Poezie](images/homepage-jurnal-poezie.png)
![Scrie O Poezie](images/scrie-o-poezie.png)

## Cerinte
- Node.js 20+
- Docker (optional pentru rulare containerizata)

## Rulare locala (dev)
1. Instaleaza dependintele frontend:
   `npm install`
2. Porneste backendul:
   `cd server && npm install && npm run dev`
3. Porneste frontendul:
   `npm run dev`
4. Acceseaza: `http://localhost:5173`

Pentru frontend in dev, seteaza:
- `VITE_API_URL=http://localhost:3001`

## Rulare cu Docker (app + db)
`docker compose up --build`

Aplicatia este disponibila la `http://localhost:3001`.
Postgres ruleaza pe `localhost:5435`.

## Variabile de mediu
Backend:
- `DATABASE_URL=postgres://user:pass@host:5432/db`
- `PORT=3001`
- `CORS_ORIGIN=http://localhost:5173` (sau lista separata prin virgula)
- `SERVE_STATIC=true` (serveste frontendul din `dist`)
- `DB_CONNECT_RETRIES=10`
- `DB_CONNECT_DELAY_MS=1000`

Frontend:
- `VITE_API_URL` (gol pentru same-origin, sau `http://localhost:3001` in dev)

## Endpoints API
- `GET /api/health`
- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/poems`
- `POST /api/poems`
- `PUT /api/poems/:id`
- `DELETE /api/poems/:id`
