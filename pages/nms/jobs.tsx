import React from 'react';

import {
    EuiBadge,
    EuiBasicTable,
    EuiBasicTableColumn,
    EuiPageHeader,
    EuiSpacer,
} from '@elastic/eui';

import { NmsError, NmsJob, useNmsQuery } from '@/components/Nms';

const STATUS_COLORS: Record<string, string> = {
    FINISHED: 'success',
    RUNNING: 'primary',
    SCHEDULED: 'default',
    EXCEPTION: 'danger',
    ABORTED: 'warning',
};

const formatTime = (time: string | null) =>
    time ? new Date(time).toLocaleString() : '-';

const columns: EuiBasicTableColumn<NmsJob>[] = [
    { field: 'id', name: 'ID' },
    { field: 'function_name', name: 'Function' },
    {
        field: 'status',
        name: 'Status',
        render: (status: string) => (
            <EuiBadge color={STATUS_COLORS[status] ?? 'default'}>
                {status}
            </EuiBadge>
        ),
    },
    { field: 'start_time', name: 'Started', render: formatTime },
    { field: 'finish_time', name: 'Finished', render: formatTime },
    { field: 'comment', name: 'Comment' },
    { field: 'ticket_ref', name: 'Ticket' },
];

export const NmsJobsPage = () => {
    const { data, error, isLoading } = useNmsQuery<NmsJob[]>(
        '/jobs?limit=25',
        10000,
    );

    return (
        <>
            <EuiPageHeader
                pageTitle="CNaaS jobs"
                description="Refreshes every 10s"
            />
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

export default NmsJobsPage;
