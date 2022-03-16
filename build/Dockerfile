ARG PROFILE

FROM node:16.14-stretch

WORKDIR /usr/src/app

COPY ../package*.json ./
RUN npm install
COPY ../ .
EXPOSE 8110

CMD [ "npm", "run", ${PROFILE} ]

