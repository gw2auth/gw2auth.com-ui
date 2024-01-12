import {
  Alert, Box, Button, ColumnLayout, ExpandableSection, SpaceBetween,
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
      [Issuer.GITHUB]: (<Button iconSvg={<FontAwesomeIcon icon={faGithub} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/github'}>Login with GitHub</Button>),
      [Issuer.GOOGLE]: (<Button iconSvg={<FontAwesomeIcon icon={faGoogle} />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/google'}>Login with Google</Button>),
      [Issuer.COGNITO]: (<Button iconSvg={<Gw2AuthLogo />} variant={'primary'} fullWidth={true} href={'/auth/oauth2/authorization/cognito'}>Login with E-Mail & Password</Button>),
    };

    if (previousIssuer === null) {
      return [
        (
          <Alert type={'warning'}>
            <SpaceBetween size={'xs'} direction={'vertical'}>
              <Box>If you logged in to GW2Auth before, <Box variant={'strong'}>please use the same login provider you have used before</Box>.</Box>
              <Box>If you never logged in to GW2Auth before, choose the login provider you would like to use the most.</Box>
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
            <Box>You have logged in to GW2Auth using <Box variant={'strong'}>{i18n.issuerName(previousIssuer)}</Box> before.</Box>
            <Box>Logging in using a login provider which is not yet linked to your GW2Auth account will create a new GW2Auth account.</Box>
            <Box>If you want to add an additional login provider to your GW2Auth account, please login using a known login provider first and navigate to your account settings to add the one you wish to use.</Box>
          </SpaceBetween>
        </Alert>
      ),
      (
        <ColumnLayout columns={1}>
          {buttonByIssuer[previousIssuer]}
          <ExpandableSection headerText={'More options'}>
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
