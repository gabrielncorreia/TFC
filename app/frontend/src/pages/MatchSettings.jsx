import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GoalStepper from '../components/GoalStepper';
import Header from '../components/Header';
import api, { requestData, setToken } from '../services/requests';
import { useTranslation } from '../i18n';
import '../styles/pages/matchSettings.css';

const SIDES = [
  { key: 'home', teamKey: 'homeTeam', goalsKey: 'homeTeamGoals', nameKey: 'teamHome' },
  { key: 'away', teamKey: 'awayTeam', goalsKey: 'awayTeamGoals', nameKey: 'teamAway' },
];

const failureKey = (error) => (error.response && error.response.status === 403
  ? 'editor.forbidden'
  : 'editor.saveError');

const MatchSettings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teams, setTeams] = useState([]);
  // The match being edited: from the list (location.state) or the one just started here.
  const [match, setMatch] = useState(location.state || null);
  const [picked, setPicked] = useState({ homeTeam: '', awayTeam: '' });
  const [goals, setGoals] = useState({
    homeTeamGoals: Number((location.state || {}).homeTeamGoals) || 0,
    awayTeamGoals: Number((location.state || {}).awayTeamGoals) || 0,
  });
  const [saved, setSaved] = useState(goals);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ key: '', error: false });

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem('user'));
    if (!storage) {
      navigate('/login');
      return;
    }
    setToken(storage.token);
    api.get('/login/validate')
      .then(({ data: role }) => (role === 'admin' ? setIsAuthenticated(true) : navigate('/matches')))
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && !match) {
      requestData('/teams').then(setTeams).catch(() => setMessage({
        key: 'editor.teamsError',
        error: true,
      }));
    }
  }, [isAuthenticated, match]);

  const run = async (action, success) => {
    setBusy(true);
    setMessage({ key: '', error: false });
    try {
      await action();
      setMessage({ key: success, error: false });
    } catch (error) {
      setMessage({ key: failureKey(error), error: true });
    }
    setBusy(false);
  };

  const startMatch = () => run(async () => {
    const { data } = await api.post('/matches', {
      homeTeam: Number(picked.homeTeam),
      awayTeam: Number(picked.awayTeam),
      ...goals,
      inProgress: true,
    });
    const name = (id) => teams.find((team) => team.id === Number(id)).teamName;
    setMatch({
      ...data,
      teamHome: { teamName: name(picked.homeTeam) },
      teamAway: { teamName: name(picked.awayTeam) },
    });
    setSaved(goals);
  }, 'editor.started');

  const saveScore = () => run(async () => {
    await api.patch(`/matches/${match.id}`, goals);
    setSaved(goals);
  }, 'editor.saved');

  const finishMatch = () => run(async () => {
    await api.patch(`/matches/${match.id}`, goals);
    await api.patch(`/matches/${match.id}/finish`);
    navigate('/matches');
  }, '');

  const sameTeam = picked.homeTeam && picked.homeTeam === picked.awayTeam;
  const canStart = picked.homeTeam && picked.awayTeam && !sameTeam;
  const unsaved = goals.homeTeamGoals !== saved.homeTeamGoals
    || goals.awayTeamGoals !== saved.awayTeamGoals;

  return (
    <>
      <Header logged={ isAuthenticated } setLogin={ setIsAuthenticated } />
      <main className="page">
        <div className="page-heading">
          <div>
            <h1 data-testid="header__title">{ match ? t('editor.titleEdit') : t('editor.titleNew') }</h1>
            <p className="page-lede">
              {
                match
                  ? t('editor.ledeEdit')
                  : t('editor.ledeNew')
              }
            </p>
          </div>
        </div>

        {
          (!isAuthenticated)
            ? <div className="match-editor" aria-busy="true" aria-label={ t('common.loading') }><span className="skeleton" /></div>
            : (
              <form className="match-editor" onSubmit={ (event) => event.preventDefault() }>
                <div className="match-editor-sides">
                  {
                    SIDES.map((side, index) => (
                      <React.Fragment key={ side.key }>
                        { index === 1 && <span className="match-editor-versus" aria-hidden="true">×</span> }
                        <fieldset className={ `match-editor-side match-editor-side-${side.key}` }>
                          <legend>{ t(`editor.${side.key}`) }</legend>
                          {
                            match
                              ? <p className="match-editor-team">{ match[side.nameKey].teamName }</p>
                              : (
                                <>
                                  <label className="visually-hidden" htmlFor={ `${side.key}-team` }>
                                    { t(`editor.${side.key}Team`) }
                                  </label>
                                  <select
                                    id={ `${side.key}-team` }
                                    value={ picked[side.teamKey] }
                                    onChange={ ({ target: { value } }) => setPicked(
                                      (previous) => ({ ...previous, [side.teamKey]: value }),
                                    ) }
                                    data-testid={ `insertion_matches__select_${side.key}_team` }
                                  >
                                    <option value="" disabled>{ t('editor.chooseTeam') }</option>
                                    {
                                      teams.map(({ id, teamName }) => (
                                        <option key={ id } value={ id }>{ teamName }</option>
                                      ))
                                    }
                                  </select>
                                </>
                              )
                          }
                          <GoalStepper
                            id={ `${side.key}-goals` }
                            label={ t('editor.goals') }
                            removeLabel={ t('editor.removeGoal') }
                            addLabel={ t('editor.addGoal') }
                            value={ goals[side.goalsKey] }
                            min={ saved[side.goalsKey] }
                            onChange={ (value) => setGoals(
                              (previous) => ({ ...previous, [side.goalsKey]: value }),
                            ) }
                            disabled={ busy }
                            testId={ `insertion_matches__select_quantity_goals_${side.key}_team` }
                          />
                        </fieldset>
                      </React.Fragment>
                    ))
                  }
                </div>

                <div className="match-editor-footer">
                  <p
                    className={ `match-editor-message ${message.error ? 'is-error' : ''}` }
                    role={ message.error ? 'alert' : 'status' }
                  >
                    { sameTeam ? t('editor.sameTeam') : (message.key && t(message.key)) }
                  </p>
                  <div className="match-editor-actions">
                    {
                      match
                        ? (
                          <>
                            <button
                              type="button"
                              className="button button-secondary"
                              data-testid="insertion_matches__edit_match_btn"
                              disabled={ busy || !unsaved }
                              onClick={ saveScore }
                            >
                              { t('editor.save') }
                            </button>
                            <button
                              type="button"
                              className="button button-primary"
                              data-testid="insertion_matches__finish_match_btn"
                              disabled={ busy }
                              onClick={ finishMatch }
                            >
                              { t('editor.finish') }
                            </button>
                          </>
                        )
                        : (
                          <button
                            type="button"
                            className="button button-primary"
                            data-testid="insertion_matches__save_match_btn"
                            disabled={ busy || !canStart }
                            onClick={ startMatch }
                          >
                            { t('editor.start') }
                          </button>
                        )
                    }
                  </div>
                </div>
              </form>
            )
        }
      </main>
    </>
  );
};

export default MatchSettings;
