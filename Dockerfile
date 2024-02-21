FROM node:20-slim

WORKDIR /app

RUN apt update -y && apt-get install -y openssl

RUN npm install -g pnpm

COPY . .

RUN pnpm install

# RUN npm run build

# Add wait utility for docker-compose https://github.com/ufoscout/docker-compose-wait
COPY --from=ghcr.io/ufoscout/docker-compose-wait:latest /wait /wait 

EXPOSE 3000

CMD /wait && ./docker-entrypoint.sh