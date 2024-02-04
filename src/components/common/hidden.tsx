import { Box, Button, StatusIndicator } from '@cloudscape-design/components';
import React, { useState } from 'react';
import { useI18n } from '../util/context/i18n';
import { Copy } from './copy';

export function Hidden({ children }: React.PropsWithChildren) {
  const i18n = useI18n();
  const [hide, setHide] = useState(true);
  if (hide) {
    return (
      <Button variant={'inline-link'} onClick={() => setHide(false)}>{i18n.components.hidden.show}</Button>
    );
  }

  return (
    <Box variant={'samp'}>{children}</Box>
  );
}

export function Gw2ApiToken({ value }: { value?: string }) {
  const i18n = useI18n();

  if (value === undefined) {
    return <StatusIndicator type={'warning'}>{i18n.general.none}</StatusIndicator>;
  }

  return (
    <Copy copyText={value}>
      <Hidden>{value}</Hidden>
    </Copy>
  );
}
