import {
  Box,
  Container, ContentLayout, Header, Link, Spinner,
} from '@cloudscape-design/components';
import React, { useEffect, useState } from 'react';
import { KeyValuePairs, ValueWithLabel } from '../components/common/key-value-pairs';
import { RouterLink } from '../components/common/router-link';
import { Contact } from '../components/contact/contact';
import { catchNotify, useAppControls } from '../components/util/context/app-controls';
import { useAuthInfo } from '../components/util/context/auth-info';
import { useHttpClient } from '../components/util/context/http-client';
import { expectSuccess } from '../lib/api/api';
import { ApplicationSummary } from '../lib/api/api.model';

export default function Home() {
  const { notification } = useAppControls();
  const { apiClient } = useHttpClient();
  const [authInfo] = useAuthInfo();

  const [summary, setSummary] = useState<ApplicationSummary>();

  useEffect(() => {
    (async () => {
      const { body } = expectSuccess(await apiClient.getApplicationSummary());
      setSummary(body);
    })()
      .catch(catchNotify(notification, 'Failed to load application summary'))
      .finally(() => {});
  }, [apiClient]);

  return (
    <ContentLayout header={<Header variant={'h1'}>Welcome to GW2Auth!</Header>}>
      <Container variant={'stacked'} header={<Header variant={'h2'}>As a user ...</Header>}>
        <Box variant={'h5'}>Your portal to manage access shared with applications using the Guild Wars 2 API</Box>
        <Box variant={'p'}>One API Token to rule them all.</Box>
        <Box variant={'p'}>
          We have observed that many users tend to create only a single API Token and pass this to every application out there.
          This is convenient, since you only have to keep this single API Token and don't need to login to the Guild Wars 2 website everytime you want to use a new application.
        </Box>
        <Box variant={'p'}>
          Even though this is convenient, this leads to a mess where you never know which applications keep reading your Guild Wars 2 data.
          An API Token is valid until it is deleted - if only a single API Token is used for every application, you have no way to revoke the access only for a single application.
        </Box>
        <Box variant={'p'}>
          GW2Auth allows you to add only a single API Token for each of your Guild Wars 2 accounts and manages each applications access for you.
          You can revoke the access of a single application at any point in time through GW2Auth.
        </Box>
        <Box margin={{ top: 's' }} variant={'small'}>
          GW2Auth uses <Link href={'https://wiki.guildwars2.com/wiki/API:2/createsubtoken'} external={true} fontSize={'inherit'}>subtokens</Link> to restrict the permissions granted to an application.
        </Box>
      </Container>

      <Container variant={'stacked'} header={<Header variant={'h2'}>As a developer ...</Header>}>
        <Box variant={'h5'}>Multiple accounts? Account verification? Simple login? GW2Auth has your back</Box>
        <Box variant={'p'}>
          Creating an application that consumes API Tokens is easy at first, but as your application evolves, you might want to support more than that.
          GW2Auth supports multiple Guild Wars 2 Accounts for a single user out of the box.
          It also provides you with a unique user ID which can be used to create a unique user account on your side to enrich it with more data like personalized settings etc.
        </Box>
        <Box variant={'p'}>
          You may also request to read the verification status of a users Guild Wars 2 Accounts to ensure a user is the legitimate owner of a Guild Wars 2 Account.
        </Box>
        <Box margin={{ top: 's', bottom: 'm' }} variant={'small'}>
          Check out the <Link href={'https://github.com/gw2auth/oauth2-server/wiki/GW2Auth-Developer-Guide'} external={true} fontSize={'inherit'}>Developer Wiki</Link> to learn more.
        </Box>

        <Box variant={'h5'}>Get started now!</Box>
        {authInfo
          ? (<Box variant={'p'}>Create your first application on the <RouterLink to={'/dev/applications'}>Developer Page</RouterLink> and get started right away.</Box>)
          : (<Box variant={'p'}>Login or create an account and create your first application.</Box>)
        }
      </Container>

      <Container variant={'stacked'} header={<Header variant={'h2'}>Many users trust GW2Auth</Header>}>
        <KeyValuePairs columns={3}>
          <LoadableValueWithLabel label={'Accounts'}>{summary?.accounts}</LoadableValueWithLabel>
          <LoadableValueWithLabel label={'API Tokens'}>{summary?.gw2ApiTokens}</LoadableValueWithLabel>
          <LoadableValueWithLabel label={'Verified GW2 Accounts'}>{summary?.verifiedGw2Accounts}</LoadableValueWithLabel>
          <LoadableValueWithLabel label={'Applications'}>{summary?.applications}</LoadableValueWithLabel>
          <LoadableValueWithLabel label={'Clients'}>{summary?.applicationClients}</LoadableValueWithLabel>
          <LoadableValueWithLabel label={'Authorizations'}>{summary?.applicationClientAccounts}</LoadableValueWithLabel>
        </KeyValuePairs>
      </Container>

      <Container variant={'stacked'} header={<Header variant={'h2'}>Contact us</Header>}>
        <Contact />
      </Container>
    </ContentLayout>
  );
}

function LoadableValueWithLabel({ label, children }: { label: string, children?: number }) {
  return (
    <ValueWithLabel label={label}>
      {children === undefined ? <Spinner /> : `${children}+`}
    </ValueWithLabel>
  );
}
