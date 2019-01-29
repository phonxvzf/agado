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
  && npm run build

EXPOSE 3000

# Init database and start server
CMD [ "npm", "start" ]
