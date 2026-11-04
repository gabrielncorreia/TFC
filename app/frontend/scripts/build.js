// Emit the webpack runtime as a file instead of an inline <script>, so the
// Content-Security-Policy in vercel.json can allow scripts from 'self' only.
process.env.INLINE_RUNTIME_CHUNK = 'false';
require('react-scripts/scripts/build');
