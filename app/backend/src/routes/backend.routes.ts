import { Router } from 'express';
import Controller from '../controller/controller';
import Validations from '../middlewares/validations';

const router = Router();
const controller = new Controller();
const validate = new Validations();

router.post('/login', validate.login, controller.loginUser);
router.get('/login/validate', controller.validateUser);

router.get('/teams', controller.getAllTeams);
router.get('/teams/:id', controller.getTeamById);

router.get('/matches', controller.getAllMatches);
router.post('/matches', validate.token, validate.createMatch, controller.createMatch);
router.patch('/matches/:id/finish', controller.finishMatch);
router.patch('/matches/:id', controller.updateMatch);

router.get('/leaderboard/home', controller.getHomeLeaderboard);

router.get('/leaderboard/away', controller.getAwayLeaderboard);

router.get('/leaderboard', controller.getLeaderboard);

export default router;
