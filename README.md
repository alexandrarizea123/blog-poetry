# Jurnal de poezie

## Functionalitati
- autentificare si inregistrare
- roluri: poet / cititor
- creare, editare si stergere poezii
- galerie cu poezii existente
- galerii multiple pentru categorii de poezii
- profil poet cu statistici (citiri, aprecieri, salvari) si badge-uri
- interactiuni cititor: citit, apreciat, salvat
- contorizare cititori unici per poet
- UI alb-negru cu doodles subtile pe fundal

## Mockups
![Homepage Jurnal Poezie](images/homepage-jurnal-poezie.png)
![Scrie o poezie](images/scrie-o-poezie.png)

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

Aplicatia este disponibila la `http://localhost:3001` (frontend servit din backend).
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
- `GET /api/health` - verificare baza de date
- `GET /api/galleries` - lista galerii (optional `authorId`)
- `POST /api/galleries` - corp: `{ name, authorId }`
- `PUT /api/galleries/:id` - corp: `{ name, authorId }`
- `DELETE /api/galleries/:id` - parametru: `authorId`
- `POST /api/register` - corp: `{ name, email, password, role }`
- `POST /api/login` - corp: `{ email, password, role? }`
- `POST /api/logout` - delogare locala
- `GET /api/poems` - lista poezii
- `POST /api/poems` - corp: `{ title, content, authorId?, galleryId? }`
- `PUT /api/poems/:id` - corp: `{ title, content, authorId, galleryId? }`
- `DELETE /api/poems/:id` - parametru optional: `authorId`
- `POST /api/poems/:id/read` - corp: `{ readerId }`
- `POST /api/poems/:id/like` - corp: `{ userId }`
- `DELETE /api/poems/:id/like` - parametru: `userId`
- `POST /api/poems/:id/save` - corp: `{ userId }`
- `DELETE /api/poems/:id/save` - parametru: `userId`
- `GET /api/poets/:id/stats` - statistici agregate pentru poet
- `GET /api/users/:id/poem-interactions` - query: `poemIds=1,2,3`
