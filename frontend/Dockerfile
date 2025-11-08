# ---------- Stage 1: Build React app ----------
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Stage 2: Nginx for serving the app ----------
FROM nginx:alpine

# Copy React build files to Nginx's default html folder
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP and HTTPS ports (for online access)
EXPOSE 80


# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
