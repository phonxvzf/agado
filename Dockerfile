FROM node:alpine

WORKDIR /usr/src/app

COPY . .

# Create a non-super group and user
RUN addgroup -S app\
  && adduser -S app -G app\
  && chown -R app /usr/src/app

# Switch to the new user
USER app

ENV NODE_ENV=production
RUN npm install\
  && npm run build\
  && chmod +x ./start-server.sh

EXPOSE 3000

# Init database and start server
CMD [ "./start-server.sh" ]
