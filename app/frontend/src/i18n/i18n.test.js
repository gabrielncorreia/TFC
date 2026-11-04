import messages from './messages';
import { detectLanguage, translate } from '.';

const keysOf = (node, prefix = '') => Object.entries(node).flatMap(([key, value]) => (
  (value && typeof value === 'object' && !Array.isArray(value))
    ? keysOf(value, `${prefix}${key}.`)
    : [`${prefix}${key}`]
));

test('Portuguese and English have exactly the same keys', () => {
  expect(keysOf(messages.en).sort()).toEqual(keysOf(messages.pt).sort());
});

test('a saved language wins, otherwise the browser language decides', () => {
  expect(detectLanguage('en', 'pt-BR')).toBe('en');
  expect(detectLanguage(null, 'pt-BR')).toBe('pt');
  expect(detectLanguage(null, 'pt')).toBe('pt');
  expect(detectLanguage(null, 'en-US')).toBe('en');
  expect(detectLanguage('xx', 'de-DE')).toBe('en');
});

test('translate looks up dotted keys, fills variables and shows missing keys', () => {
  expect(translate('pt', 'nav.matches')).toBe('Partidas');
  expect(translate('en', 'nav.matches')).toBe('Matches');
  expect(translate('en', 'leaderboard.columns.totalPoints')).toEqual(['Pts', 'Points']);
  expect(translate('en', 'nope.missing')).toBe('nope.missing');
});
