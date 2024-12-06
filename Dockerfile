# Use Node.js as the base image
FROM node:20.8-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files to the container
COPY . .

# Expose the port your app will run on
EXPOSE 5174

# Start the Vite development server with host exposed
CMD ["npm", "run", "dev", "--", "--host"]
