FROM node:24-alpine
# Criando um diretorio de trabalho:
WORKDIR /app
# Copiando determinados arquivos para o workdir, para a pasta /app, o diretório atual:
COPY package*.json ./
# Rodar o comando necessário para instalar as dependencias do projeto:
RUN npm install
# Copiar os outros arquivos que estão no /backend para dentro do container:
COPY . .

# RUN npm run build && npm run db:reset &&
# Definir qual vai ser a porta do container que irá expor o app e todo o conteúdo do container:
EXPOSE 3001

RUN npm run build
# The image defaults to production: it serves the compiled API and never changes the database.
# docker-compose overrides both for local work (NODE_ENV=development, `npm run dev`, which rebuilds and reseeds).
ENV NODE_ENV=production
CMD ["npm", "start"]
# RUN npm run build

# RUN npx nodemon --watch "./src/**" --ext ts,js --ignore "src/**/*.spec.ts,src/**/*.json" --exec ts-node src/server.ts
