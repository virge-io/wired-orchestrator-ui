import React, { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
    EuiBasicTable,
    EuiBasicTableColumn,
    EuiButton,
    EuiDescriptionList,
    EuiFlexGrid,
    EuiFlexItem,
    EuiHealth,
    EuiPageHeader,
    EuiPanel,
    EuiSpacer,
    EuiText,
    EuiTitle,
} from '@elastic/eui';

import {
    CnaasStateBadge,
    NmsCorelink,
    NmsError,
    NmsInterface,
    NmsLiveData,
    NmsSwitchDetail,
    useNmsFetch,
    useNmsQuery,
} from '@/components/Nms';

const toListItems = (record: Record<string, unknown>) =>
    Object.entries(record).map(([key, value]) => ({
        title: key,
        description:
            value !== null && typeof value === 'object'
                ? JSON.stringify(value)
                : String(value ?? '-'),
    }));

const InfoPanel = ({
    title,
    record,
}: {
    title: string;
    record: Record<string, unknown> | null;
}) => (
    <EuiFlexItem>
        <EuiPanel>
            <EuiTitle size="s">
                <h3>{title}</h3>
            </EuiTitle>
            <EuiSpacer size="s" />
            {record ? (
                <EuiDescriptionList
                    compressed
                    type="column"
                    listItems={toListItems(record)}
                />
            ) : (
                <EuiText size="s">Not present</EuiText>
            )}
        </EuiPanel>
    </EuiFlexItem>
);

const corelinkColumns: EuiBasicTableColumn<NmsCorelink>[] = [
    {
        field: 'description',
        name: 'Corelink',
        render: (description: string, link: NmsCorelink) => (
            <Link href={`/subscriptions/${link.subscription_id}`}>
                {description}
            </Link>
        ),
    },
    { field: 'a_side', name: 'A side' },
    { field: 'b_side', name: 'B side' },
    { field: 'members', name: 'Members' },
];

const interfaceColumns: EuiBasicTableColumn<NmsInterface>[] = [
    { field: 'name', name: 'Interface' },
    {
        field: 'up',
        name: 'Oper',
        render: (up: boolean) => (
            <EuiHealth color={up ? 'success' : 'danger'}>
                {up ? 'up' : 'down'}
            </EuiHealth>
        ),
    },
    {
        field: 'enabled',
        name: 'Admin',
        render: (enabled: boolean) => (enabled ? 'enabled' : 'disabled'),
    },
    { field: 'speed', name: 'Speed' },
    { field: 'description', name: 'Description' },
];

export const NmsSwitchDetailPage = () => {
    const router = useRouter();
    const hostname = router.query.hostname as string | undefined;
    const path = `/switches/${encodeURIComponent(hostname ?? '')}`;
    const { data, error, isLoading } = useNmsQuery<NmsSwitchDetail>(path);
    const nmsFetch = useNmsFetch();
    const [live, setLive] = useState<NmsLiveData>();
    const [liveLoading, setLiveLoading] = useState(false);
    const [liveError, setLiveError] = useState<string>();

    const refreshLive = () => {
        setLiveLoading(true);
        setLiveError(undefined);
        nmsFetch<NmsLiveData>(`${path}/live`, { method: 'POST' })
            .then(setLive)
            .catch((e: Error) => setLiveError(e.message))
            .finally(() => setLiveLoading(false));
    };

    if (!hostname) return null;

    return (
        <>
            <EuiPageHeader
                pageTitle={hostname}
                rightSideItems={[
                    <CnaasStateBadge
                        key="state"
                        state={data?.cnaas?.state as string | undefined}
                    />,
                ]}
            />
            <EuiSpacer />
            <NmsError error={error} />
            {isLoading && <EuiText>Loading...</EuiText>}
            {data && (
                <>
                    <EuiFlexGrid columns={3}>
                        <InfoPanel title="WFO" record={data.wfo} />
                        <InfoPanel title="NetBox" record={data.netbox} />
                        <InfoPanel title="CNaaS" record={data.cnaas} />
                    </EuiFlexGrid>
                    <EuiSpacer />
                    <EuiTitle size="s">
                        <h3>Corelinks</h3>
                    </EuiTitle>
                    <EuiBasicTable
                        items={data.corelinks}
                        columns={corelinkColumns}
                        noItemsMessage="No corelinks"
                    />
                </>
            )}
            <EuiSpacer />
            <EuiButton
                iconType="refresh"
                isLoading={liveLoading}
                onClick={refreshLive}
            >
                Refresh live data
            </EuiButton>
            {live && (
                <EuiText size="s" color="subdued">
                    Fetched at {new Date(live.fetched_at).toLocaleString()}
                </EuiText>
            )}
            <NmsError error={liveError} />
            {live && (
                <>
                    <EuiSpacer />
                    <EuiBasicTable
                        items={live.interfaces}
                        columns={interfaceColumns}
                        tableLayout="auto"
                    />
                </>
            )}
        </>
    );
};

export default NmsSwitchDetailPage;
