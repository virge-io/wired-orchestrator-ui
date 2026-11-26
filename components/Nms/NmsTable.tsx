import React, { ReactNode } from 'react';

import {
    EuiLoadingSpinner,
    EuiTable,
    EuiTableBody,
    EuiTableHeader,
    EuiTableHeaderCell,
    EuiTableRow,
    EuiTableRowCell,
} from '@elastic/eui';

// Turbopack (Next 16, pages router) fails at runtime with "module factory is not available" for EUI
// modules that the shared WFO bundle doesn't already ship (basic_table, description_list). These
// lightweight equivalents only use EUI table primitives, which the shared bundle does include.

/** Subset of EuiBasicTableColumn: a field column (render gets value + item) or a computed column (render gets item). */
export type NmsTableColumn<T> =
    | {
          field: keyof T & string;
          name: ReactNode;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          render?: (value: any, item: T) => ReactNode;
      }
    | { field?: undefined; name: ReactNode; render: (item: T) => ReactNode };

type NmsTableProps<T> = {
    items: T[];
    columns: NmsTableColumn<T>[];
    loading?: boolean;
    noItemsMessage?: ReactNode;
    tableLayout?: 'auto' | 'fixed';
};

const renderCell = <T,>(column: NmsTableColumn<T>, item: T): ReactNode => {
    if (!column.field) {
        return (column.render as (item: T) => ReactNode)(item);
    }
    const value = item[column.field];
    if (column.render) {
        return (column.render as (value: unknown, item: T) => ReactNode)(
            value,
            item,
        );
    }
    return value === null || value === undefined ? '' : String(value);
};

export const NmsTable = <T,>({
    items,
    columns,
    loading = false,
    noItemsMessage = 'No items found',
    tableLayout = 'auto',
}: NmsTableProps<T>) => (
    <EuiTable tableLayout={tableLayout}>
        <EuiTableHeader>
            {columns.map((column, i) => (
                <EuiTableHeaderCell key={i}>{column.name}</EuiTableHeaderCell>
            ))}
        </EuiTableHeader>
        <EuiTableBody>
            {items.length === 0 ? (
                <EuiTableRow>
                    <EuiTableRowCell colSpan={columns.length} align="center">
                        {loading ? <EuiLoadingSpinner /> : noItemsMessage}
                    </EuiTableRowCell>
                </EuiTableRow>
            ) : (
                items.map((item, row) => (
                    <EuiTableRow key={row}>
                        {columns.map((column, i) => (
                            <EuiTableRowCell key={i}>
                                {renderCell(column, item)}
                            </EuiTableRowCell>
                        ))}
                    </EuiTableRow>
                ))
            )}
        </EuiTableBody>
    </EuiTable>
);

/** Two-column key/value table, replacing EuiDescriptionList type="column". */
export const NmsKeyValueList = ({
    listItems,
}: {
    listItems: { title: ReactNode; description: ReactNode }[];
}) => (
    <EuiTable compressed tableLayout="auto">
        <EuiTableBody>
            {listItems.map((entry, i) => (
                <EuiTableRow key={i}>
                    <EuiTableRowCell>
                        <strong>{entry.title}</strong>
                    </EuiTableRowCell>
                    <EuiTableRowCell>{entry.description}</EuiTableRowCell>
                </EuiTableRow>
            ))}
        </EuiTableBody>
    </EuiTable>
);
