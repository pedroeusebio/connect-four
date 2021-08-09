FROM node:16-alpine

RUN mkdir -p /usr/src/app/node_modules

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD ["npm", "start"]
