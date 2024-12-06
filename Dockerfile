# Stage 1: Build the application
FROM node:20.8-slim as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files to the container
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using nginx
FROM nginx:1.25-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built application from the previous stage to the nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration file (optional, see below)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port nginx will serve on
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
