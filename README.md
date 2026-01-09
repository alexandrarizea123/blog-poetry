# Jurnal de poezie

Aplicatie web full-stack pentru pasionatii de poezie, oferind o platforma pentru scrierea, citirea si interactiunea cu creatii lirice.

## Functionalitati
- autentificare si inregistrare
- roluri: poet / cititor
- creare, editare si stergere poezii
- galerie cu poezii existente
- galerii multiple pentru categorii de poezii
- profil poet cu statistici (citiri, aprecieri, salvari) si badge-uri
- profil cititor cu biblioteca de aprecieri si salvari
- interactiuni cititor: citit, apreciat, salvat
- contorizare cititori unici per poet
- UI alb-negru cu doodles subtile pe fundal

## Tehnologii Utilizate
### Frontend
- **React** - Biblioteca UI
- **Tailwind CSS** - Framework CSS utility-first
- **Vite** - Build tool si server de dezvoltare
- **Vitest** - Framework de testare

### Backend
- **Node.js** & **Express** - Server API
- **PostgreSQL** - Baza de date relationala
- **pg** - Driver PostgreSQL
- **Jest** - Framework de testare

### Infrastructura
- **Docker** & **Docker Compose** - Containerizare si orchestrare

## Mockups
![Homepage Jurnal Poezie](images/dashboard.png)
![Scrie o poezie](images/poezie.png)

## Cerinte
- Node.js 20+
- Docker (optional pentru rulare containerizata sau baza de date)

## Rulare locala (dev)

### 1. Configurare Baza de Date
Ai nevoie de o instanta PostgreSQL. Cea mai simpla metoda este folosirea Docker:
```bash
docker compose up db -d
```
*Nota: Baza de date va fi accesibila pe portul `5435`.*

### 2. Configurare Backend
Navigheaza in folderul `server` si configureaza variabilele de mediu:
```bash
cd server
cp .env.example .env
npm install
```
Deschide fisierul `.env` si asigura-te ca `DATABASE_URL` este corect. Daca folosesti Docker pentru DB (metoda de mai sus), schimba portul `5432` cu `5435` in URL:
`DATABASE_URL=postgres://blogpoetry:blogpoetry@localhost:5435/blogpoetry`

Porneste serverul in mod development:
```bash
npm run dev
```

### 3. Configurare Frontend
Intr-un terminal nou, in radacina proiectului:
```bash
npm install
npm run dev
```
Acceseaza aplicatia la: `http://localhost:5173`

Pentru frontend in dev, asigura-te ca variabila `VITE_API_URL` este setata corect (de obicei in `.env` sau implicit in cod catre `http://localhost:3001`).

## Rulare Teste
Proiectul include teste pentru ambele componente.

**Backend:**
```bash
cd server
npm run test
```

**Frontend:**
```bash
npm run test
```

## Rulare cu Docker (Full Stack)
Ruleaza intreaga aplicatie (frontend + backend + db) in containere:
```bash
docker compose up --build
```

Aplicatia este disponibila la `http://localhost:3001` (frontend servit din backend).
Postgres ruleaza pe `localhost:5435`.

## Variabile de mediu
**Backend** (`server/.env`):
- `DATABASE_URL` - URL conexiune Postgres (ex: `postgres://user:pass@host:5432/db`)
- `PORT` - Port server (default: `3001`)
- `CORS_ORIGIN` - Origini permise CORS (ex: `http://localhost:5173`)
- `SERVE_STATIC` - `true` pentru a servi frontendul din `dist` (productie)
- `DB_CONNECT_RETRIES` - Numar incercari conectare DB la pornire
- `DB_CONNECT_DELAY_MS` - Pauza intre incercari (ms)

**Frontend** (`.env`):
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
- `GET /api/users/:id/liked-poems` - lista poezii apreciate
- `GET /api/users/:id/saved-poems` - lista poezii salvate
