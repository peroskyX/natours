FROM node:16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --only=production

COPY . .

USER node

CMD ["npm", "start"]

EXPOSE 8000 