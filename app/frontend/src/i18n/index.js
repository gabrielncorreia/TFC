import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import messages from './messages';

const STORAGE_KEY = 'language';
const LanguageContext = createContext(null);

// A saved choice wins; otherwise Portuguese browsers get Portuguese and everyone else English.
export const detectLanguage = (saved, browserLanguage) => {
  if (saved && messages[saved]) return saved;
  return (browserLanguage || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
};

// Looks up a dotted key; a missing key shows the key itself, so gaps are visible, not blank.
export const translate = (language, key, vars = {}) => {
  const text = key.split('.').reduce((node, part) => node && node[part], messages[language]);
  if (typeof text !== 'string' && !Array.isArray(text)) return key;
  if (Array.isArray(text)) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => detectLanguage(localStorage.getItem(STORAGE_KEY), navigator.language),
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = messages[language].htmlLang;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    locale: messages[language].locale,
    t: (key, vars) => translate(language, key, vars),
  }), [language]);

  return <LanguageContext.Provider value={ value }>{ children }</LanguageContext.Provider>;
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useTranslation = () => useContext(LanguageContext);
