FROM nginx:alpine

COPY src /usr/share/nginx/html
COPY ./start-nginx.sh .
COPY ./nginx-agado-web.conf /etc/nginx/conf.d/default.conf

RUN apk update && apk add curl && chmod +x ./start-nginx.sh

EXPOSE 80

CMD [ "./start-nginx.sh" ]
