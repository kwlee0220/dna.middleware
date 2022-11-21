FROM node:16

RUN apt-get -y update && apt-get install -y ffmpeg

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]