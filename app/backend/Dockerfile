FROM node:16-alpine
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

ENTRYPOINT ["npm", "start"]
# RUN npm run build

# RUN npx nodemon --watch "./src/**" --ext ts,js --ignore "src/**/*.spec.ts,src/**/*.json" --exec ts-node src/server.ts
