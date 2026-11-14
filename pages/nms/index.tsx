import React from 'react';

import Link from 'next/link';

import {
    EuiBasicTable,
    EuiBasicTableColumn,
    EuiPageHeader,
    EuiSpacer,
} from '@elastic/eui';

import {
    CnaasStateBadge,
    NetboxStatusBadge,
    NmsError,
    NmsSwitch,
    SyncBadge,
    useNmsQuery,
} from '@/components/Nms';

const columns: EuiBasicTableColumn<NmsSwitch>[] = [
    {
        field: 'hostname',
        name: 'Hostname',
        render: (hostname: string) => (
            <Link href={`/nms/switches/${encodeURIComponent(hostname)}`}>
                {hostname}
            </Link>
        ),
    },
    { field: 'role', name: 'Role' },
    { field: 'site', name: 'Site' },
    { field: 'mgmt_ip', name: 'Mgmt IP' },
    {
        field: 'netbox_status',
        name: 'NetBox',
        render: (status: string | null) => (
            <NetboxStatusBadge status={status} />
        ),
    },
    {
        field: 'cnaas_state',
        name: 'CNaaS state',
        render: (state: string | null) => <CnaasStateBadge state={state} />,
    },
    {
        field: 'cnaas_synchronized',
        name: 'Sync',
        render: (synced: boolean | null) => <SyncBadge synchronized={synced} />,
    },
    {
        field: 'subscription_id',
        name: 'Subscription',
        render: (id: string) => (
            <Link href={`/subscriptions/${id}`}>{id.slice(0, 8)}</Link>
        ),
    },
];

export const NmsSwitchesPage = () => {
    const { data, error, isLoading } = useNmsQuery<NmsSwitch[]>('/switches');

    return (
        <>
            <EuiPageHeader pageTitle="Switches" />
            <EuiSpacer />
            <NmsError error={error} />
            <EuiBasicTable
                items={data ?? []}
                columns={columns}
                loading={isLoading}
                tableLayout="auto"
            />
        </>
    );
};

export default NmsSwitchesPage;
