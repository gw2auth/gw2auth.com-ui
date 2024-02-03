import {
  Alert, Button, ColumnLayout, ExpandableSection, SpaceBetween,
} from '@cloudscape-design/components';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo } from 'react';
import { Issuer } from '../../lib/api/api.model';
import { Gw2AuthLogo } from '../common/gw2auth-logo';
import { useI18n } from '../util/context/i18n';
import { usePreviousIssuer } from '../util/state/use-previous-issuer';

export default function Login() {
  const i18n = useI18n();
  const [previousIssuer] = usePreviousIssuer();
  const [alert, loginSelection] = useMemo(() => {
    const buttonByIssuer = {
      [Issuer.GITHUB]: (<Button iconSvg={<FontAwesomeIcon icon={faGithub} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/github'}>{i18n.components.login.loginWith(Issuer.GITHUB)}</Button>),
      [Issuer.GOOGLE]: (<Button iconSvg={<FontAwesomeIcon icon={faGoogle} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/google'}>{i18n.components.login.loginWith(Issuer.GOOGLE)}</Button>),
      [Issuer.COGNITO]: (<Button iconSvg={<Gw2AuthLogo />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/cognito'}>{i18n.components.login.loginWith(Issuer.COGNITO)}</Button>),
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
