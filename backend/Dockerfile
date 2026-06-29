FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci
COPY shared ./shared
COPY backend ./backend
RUN npm run build -w @teamboard/shared
RUN npm run build -w teamboard-backend
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/shared/package.json ./shared/package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/backend/dist ./backend/dist
EXPOSE 3000 3001
CMD ["npm", "run", "start:prod", "-w", "teamboard-backend"]
