import {
  Box, Button, Checkbox, ColumnLayout, Modal, SpaceBetween,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../util/context/i18n';

export interface DeleteModalDismissDetail<T> {
  item: T;
  reason: string | 'cancel' | 'delete';
}

export interface DeleteModalProps<T> {
  item?: T;
  entityType: string;
  loading: boolean;
  onDismiss: (e: CustomEvent<DeleteModalDismissDetail<T>>) => void;
}

export function DeleteModal<T>({
  item, entityType, loading, onDismiss, children,
}: React.PropsWithChildren<DeleteModalProps<T>>) {
  const i18n = useI18n();

  return (
    <ConfirmationModal
      item={item}
      header={i18n.components.confirmationModal.confirmDeletionHeader(entityType)}
      confirmLong={i18n.components.confirmationModal.confirmDeletionLong(entityType)}
      confirmShort={i18n.components.confirmationModal.confirmDeletionShort(entityType)}
      loading={loading}
      onDismiss={(e) => {
        if (e.detail.reason !== 'confirm') {
          onDismiss(e);
          return;
        }

        onDismiss(new CustomEvent(e.type, { detail: { item: e.detail.item, reason: 'delete' } }));
      }}
    >{children}</ConfirmationModal>
  );
}

export interface ConfirmationModalDismissDetail<T> {
  item: T;
  reason: string | 'cancel' | 'confirm';
}

export interface ConfirmationModalProps<T> {
  item?: T;
  header: React.ReactNode;
  confirmLong: string;
  confirmShort: string;
  loading: boolean;
  onDismiss: (e: CustomEvent<ConfirmationModalDismissDetail<T>>) => void;
}

export function ConfirmationModal<T>({
  item, header, confirmLong, confirmShort, loading, onDismiss, children,
}: React.PropsWithChildren<ConfirmationModalProps<T>>) {
  const i18n = useI18n();
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  useEffect(() => {
    if (item === undefined) {
      setDeleteDisabled(true);
    }
  }, [item]);

  function onCancelClick(e: CustomEvent) {
    if (item !== undefined && onDismiss !== undefined) {
      onDismiss(new CustomEvent(e.type, { detail: { item: item, reason: 'cancel' } }));
    }
  }

  function onConfirmClick(e: CustomEvent) {
    if (item !== undefined && onDismiss !== undefined) {
      onDismiss(new CustomEvent(e.type, { detail: { item: item!, reason: 'confirm' } }));
    }
  }

  return (
    <Modal
      visible={item !== undefined}
      onDismiss={(e) => {
        if (item === undefined || onDismiss === undefined || loading) {
          return;
        }

        onDismiss(new CustomEvent(e.type, { detail: { item: item, reason: e.detail.reason } }));
      }}
      header={header}
      footer={
        <Box float={'right'}>
          <SpaceBetween direction={'horizontal'} size={'xs'}>
            <Button disabled={loading} variant={'link'} onClick={onCancelClick}>{i18n.general.cancel}</Button>
            <Button disabled={deleteDisabled} loading={loading} variant={'primary'} onClick={onConfirmClick}>{confirmShort}</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <ColumnLayout columns={1}>
        {children}
        <div>
          <Box variant={'h5'}>{confirmLong}</Box>
          <Checkbox checked={!deleteDisabled} onChange={(e) => setDeleteDisabled(!e.detail.checked)}>Confirm</Checkbox>
        </div>
      </ColumnLayout>
    </Modal>
  );
}
