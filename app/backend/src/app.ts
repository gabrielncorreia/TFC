import * as express from 'express';
import * as cors from 'cors';
import Routes from './routes/backend.routes';

class App {
  public app: express.Express;
  // ...

  constructor() {
    // ...
    this.app = express();
    this.config();
    // ...
  }

  private config():void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    };

    this.app.use(cors());
    this.app.use(accessControl);
    this.app.use(express.json()); // Necessário para fazer o parse do body.
    this.app.use(Routes);
    // ...
  }

  // ...
  public start(PORT: string | number):void {
    this.app.listen(PORT, () => {
      console.log(`Ouvindo na porta ${PORT}`); // O app se comunicou com o DB na porta 3306. Já a API está pegando todas esses dados, com todas as requisições e etc, e disponibilizando em outra porta, nesse caso na 3002, como foi definido no .env.
    });
  }
}

export { App };

// A execução dos testes de cobertura depende dessa exportação
export const { app } = new App();
