FROM node:11-alpine

WORKDIR /usr/src/app

COPY . .

# Create a non-super group and user
RUN apk add -U tzdata python alpine-sdk\
  && cp /usr/share/zoneinfo/UTC /etc/localtime\
  && echo "UTC" > /etc/timezone\
  && npm install

ENV NODE_ENV=production
RUN npm run build\
  && chmod +x ./start-server.sh\
  && addgroup -S app\
  && adduser -S app -G app\
  && chown -R app /usr/src/app

RUN apk del tzdata alpine-sdk

# Switch to the new user
USER app

EXPOSE 3000

# Init database and start server
CMD [ "./start-server.sh" ]
