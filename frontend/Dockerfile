# --- Stage 1: Build React Assets ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve via Nginx ---
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy custom nginx configuration for reverse proxying & react routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
