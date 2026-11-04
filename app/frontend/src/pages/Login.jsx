import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { requestLogin } from '../services/requests';
import { positiveLogo } from '../images';
import { useTranslation } from '../i18n';
import '../styles/pages/login.css';

// Public demo account, set at build time on Vercel only; local builds show nothing.
const DEMO_EMAIL = process.env.REACT_APP_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.REACT_APP_DEMO_PASSWORD;

const errorKey = (error) => {
  const status = error.response && error.response.status;
  if (status === 401 || status === 400) return 'login.wrongCredentials';
  if (status === 429) return 'login.tooManyAttempts';
  return 'login.unreachable';
};

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const login = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { token, user } = await requestLogin('/login', { email, password });
      localStorage.setItem('user', JSON.stringify({ token, ...user }));
      setIsLogged(true);
    } catch (requestError) {
      setError(errorKey(requestError));
      setSubmitting(false);
    }
  };

  if (isLogged) return <Navigate to="/matches" />;

  return (
    <>
      <Header />
      <main className="page login-page">
        <section className="login-panel" aria-labelledby="login-title">
          <img className="login-logo" src={ positiveLogo } alt="" />
          <h1 id="login-title" data-testid="header__title">{ t('login.title') }</h1>
          <p className="page-lede">{ t('login.lede') }</p>

          {
            (DEMO_EMAIL && DEMO_PASSWORD) && (
              <div className="demo-credentials">
                <p>
                  { `${t('login.demoAccount')} ` }
                  <strong>{ DEMO_EMAIL }</strong>
                  { `${t('login.demoPassword')} ` }
                  <strong>{ DEMO_PASSWORD }</strong>
                </p>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={ () => {
                    setEmail(DEMO_EMAIL);
                    setPassword(DEMO_PASSWORD);
                  } }
                >
                  { t('login.fillDemo') }
                </button>
              </div>
            )
          }

          <form className="login-form" onSubmit={ login } noValidate>
            <label htmlFor="login-email">{ t('login.email') }</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={ email }
              onChange={ ({ target: { value } }) => setEmail(value) }
              aria-describedby={ error ? 'login-error' : undefined }
              data-testid="login__login_input"
            />
            <label htmlFor="login-password">{ t('login.password') }</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={ password }
              onChange={ ({ target: { value } }) => setPassword(value) }
              aria-describedby={ error ? 'login-error' : undefined }
              data-testid="login__password_input"
            />
            {
              (error) && (
                <p
                  id="login-error"
                  className="form-error"
                  role="alert"
                  data-testid="login__input_invalid_login_alert"
                >
                  { t(error) }
                </p>
              )
            }
            <button
              className="button button-primary"
              data-testid="login__login_btn"
              type="submit"
              disabled={ submitting || !email || !password }
            >
              { submitting ? t('login.submitting') : t('login.submit') }
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Login;
