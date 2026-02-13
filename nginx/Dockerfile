# Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
ENV VITE_API_URL=/api
COPY front/package*.json ./front/
RUN cd front && npm install
COPY front ./front
RUN cd front && npm run build

#Nginx RunTime
FROM nginx:1.25-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/front/dist /usr/share/nginx/html