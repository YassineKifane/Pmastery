FROM node:16.16.0-alpine3.16

# COPY [host machine] [container] (paths are relative to the Dockerfile)
COPY package.json package-lock.json ./

RUN npm install

COPY . .

# RUN npm run build
# cmd -c npm start

CMD ["npm","start"]