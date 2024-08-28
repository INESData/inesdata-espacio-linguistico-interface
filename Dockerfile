FROM nginx:stable-alpine
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY ./nginx/index.html /usr/share/nginx/html
COPY ./target/dist /usr/share/nginx/html/dataspace
