import * as express from 'express';
import * as cors from 'cors';
import { rateLimit } from 'express-rate-limit';
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
    // Vercel sits in front of the app; trust its one proxy hop for the client IP.
    this.app.set('trust proxy', 1);
    // shortcut: counts per function instance (in memory), so it slows login floods rather than stopping them; use a shared store if that matters.
    this.app.post('/login', rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: Number(process.env.LOGIN_RATE_LIMIT) || 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { message: 'Too many login attempts, try again later' },
    }));
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

// Vercel looks for a default export in src/app.ts and runs it as a function; server.ts keeps listen() for local use.
export default app;
