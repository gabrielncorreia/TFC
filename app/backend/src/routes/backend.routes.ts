import { RequestHandler, Router } from 'express';
import Controller from '../controller/controller';
import Validations from '../middlewares/validations';

const router = Router();
const controller = new Controller();
const validate = new Validations();

// Express 4 ignores rejected promises; this forwards them to the error handler in app.ts.
const safe = (handler: RequestHandler): RequestHandler => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.post('/login', validate.login, safe(controller.loginUser));
router.get('/login/validate', safe(controller.validateUser));

router.get('/teams', safe(controller.getAllTeams));
router.get('/teams/:id', safe(controller.getTeamById));

router.get('/matches', safe(controller.getAllMatches));
router.post('/matches', validate.token, safe(validate.createMatch), safe(controller.createMatch));
router.patch('/matches/:id/finish', validate.token, safe(controller.finishMatch));
router.patch('/matches/:id', validate.token, safe(controller.updateMatch));

router.get('/leaderboard/home', safe(controller.getHomeLeaderboard));

router.get('/leaderboard/away', safe(controller.getAwayLeaderboard));

router.get('/leaderboard', safe(controller.getLeaderboard));

// Called nightly by the Vercel cron in vercel.json to restore the demo data.
router.get('/demo/reset', validate.cronSecret, safe(controller.resetDemo));

export default router;
