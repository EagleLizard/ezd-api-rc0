
FROM node:20-alpine
ENV TZ="America/Denver"

ENV USER ezd
ENV HOME /home/$USER
WORKDIR $HOME
COPY package.json .
RUN npm i
COPY src/ src
COPY tsconfig.json .
COPY .eslintrc.js .
RUN mkdir logs
RUN npm run build
