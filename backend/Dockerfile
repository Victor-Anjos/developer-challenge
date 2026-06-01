FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build
RUN ls -la dist/

EXPOSE 3333

CMD ["node", "dist/App.js"]