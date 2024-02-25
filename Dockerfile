
FROM node:20-alpine
ENV USER ezd
ENV HOME /home/$USER
WORKDIR $HOME
COPY package.json .
RUN npm i
COPY src/ src
COPY tsconfig.json .
COPY .eslintrc.js .
RUN npm run build
