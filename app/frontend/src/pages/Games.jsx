import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import MatchList from '../components/MatchList';
import SegmentedControl from '../components/SegmentedControl';
import { useTranslation } from '../i18n';
import '../styles/pages/games.css';

const FILTERS = [
  { value: '/matches', labelKey: 'matches.filterAll' },
  { value: '/matches?inProgress=true', labelKey: 'matches.filterLive' },
  { value: '/matches?inProgress=false', labelKey: 'matches.filterFinished' },
];

const Games = () => {
  const { t } = useTranslation();
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')) || {});
  const [logged, setLogin] = useState(Boolean(user.token));
  const [endpoint, setEndpoint] = useState(FILTERS[0].value);
  const isAdm = logged && user.role === 'admin';

  return (
    <>
      <Header logged={ logged } setLogin={ setLogin } />
      <main className="page">
        <div className="page-heading">
          <div>
            <h1 data-testid="header__title">{ t('matches.title') }</h1>
            <p className="page-lede">
              {
                (logged && !isAdm)
                  ? t('matches.readOnly')
                  : t('matches.lede')
              }
            </p>
          </div>
          {
            (isAdm) && (
              <Link
                className="button button-primary"
                data-testid="header__add_match_btn"
                to="/matches/settings"
              >
                { t('matches.add') }
              </Link>
            )
          }
        </div>
        <div className="matches-filter">
          <SegmentedControl
            name="match-filter"
            legend={ t('matches.filterLegend') }
            options={ FILTERS.map(({ value, labelKey }) => ({ value, label: t(labelKey) })) }
            value={ endpoint }
            onChange={ setEndpoint }
            testId="matches__option_show_finish_matches"
          />
        </div>
        <MatchList endpoint={ endpoint } isAdm={ isAdm } />
      </main>
    </>
  );
};

export default Games;
