import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { negativeLogo } from '../images';
import { useTranslation } from '../i18n';
import '../styles/components/header.css';

const LANGUAGES = [
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
];

const Header = ({ logged, setLogin }) => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();

  const logoff = () => {
    localStorage.removeItem('user');
    setLogin(false);
    navigate('/leaderboard');
  };

  return (
    <>
      <p className="demo-notice" role="note">{ t('common.notice') }</p>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/leaderboard" className="site-logo">
            <img src={ negativeLogo } alt={ t('common.logoAlt') } />
          </Link>
          <nav className="site-nav" aria-label={ t('common.mainNav') }>
            <NavLink data-testid="header__show_classification_btn" to="/leaderboard">
              { t('nav.leaderboard') }
            </NavLink>
            <NavLink data-testid="header__show_matches_btn" to="/matches">
              { t('nav.matches') }
            </NavLink>
            {
              (logged)
                ? (
                  <button type="button" className="site-nav-logout" onClick={ logoff }>
                    { t('nav.logout') }
                  </button>
                )
                : (
                  <NavLink data-testid="header__login_btn" to="/login">
                    { t('nav.login') }
                  </NavLink>
                )
            }
          </nav>
          <div className="language-switch" role="group" aria-label={ t('common.language') }>
            {
              LANGUAGES.map(({ code, label, name }) => (
                <button
                  key={ code }
                  type="button"
                  lang={ code }
                  aria-label={ name }
                  aria-pressed={ language === code }
                  onClick={ () => setLanguage(code) }
                >
                  { label }
                </button>
              ))
            }
          </div>
        </div>
      </header>
    </>
  );
};

Header.propTypes = {
  logged: PropTypes.bool,
  setLogin: PropTypes.func,
};

Header.defaultProps = {
  logged: false,
  setLogin: () => {},
};

export default Header;
