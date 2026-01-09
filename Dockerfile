FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source
COPY frontend/index.html frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json ./
COPY frontend/postcss.config.cjs frontend/tailwind.config.cjs ./
COPY frontend/src ./src

ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Backend setup
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 3001
CMD ["node", "backend/index.js"]
