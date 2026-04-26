# Stage 1: Build the Angular application
FROM node:20 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Environment variables to be injected during build
ARG API_URL
ARG WS_SERVER

# Run the replacement script
RUN API_URL=${API_URL} WS_SERVER=${WS_SERVER} node replace-env.js

# Build the Angular app for production
RUN npm run build -- --configuration production

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm -rf /usr/share/nginx/html/*
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy the build output from the first stage
# Note: Check your angular.json "outputPath" - usually it's dist/<project-name>
COPY --from=build /app/dist/jamer /usr/share/nginx/html

# Copy custom Nginx configuration if it exists
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
