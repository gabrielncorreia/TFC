import { useEffect, useState } from 'react';
import { requestData } from './requests';

// Fetches a list and tracks loading and errors. Keeps the previous list while a new one loads,
// so switching filters does not flash a skeleton. Anything that is not a list counts as an error.
const useRequest = (endpoint) => {
  const [state, setState] = useState({ status: 'loading', data: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setState((previous) => ({ ...previous, status: 'loading' }));
    requestData(endpoint)
      .then((data) => {
        if (!current) return;
        setState(Array.isArray(data)
          ? { status: 'ready', data }
          : { status: 'error', data: [] });
      })
      .catch(() => {
        if (current) setState({ status: 'error', data: [] });
      });
    return () => { current = false; };
  }, [endpoint, attempt]);

  return { ...state, retry: () => setAttempt((count) => count + 1) };
};

export default useRequest;
