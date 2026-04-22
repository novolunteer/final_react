#빌드 스테이지
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

#실행 스테이지
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
EXPOSE 8080
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]