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
    // Comma-separated list of front-end origins allowed to call the API.
    const origin = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');

    this.app.use(cors({ origin }));
    this.app.use(express.json()); // Necessário para fazer o parse do body.
    this.app.use(Routes);
    this.app.use(App.errorHandler);
  }

  // Client errors (such as malformed JSON) keep their status; anything else is logged and hidden.
  private static errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
    if (err.status >= 400 && err.status < 500) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  };

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
