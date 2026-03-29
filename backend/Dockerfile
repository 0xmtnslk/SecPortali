FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Create uploads directory for DXF files
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

EXPOSE 3001

CMD ["npm", "run", "dev"]