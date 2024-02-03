import {
  Box, Button, ButtonProps,
  Container, ContentLayout, Grid, Header, HelpPanel, Link, SpaceBetween,
} from '@cloudscape-design/components';
import { LinkProps } from '@cloudscape-design/components/link';
import React, { useEffect, useState } from 'react';
import { Gw2AuthLogo } from '../components/common/gw2auth-logo';
import LoginComp from '../components/login/login';
import { useTools } from '../components/util/context/app-controls';

export function Login() {
  return (
    <ContentLayout>
      <Grid gridDefinition={[{ colspan: { default: 12, xs: 10, s: 8 }, offset: { default: 0, xs: 1, s: 2 } }]}>
        <Container header={<LoginHeader />}>
          <LoginComp />
        </Container>
      </Grid>
    </ContentLayout>
  );
}

function LoginHeader() {
  return (
    <SpaceBetween size={'xs'} direction={'horizontal'}>
      <Gw2AuthLogo inverse={true} />
      <Header
        variant={'h1'}
        description={'Login service for Guild Wars 2'}
        info={<InfoLink />}
      >GW2Auth</Header>
    </SpaceBetween>
  );
}

function InfoLink() {
  const [tools, setTools] = useState<React.ReactNode>();
  const setToolsOpen = useTools(tools);

  useEffect(() => {
    setTools(<WhyAmIHere onCloseClick={() => setToolsOpen(false)} />);
    return () => setTools(undefined);
  }, []);

  function onFollow(e: CustomEvent<LinkProps.FollowDetail>) {
    e.preventDefault();
    setToolsOpen(true);
  }

  return (
    <Link variant={'info'} onFollow={onFollow}>Why am I here?</Link>
  );
}

function WhyAmIHere({ onCloseClick }: { onCloseClick: (e: CustomEvent<ButtonProps.ClickDetail>) => void }) {
  return (
    <HelpPanel header={<Box variant={'h2'}>Why am I here?</Box>} footer={<Button onClick={onCloseClick}>Close</Button>}>
      <SpaceBetween size={'m'} direction={'vertical'}>
        <SpaceBetween size={'xs'} direction={'vertical'}>
          <Box variant={'h3'}>The application you want to login to uses GW2Auth</Box>
          <Box>You were redirected to this page when trying to login to an application using GW2Auth.</Box>
        </SpaceBetween>
        <SpaceBetween size={'xs'} direction={'vertical'}>
          <Box variant={'h3'}>What is GW2Auth?</Box>
          <Box>GW2Auth is a login service for Guild Wars 2.</Box>
          <Box>Once completing the login to GW2Auth, you will be shown a consent screen to confirm the data the application is trying to access.</Box>
          <Box>You own your data. You can revoke the access you have an application through GW2Auth at any time. To do so, navigate to <Link href={'https://gw2auth.com'} external={true}>GW2Auth</Link> directly.</Box>
        </SpaceBetween>
      </SpaceBetween>
    </HelpPanel>
  );
}
