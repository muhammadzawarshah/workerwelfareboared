"use client";

import { useState } from "react";

/**
 * Local editable state that re-syncs whenever the `source` reference changes
 * (e.g. fresh data arrives from a refresh). Uses React's recommended
 * "adjust state during render" pattern instead of a `useEffect`, so optimistic
 * local edits are preserved until new server data replaces them.
 */
export function useSyncedState<T>(source: T) {
  const [state, setState] = useState(source);
  const [previousSource, setPreviousSource] = useState(source);

  if (source !== previousSource) {
    setPreviousSource(source);
    setState(source);
  }

  return [state, setState] as const;
}
