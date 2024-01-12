import { Box, Button, StatusIndicator } from '@cloudscape-design/components';
import React, { useState } from 'react';
import { Copy } from './copy';

export function Hidden({ children }: React.PropsWithChildren) {
  const [hide, setHide] = useState(true);
  if (hide) {
    return (
      <Button variant={'inline-link'} onClick={() => setHide(false)}>Show</Button>
    );
  }

  return (
    <Box fontSize={'body-s'} variant={'samp'}>{children}</Box>
  );
}

export function Gw2ApiToken({ value }: { value?: string }) {
  if (value === undefined) {
    return <StatusIndicator type={'warning'}>None</StatusIndicator>;
  }

  return (
    <Copy copyText={value}>
      <Hidden>{value}</Hidden>
    </Copy>
  );
}
