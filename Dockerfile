# Etapa 1: Construcción de React con Node
FROM node:20-alpine AS build
WORKDIR /app
# Copiamos los archivos de NPM primero para cachear dependencias
COPY package*.json ./
RUN npm install
# Copiamos el resto del código y construimos Vite
COPY . .
RUN npm run build

# Etapa 2: Servidor estático con Nginx ligero
FROM nginx:alpine
# Copiamos la carpeta dist (resultado de vite) al server nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Configuración mínima para que React Router funcione (Single Page App)
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
