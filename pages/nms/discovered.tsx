import React, { useState } from 'react';

import Link from 'next/link';

import {
    EuiBasicTable,
    EuiBasicTableColumn,
    EuiButton,
    EuiPageHeader,
    EuiSpacer,
} from '@elastic/eui';
import {
    ToastTypes,
    useShowToastMessage,
} from '@orchestrator-ui/orchestrator-ui-components';

import {
    CnaasStateBadge,
    NmsDiscovered,
    NmsError,
    useNmsFetch,
    useNmsQuery,
} from '@/components/Nms';

export const NmsDiscoveredPage = () => {
    const { data, error, isLoading } =
        useNmsQuery<NmsDiscovered[]>('/discovered');
    const nmsFetch = useNmsFetch();
    const { showToastMessage } = useShowToastMessage();
    const [starting, setStarting] = useState<number>();

    const startZtp = (device: NmsDiscovered) => {
        setStarting(device.cnaas_id);
        nmsFetch<{ process_id: string }>(`/discovered/${device.cnaas_id}/ztp`, {
            method: 'POST',
        })
            .then(({ process_id }) =>
                showToastMessage(
                    ToastTypes.SUCCESS,
                    <Link href={`/workflows/${process_id}`}>
                        View ztp_switch process
                    </Link>,
                    `ZTP started for ${device.hostname}`,
                ),
            )
            .catch((e: Error) =>
                showToastMessage(ToastTypes.ERROR, e.message, 'ZTP failed'),
            )
            .finally(() => setStarting(undefined));
    };

    const columns: EuiBasicTableColumn<NmsDiscovered>[] = [
        { field: 'hostname', name: 'Hostname' },
        { field: 'ztp_mac', name: 'ZTP MAC' },
        { field: 'dhcp_ip', name: 'DHCP IP' },
        { field: 'serial', name: 'Serial' },
        { field: 'model', name: 'Model' },
        { field: 'platform', name: 'Platform' },
        {
            field: 'state',
            name: 'State',
            render: (state: string) => <CnaasStateBadge state={state} />,
        },
        {
            field: 'matched_subscription_id',
            name: 'Subscription',
            render: (id: string | null) =>
                id ? (
                    <Link href={`/subscriptions/${id}`}>{id.slice(0, 8)}</Link>
                ) : (
                    'no match'
                ),
        },
        {
            name: 'Actions',
            render: (device: NmsDiscovered) => (
                <EuiButton
                    size="s"
                    isDisabled={!device.matched_subscription_id}
                    isLoading={starting === device.cnaas_id}
                    onClick={() => startZtp(device)}
                >
                    Start ZTP
                </EuiButton>
            ),
        },
    ];

    return (
        <>
            <EuiPageHeader pageTitle="Discovered devices" />
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

export default NmsDiscoveredPage;
