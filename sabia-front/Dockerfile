# Fase 1: Build do React
FROM node:20-alpine as builder

WORKDIR /sabia-front

COPY package*.json  ./

RUN npm install

COPY . .

RUN npm run build

# Fase 2: Servir com Nginx
FROM nginx:stable-alpine

# Remove configuração padrão
RUN rm -rf /etc/nginx/conf.d

# Copia sua configuração customizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copia o build do React
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
