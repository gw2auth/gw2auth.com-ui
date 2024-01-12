import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  CollectionPreferences,
  CollectionPreferencesProps, Table,
  TableProps,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';

interface BaseCustomTableColumnDefinition<T> extends TableProps.ColumnDefinition<T> {
  id: string;
  header: React.ReactNode | string;
  label?: string;
  alwaysVisible?: boolean;
  preferencesDisable?: boolean;
}

interface StringHeaderColumnDefinition<T> extends BaseCustomTableColumnDefinition<T> {
  header: string;
}

interface NodeHeaderColumnDefinition<T> extends BaseCustomTableColumnDefinition<T> {
  header: React.ReactNode;
  label: string;
}

export type CustomTableColumnDefinition<T> = StringHeaderColumnDefinition<T> | NodeHeaderColumnDefinition<T>;

export interface CustomTableProps<T> extends TableProps<T> {
  visibleColumns?: ReadonlyArray<string>;
  columnDefinitions: ReadonlyArray<CustomTableColumnDefinition<T>>
}

export function CustomTable<T>(props: CustomTableProps<T>) {
  const {
    items: rawItems, columnDefinitions, visibleColumns, ...tableProps 
  } = props;
  const { items, collectionProps } = useCollection(rawItems, { sorting: {} });
  const [preferences, setPreferences] = useState<CollectionPreferencesProps.Preferences>({
    contentDisplay: columnDefinitions
      .filter((v) => !(v.preferencesDisable ?? false))
      .map((v) => ({ id: v.id, visible: visibleColumns?.includes(v.id) ?? true })),
  });

  useEffect(() => {
    setPreferences((prev) => ({
      ...prev,
      contentDisplay: columnDefinitions
        .filter((v) => !(v.preferencesDisable ?? false))
        .map((v) => ({ id: v.id, visible: visibleColumns?.includes(v.id) ?? true })),
    }));
  }, [columnDefinitions, visibleColumns]);

  const activeColumnDefinitions = useMemo(() => {
    if (preferences.contentDisplay === undefined) {
      return columnDefinitions;
    }

    const result: Array<TableProps.ColumnDefinition<T>> = [];
    const added = new Array<boolean>(columnDefinitions.length);

    for (const d of preferences.contentDisplay) {
      if (d.visible) {
        const index = columnDefinitions.findIndex((v) => v.id === d.id);
        if (index !== -1) {
          result.push(columnDefinitions[index]);
          added[index] = true;
        }
      }
    }

    for (let i = 0; i < columnDefinitions.length; i++) {
      const col = columnDefinitions[i];
      if (!added[i] && ((col.alwaysVisible ?? false) || (col.preferencesDisable ?? false))) {
        result.push(col);
      }
    }

    return result;
  }, [columnDefinitions, preferences]);

  return (
    <Table
      {...collectionProps}
      {...tableProps}
      items={items}
      resizableColumns={true}
      columnDefinitions={activeColumnDefinitions}
      preferences={
        <CollectionPreferences
          contentDisplayPreference={{
            options: columnDefinitions
              .filter((v) => !(v.preferencesDisable ?? false))
              .map<CollectionPreferencesProps.ContentDisplayOption>((v) => ({ id: v.id, label: columnLabel(v), alwaysVisible: v.alwaysVisible ?? false })),
          }}
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
        />
      }
    />
  );
}

function columnLabel(column: CustomTableColumnDefinition<never>) {
  if (column.label !== undefined) {
    return column.label;
  }

  return column.header?.toString() ?? 'unknown';
}
