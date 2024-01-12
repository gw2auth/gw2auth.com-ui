import { Box, Link } from '@cloudscape-design/components';
import React from 'react';
import { Copy } from '../common/copy';
import { KeyValuePairs, ValueWithLabel } from '../common/key-value-pairs';

export function Contact() {
  return (
    <KeyValuePairs columns={3}>
      <ValueWithLabel label={'Ingame'}>
        <Copy copyText={'Felix.9127'}>Felix.9127</Copy>
      </ValueWithLabel>
      <ValueWithLabel label={'Discord'}>
        <Box>Join the <Link href={'https://discord.gg/9BpnA7sh'} external={true}>GW2 Development Community</Link> in channel <Box variant={'strong'}>#gw2auth</Box></Box>
      </ValueWithLabel>
      <ValueWithLabel label={'E-Mail'}>
        <Box>Send us an E-Mail at <Copy copyText={'contact@gw2auth.com'}><Link href={'mailto:contact@gw2auth.com'} external={true}>contact@gw2auth.com</Link></Copy></Box>
      </ValueWithLabel>
    </KeyValuePairs>
  );
}
