import {
 Alert, Button, ColumnLayout, ExpandableSection, SpaceBetween 
} from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { Issuer } from '../../lib/api/api.model';
import { IssuerIcon } from '../common/issuer-icon';
import { useI18n } from '../util/context/i18n';
import { usePreviousIssuer } from '../util/state/use-previous-issuer';

export default function Login() {
  const i18n = useI18n();
  const [previousIssuer] = usePreviousIssuer();
  const [alert, loginSelection] = useMemo(() => {
    const buttonByIssuer = {
      [Issuer.GITHUB]: (<Button iconSvg={<IssuerIcon issuer={Issuer.GITHUB} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/github'}>{i18n.components.login.loginWith(Issuer.GITHUB)}</Button>),
      [Issuer.GOOGLE]: (<Button iconSvg={<IssuerIcon issuer={Issuer.GOOGLE} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/google'}>{i18n.components.login.loginWith(Issuer.GOOGLE)}</Button>),
      [Issuer.COGNITO]: (<Button iconSvg={<IssuerIcon issuer={Issuer.COGNITO} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/cognito'}>{i18n.components.login.loginWith(Issuer.COGNITO)}</Button>),
      [Issuer.DISCORD]: (<Button iconSvg={<IssuerIcon issuer={Issuer.DISCORD} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/discord'}>{i18n.components.login.loginWith(Issuer.DISCORD)}</Button>),
    };

    if (previousIssuer === null) {
      return [
        (
          <Alert type={'warning'}>
            <SpaceBetween size={'xs'} direction={'vertical'}>
              {i18n.components.login.noPreviousWarning}
            </SpaceBetween>
          </Alert>
        ),
        (
          <ColumnLayout columns={1}>
            {buttonByIssuer[Issuer.GITHUB]}
            {buttonByIssuer[Issuer.GOOGLE]}
            {buttonByIssuer[Issuer.COGNITO]}
            {buttonByIssuer[Issuer.DISCORD]}
          </ColumnLayout>
        ),
      ];
    }

    return [
      (
        <Alert type={'warning'}>
          <SpaceBetween size={'xs'} direction={'vertical'}>
            {i18n.components.login.previousWarning(previousIssuer)}
          </SpaceBetween>
        </Alert>
      ),
      (
        <ColumnLayout columns={1}>
          {buttonByIssuer[previousIssuer]}
          <ExpandableSection headerText={i18n.components.login.moreOptions}>
            <ColumnLayout columns={1}>
              {previousIssuer !== Issuer.GITHUB && buttonByIssuer[Issuer.GITHUB]}
              {previousIssuer !== Issuer.GOOGLE && buttonByIssuer[Issuer.GOOGLE]}
              {previousIssuer !== Issuer.COGNITO && buttonByIssuer[Issuer.COGNITO]}
              {previousIssuer !== Issuer.DISCORD && buttonByIssuer[Issuer.DISCORD]}
            </ColumnLayout>
          </ExpandableSection>
        </ColumnLayout>
      ),
    ];
  }, [i18n, previousIssuer]);

  return (
    <ColumnLayout columns={1}>
      {alert}
      {loginSelection}
    </ColumnLayout>
  );
}
