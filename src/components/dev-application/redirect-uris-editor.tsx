import {
  AttributeEditor, AttributeEditorProps, Box, Input, 
} from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { Copy } from '../common/copy';

type OmitProps = 'addButtonText' | 'onAddButtonClick' | 'onRemoveButtonClick' | 'items' | 'definition' | 'disableAddButton' | 'isItemRemovable' | 'additionalInfo';
export interface RedirectUrisEditorProps extends Omit<AttributeEditorProps<string>, OmitProps> {
  applicationId: string;
  clientId?: string;
  disabled: boolean;
  items: ReadonlyArray<string>;
  setItems: React.Dispatch<React.SetStateAction<ReadonlyArray<string>>>
}

export function RedirectURIsEditor({
  applicationId, clientId, disabled, items, setItems, ...attributeEditorProps 
}: RedirectUrisEditorProps) {
  return (
    <AttributeEditor
      addButtonText={'Add'}
      onAddButtonClick={() => setItems((prev) => [...prev, ''])}
      onRemoveButtonClick={(e) => setItems((prev) => prev.toSpliced(e.detail.itemIndex, 1))}
      items={items}
      definition={[
        {
          label: 'URI',
          control: (item, index) => (
            <Input value={item} type={'url'} disabled={disabled} onChange={(e) => setItems((prev) => {
              const updated = [...prev];
              updated[index] = e.detail.value;
              return updated;
            })} />
          ),
        },
      ]}
      disableAddButton={disabled}
      isItemRemovable={() => !disabled}
      additionalInfo={<AdditionalInfo applicationId={applicationId} clientId={clientId} />}
      {...attributeEditorProps}
    />
  );
}

function AdditionalInfo({ applicationId, clientId }: { applicationId: string; clientId?: string }) {
  const testCallbackHref = useTestCallbackHref(applicationId, clientId !== undefined ? encodeURIComponent(clientId) : '$client_id');
  return (
    <Box padding={{ top: 'm' }}>
      You may add the following URI to be able to test this client on this site:
      <Copy copyText={testCallbackHref}><Box variant={'samp'} fontSize={'body-s'}>{testCallbackHref}</Box></Copy>
    </Box>
  );
}

function useTestCallbackHref(applicationId: string, clientIdEncoded: string) {
  return useMemo(() => `${window.location.protocol}//${window.location.host}/dev/applications/${encodeURIComponent(applicationId)}/clients/${clientIdEncoded}/test/callback`, [applicationId, clientIdEncoded]);
}
