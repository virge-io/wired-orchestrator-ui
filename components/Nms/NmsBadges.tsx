import React from 'react';

import { EuiBadge } from '@elastic/eui';

const CNAAS_STATE_COLORS: Record<string, string> = {
    MANAGED: 'success',
    INIT: 'warning',
    DISCOVERED: 'warning',
    DHCP_BOOT: 'default',
    PRE_CONFIGURED: 'default',
    UNMANAGED: 'danger',
};

export const CnaasStateBadge = ({ state }: { state?: string | null }) =>
    state ? (
        <EuiBadge color={CNAAS_STATE_COLORS[state] ?? 'default'}>
            {state}
        </EuiBadge>
    ) : (
        <EuiBadge color="default">not in CNaaS</EuiBadge>
    );

export const NetboxStatusBadge = ({ status }: { status?: string | null }) => (
    <EuiBadge color={status === 'active' ? 'primary' : 'default'}>
        {status ?? 'not in NetBox'}
    </EuiBadge>
);

export const SyncBadge = ({
    synchronized,
}: {
    synchronized?: boolean | null;
}) =>
    synchronized == null ? (
        <span>-</span>
    ) : (
        <EuiBadge color={synchronized ? 'success' : 'warning'}>
            {synchronized ? 'synced' : 'out of sync'}
        </EuiBadge>
    );

export const NmsError = ({ error }: { error?: string }) =>
    error ? <EuiBadge color="danger">Error: {error}</EuiBadge> : null;
