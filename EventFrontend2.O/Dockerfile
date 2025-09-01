FROM node:18 AS builder

WORKDIR /app

# Set environment variables for better build performance
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_PREFER_OFFLINE=true

COPY package*.json ./
RUN npm ci --only=production --force

COPY . .
RUN npm run build:docker

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist/* /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

#CMD ["nginx", "-g", "daemon off;"]
CMD ["/entrypoint.sh"]