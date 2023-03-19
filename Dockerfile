# use node
FROM node:12

# Create app directory
WORKDIR /usr/src/module

# Copy directory
COPY . /usr/src/module

# Install dependencies
RUN npm i

# CMD
CMD ["node", "index"]