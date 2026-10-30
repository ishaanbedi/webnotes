"use client";

import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { createContext, useContext, useEffect, useState } from "react";

const Ready = createContext(false);

/**
 * Creates the Neon Realtime client in the browser only (it opens a WebSocket lazily).
 * When NEXT_PUBLIC_NEON_REALTIME_URL is unset the app simply runs without live updates.
 */
export function RealtimeGate({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ReturnType<typeof createRealtimeClient> | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_NEON_REALTIME_URL;
    if (!url) return;
    const c = createRealtimeClient({ url });
    setClient(c);
  }, []);

  if (!client) return <Ready.Provider value={false}>{children}</Ready.Provider>;
  return (
    <RealtimeProvider client={client}>
      <Ready.Provider value>{children}</Ready.Provider>
    </RealtimeProvider>
  );
}

type Props<Row> = {
  sealed: SealedLiveQuery<Row> | null;
  refresh: () => Promise<SealedLiveQuery<Row>>;
  initial: readonly Row[];
  children: (rows: readonly Row[]) => React.ReactNode;
};

/** Render-prop around useLiveQuery that degrades to the server-rendered rows. */
export function Live<Row>({ sealed, refresh, initial, children }: Props<Row>) {
  const ready = useContext(Ready);
  if (!sealed || !ready) return <>{children(initial)}</>;
  return <Subscribed sealed={sealed} refresh={refresh} initial={initial}>{children}</Subscribed>;
}

function Subscribed<Row>({ sealed, refresh, initial, children }: Omit<Props<Row>, "sealed"> & { sealed: SealedLiveQuery<Row> }) {
  const { data } = useLiveQuery(sealed, { refreshQuery: refresh, initialData: initial });
  return <>{children(data ?? initial)}</>;
}
