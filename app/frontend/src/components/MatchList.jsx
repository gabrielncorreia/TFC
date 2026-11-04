import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useRequest from '../services/useRequest';
import { useTranslation } from '../i18n';
import RequestError from './RequestError';

const ListSkeleton = ({ label }) => (
  <ul className="match-list" aria-busy="true" aria-label={ label }>
    {
      Array.from({ length: 6 }, (_, row) => (
        <li className="match-row" key={ row }>
          <span className="skeleton" style={ { width: '6rem' } } />
          <span className="skeleton match-skeleton-team" />
          <span className="skeleton" style={ { height: '2.75rem', width: '6rem' } } />
          <span className="skeleton match-skeleton-team" />
        </li>
      ))
    }
  </ul>
);

const MatchList = ({ endpoint, isAdm }) => {
  const { t } = useTranslation();
  const { status, data, retry } = useRequest(endpoint);
  const navigate = useNavigate();

  if (status === 'error') {
    return <RequestError message={ t('matches.loadError') } retry={ retry } />;
  }
  if (status === 'loading' && !data.length) return <ListSkeleton label={ t('matches.loading') } />;
  if (!data.length) {
    return (
      <div className="request-state">
        <p>{ t('matches.empty') }</p>
      </div>
    );
  }

  const matches = [...data].sort((a, b) => b.inProgress - a.inProgress);

  return (
    <ul className="match-list" aria-busy={ status === 'loading' }>
      {
        matches.map((match) => {
          const { id, teamHome, homeTeamGoals, teamAway, awayTeamGoals, inProgress } = match;
          return (
            <li className="match-row" key={ id }>
              <p
                className={ `match-status ${inProgress ? 'is-live' : ''}` }
                data-testid={ `matches__match_status_${id}` }
              >
                { inProgress ? t('matches.live') : t('matches.finished') }
              </p>
              <p className="match-team match-team-home" data-testid={ `matches__home_team_${id}` }>
                { teamHome.teamName }
              </p>
              <p className="match-score">
                <span className="visually-hidden">
                  { `${teamHome.teamName} ${homeTeamGoals}, ${teamAway.teamName} ${awayTeamGoals}` }
                </span>
                <span className="score-home" aria-hidden="true" data-testid={ `matches__home_team_goals_${id}` }>
                  { homeTeamGoals }
                </span>
                <span className="score-away" aria-hidden="true" data-testid={ `matches__away_team_goals_${id}` }>
                  { awayTeamGoals }
                </span>
              </p>
              <p className="match-team match-team-away" data-testid={ `matches__away_team_${id}` }>
                { teamAway.teamName }
              </p>
              <div className="match-action">
                {
                  (isAdm && inProgress) && (
                    <button
                      type="button"
                      className="button button-secondary"
                      data-testid={ `matches__match_status_btn_${id}` }
                      onClick={ () => navigate('/matches/settings', { state: match }) }
                    >
                      { t('matches.editScore') }
                    </button>
                  )
                }
              </div>
            </li>
          );
        })
      }
    </ul>
  );
};

ListSkeleton.propTypes = {
  label: PropTypes.string.isRequired,
};

MatchList.propTypes = {
  endpoint: PropTypes.string.isRequired,
  isAdm: PropTypes.bool.isRequired,
};

export default MatchList;
