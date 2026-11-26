import { useCallback, useContext, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import {
    OrchestratorConfigContext,
    WfoSession,
} from '@orchestrator-ui/orchestrator-ui-components';

export type NmsSwitch = {
    subscription_id: string;
    hostname: string;
    role: string;
    site: string;
    mgmt_ip: string;
    serial: string;
    model: string;
    netbox_id: number | null;
    netbox_status: string | null;
    cnaas_id: number | null;
    cnaas_state: string | null;
    cnaas_synchronized: boolean | null;
    os_version: string | null;
};

export type NmsCorelink = {
    subscription_id: string;
    description: string;
    a_side: string;
    b_side: string;
    members: number;
};

export type NmsSwitchDetail = {
    wfo: Record<string, unknown>;
    netbox: Record<string, unknown>;
    cnaas: Record<string, unknown> | null;
    corelinks: NmsCorelink[];
};

export type NmsInterface = {
    name: string;
    enabled: boolean;
    up: boolean;
    description: string;
    speed: number;
};

export type NmsLiveData = {
    fetched_at: string;
    interfaces: NmsInterface[];
    facts: Record<string, unknown>;
};

export type NmsDiscovered = {
    cnaas_id: number;
    hostname: string;
    ztp_mac: string;
    dhcp_ip: string;
    serial: string;
    model: string;
    platform: string;
    state: string;
    matched_subscription_id: string | null;
};

export type NmsJob = {
    id: number;
    function_name: string;
    status: string;
    start_time: string | null;
    finish_time: string | null;
    comment: string | null;
    ticket_ref: string | null;
};

/** Returns a fetch function for the /api/nms router (same origin as the orchestrator REST API). */
export const useNmsFetch = () => {
    const { orchestratorApiBaseUrl } = useContext(OrchestratorConfigContext);
    const { data: session } = useSession();
    const accessToken = (session as WfoSession | null)?.accessToken;

    return useCallback(
        async <T>(path: string, init?: RequestInit): Promise<T> => {
            const response = await fetch(
                `${orchestratorApiBaseUrl}/nms${path}`,
                {
                    ...init,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken
                            ? { Authorization: `Bearer ${accessToken}` }
                            : {}),
                    },
                },
            );
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }
            return response.json() as Promise<T>;
        },
        [orchestratorApiBaseUrl, accessToken],
    );
};

/** GET helper with loading/error state and optional polling interval (ms). */
export const useNmsQuery = <T>(path: string, pollInterval?: number) => {
    const nmsFetch = useNmsFetch();
    const [data, setData] = useState<T | undefined>();
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);

    const refetch = useCallback(() => {
        nmsFetch<T>(path)
            .then((result) => {
                setData(result);
                setError(undefined);
            })
            .catch((e: Error) => setError(e.message))
            .finally(() => setIsLoading(false));
    }, [nmsFetch, path]);

    useEffect(() => {
        refetch();
        if (!pollInterval) return;
        const timer = setInterval(refetch, pollInterval);
        return () => clearInterval(timer);
    }, [refetch, pollInterval]);

    return { data, error, isLoading, refetch };
};
