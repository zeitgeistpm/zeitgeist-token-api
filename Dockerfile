FROM node:16-alpine 
RUN mkdir -p /home/zeitgeist-token-api && chown -R node:node /home/zeitgeist-token-api
WORKDIR /home/zeitgeist-token-api
COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .
COPY nodemon.json .
COPY babel.config.js .
COPY jest.config.ts .
COPY src src
COPY tests tests
RUN yarn install --frozen-lockfile && yarn cache clean \
&& yarn build
CMD ["yarn", "start"]