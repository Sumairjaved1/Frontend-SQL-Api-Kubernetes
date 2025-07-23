# Use a Node.js base image with a suitable version
FROM node:16-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app will run on
EXPOSE 3050

# Define the start command (make sure your "start" script is defined in package.json)
CMD ["npm", "start"]
