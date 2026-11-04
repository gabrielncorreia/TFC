import React from 'react';
import PropTypes from 'prop-types';
import useRequest from '../services/useRequest';
import { useTranslation } from '../i18n';
import RequestError from './RequestError';
import '../styles/components/leaderboardTable.css';

const COLUMNS = [
  { key: 'totalPoints', testId: 'total_points' },
  { key: 'totalGames', testId: 'total_games' },
  { key: 'totalVictories', testId: 'total_victories' },
  { key: 'totalDraws', testId: 'total_draws' },
  { key: 'totalLosses', testId: 'total_looses' },
  { key: 'goalsFavor', testId: 'goals_favor', wide: true },
  { key: 'goalsOwn', testId: 'goals_own', wide: true },
  { key: 'goalsBalance', testId: 'goals_balance' },
  { key: 'efficiency', testId: 'efficiency', optional: true },
];

const ZONE_SIZE = 4;

const formatValue = (key, value, locale) => {
  if (key === 'goalsBalance' && value > 0) return `+${value}`;
  if (key === 'goalsBalance' && value < 0) return `−${Math.abs(value)}`;
  if (key === 'efficiency') {
    return Number(value).toLocaleString(locale, { maximumFractionDigits: 1 });
  }
  return value;
};

const zoneOf = (index, total) => {
  if (total <= ZONE_SIZE * 2) return '';
  if (index < ZONE_SIZE) return 'zone-top';
  if (index >= total - ZONE_SIZE) return 'zone-bottom';
  return '';
};

const TableSkeleton = ({ label }) => (
  <div className="standings" aria-busy="true" aria-label={ label }>
    {
      Array.from({ length: 8 }, (_, row) => (
        <div className="standings-skeleton-row" key={ row }>
          <span className="skeleton" style={ { width: '1.75rem' } } />
          <span className="skeleton" style={ { width: `${9 + ((row * 3) % 6)}rem` } } />
          <span className="skeleton" style={ { marginLeft: 'auto', width: '12rem' } } />
        </div>
      ))
    }
  </div>
);

TableSkeleton.propTypes = {
  label: PropTypes.string.isRequired,
};

const LeaderboardTable = ({ endpoint }) => {
  const { t, locale } = useTranslation();
  const { status, data, retry } = useRequest(endpoint);

  if (status === 'error') {
    return <RequestError message={ t('leaderboard.loadError') } retry={ retry } />;
  }
  if (!data.length) return <TableSkeleton label={ t('leaderboard.loading') } />;

  return (
    <>
      <div className="standings" aria-busy={ status === 'loading' }>
        <table className="standings-table">
          <thead>
            <tr>
              <th scope="col" data-testid="score_boarding__classification">
                <abbr title={ t('leaderboard.position') }>#</abbr>
              </th>
              <th scope="col" className="standings-team" data-testid="score_boarding__team_name">
                { t('leaderboard.team') }
              </th>
              {
                COLUMNS.map(({ key, testId, wide, optional }) => {
                  const [abbr, title] = t(`leaderboard.columns.${key}`);
                  return (
                    <th
                      scope="col"
                      key={ key }
                      className={ [wide && 'standings-wide', optional && 'standings-optional'].filter(Boolean).join(' ') || undefined }
                      data-testid={ `score_boarding__${testId}` }
                    >
                      <abbr title={ title }>{ abbr }</abbr>
                    </th>
                  );
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              data.map((team, index) => (
                <tr key={ team.name }>
                  <td data-testid={ `score_boarding__classification_${index + 1}` }>
                    <span className={ `position ${zoneOf(index, data.length)}` }>
                      { index + 1 }
                    </span>
                  </td>
                  <th
                    scope="row"
                    className="standings-team"
                    data-testid={ `score_boarding__team_name_${index + 1}` }
                  >
                    { team.name }
                  </th>
                  {
                    COLUMNS.map(({ key, testId, wide, optional }) => (
                      <td
                        key={ key }
                        className={ [
                          key === 'totalPoints' ? 'standings-points' : '',
                          wide ? 'standings-wide' : '',
                          optional ? 'standings-optional' : '',
                        ].join(' ').trim() || undefined }
                        data-testid={ `score_boarding__${testId}_${index + 1}` }
                      >
                        { formatValue(key, team[key], locale) }
                      </td>
                    ))
                  }
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      {
        (data.length > ZONE_SIZE * 2) && (
          <ul className="standings-legend">
            <li>
              <span className="legend-swatch zone-top" aria-hidden="true" />
              { t('leaderboard.legendTop') }
            </li>
            <li>
              <span className="legend-swatch zone-bottom" aria-hidden="true" />
              { t('leaderboard.legendBottom') }
            </li>
          </ul>
        )
      }
    </>
  );
};

LeaderboardTable.propTypes = {
  endpoint: PropTypes.string.isRequired,
};

export default LeaderboardTable;
