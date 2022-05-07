FROM node:17.1.0

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run gulp

EXPOSE 8000 8080
CMD [ "npm", "start" ]
