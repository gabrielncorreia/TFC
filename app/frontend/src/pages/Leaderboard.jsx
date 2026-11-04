import React, { useState } from 'react';
import Header from '../components/Header';
import LeaderboardTable from '../components/LeaderboardTable';
import SegmentedControl from '../components/SegmentedControl';
import { useTranslation } from '../i18n';

const FILTERS = [
  { value: '/leaderboard', labelKey: 'leaderboard.filterAll' },
  { value: '/leaderboard/home', labelKey: 'leaderboard.filterHome' },
  { value: '/leaderboard/away', labelKey: 'leaderboard.filterAway' },
];

const Leaderboard = () => {
  const { t } = useTranslation();
  const [logged, setLogin] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return Boolean(user.token);
  });
  const [endpoint, setEndpoint] = useState(FILTERS[0].value);

  return (
    <>
      <Header logged={ logged } setLogin={ setLogin } />
      <main className="page">
        <div className="page-heading">
          <div>
            <h1 data-testid="header__title">{ t('leaderboard.title') }</h1>
            <p className="page-lede">{ t('leaderboard.lede') }</p>
          </div>
          <SegmentedControl
            name="classification-filter"
            legend={ t('leaderboard.filterLegend') }
            options={ FILTERS.map(({ value, labelKey }) => ({ value, label: t(labelKey) })) }
            value={ endpoint }
            onChange={ setEndpoint }
            testId="score_boarding__classification_filter"
          />
        </div>
        <LeaderboardTable endpoint={ endpoint } />
      </main>
    </>
  );
};

export default Leaderboard;
