FROM node:18

USER root

RUN npm install --global cpx nodemon pm2 rimraf tsc

RUN mkdir -p /var/app/node_modules && chown -R node:node /var/app

WORKDIR /var/app

COPY package*.json ./

RUN npm install

COPY . .
