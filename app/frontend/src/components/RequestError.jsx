import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from '../i18n';

const RequestError = ({ message, retry }) => {
  const { t } = useTranslation();

  return (
    <div className="request-state request-state-error" role="alert">
      <p>{ `${message} ${t('common.wakingUp')}` }</p>
      <button type="button" className="button button-secondary" onClick={ retry }>
        { t('common.retry') }
      </button>
    </div>
  );
};

RequestError.propTypes = {
  message: PropTypes.string.isRequired,
  retry: PropTypes.func.isRequired,
};

export default RequestError;
