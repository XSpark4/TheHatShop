FROM node:20-alpine AS build

WORKDIR /app

# Build-time environment variables used by Vite.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

# Install dependencies for Docker layer caching.
COPY package*.json ./
RUN npm ci

# Copy source and build production assets.
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production

# Copy built static assets from Vite output.
COPY --from=build /app/dist /usr/share/nginx/html

# Configure SPA fallback for client-side routing.
RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location /assets/ {\n    add_header Cache-Control "public, max-age=31536000, immutable";\n    try_files $uri =404;\n  }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
