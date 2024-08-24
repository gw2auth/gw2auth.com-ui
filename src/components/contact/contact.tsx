import { Link } from '@cloudscape-design/components';
import React from 'react';
import { Copy } from '../common/copy';
import { KeyValuePairs, ValueWithLabel } from '../common/key-value-pairs';
import { useI18n } from '../util/context/i18n';

export function Contact() {
  const i18n = useI18n();

  return (
    <KeyValuePairs columns={3}>
      <ValueWithLabel label={i18n.components.contact.ingame}>
        <Copy copyText={'Felix.9127'}>Felix.9127</Copy>
      </ValueWithLabel>
      <ValueWithLabel label={i18n.components.contact.discord}>
        {i18n.components.contact.discordDetail(({ children }) => <Link href={'https://discord.gg/bgN59yhbec'} external={true}>{children}</Link>)}
      </ValueWithLabel>
      <ValueWithLabel label={i18n.components.contact.email}>
        {i18n.components.contact.emailDetail(() => <Copy copyText={'contact@gw2auth.com'}><Link href={'mailto:contact@gw2auth.com'} external={true}>contact@gw2auth.com</Link></Copy>)}
      </ValueWithLabel>
    </KeyValuePairs>
  );
}
