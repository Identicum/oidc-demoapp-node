FROM node:12.4-alpine

WORKDIR /usr/src/app/

RUN apk update && \
    apk upgrade && \
    apk add --no-cache git

RUN git clone https://github.com/Identicum/oidc-demoapp-node.git /oidc-demoapp-node && \
    cp /oidc-demoapp-node/source/package* . && \
    npm install

RUN cp -r /oidc-demoapp-node/source/* . && \
    npm build

CMD ["npm", "start"]
