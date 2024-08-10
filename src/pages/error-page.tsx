import { CodeView } from '@cloudscape-design/code-view';
import jsonHighlight from '@cloudscape-design/code-view/highlight/json';
import {
  Box, Container, ContainerProps, ContentLayout, ExpandableSection, Header, SpaceBetween,
} from '@cloudscape-design/components';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouteError, useSearchParams } from 'react-router-dom';
import { RootLayout } from '../components/root';
import { useMobile } from '../components/util/state/common';

interface Error {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
}

export function ErrorPage({ backendError }: { backendError?: boolean }) {
  return (
    <RootLayout headerHide={false} breadcrumbsHide={false}>
      <ErrorLayout backendError={backendError} />
    </RootLayout>
  );
}

export function ErrorLayout({ backendError }: { backendError?: boolean }) {
  const [error, setError] = useState<Error>({});

  if (backendError) {
    const [searchParams] = useSearchParams();
    useEffect(() => {
      const status = searchParams.get('status');
      const err = searchParams.get('error');
      const message = searchParams.get('message');
      const path = searchParams.get('path');

      const e: Error = {};
      if (status) {
        e.status = Number.parseInt(status, 10);
      }

      if (err) {
        e.error = err;
      }

      if (message) {
        e.message = message;
      }

      if (path) {
        e.path = path;
      }

      setError(e);
    }, [searchParams]);
  } else {
    const routeError = useRouteError() as { status?: number; statusText?: string; message?: string; };
    useEffect(() => setError({
      status: routeError.status,
      error: routeError.statusText,
      message: routeError.message,
    }), [routeError]);
  }

  let quaggan: string;
  if (error.status === 404) {
    quaggan = '404';
  } else {
    const quaggans = ['aloha', 'attack', 'bear', 'bowl', 'box', 'breakfast', 'bubble', 'cake', 'cheer', 'coffee', 'construction', 'cow', 'cry', 'elf', 'ghost', 'girl', 'hat', 'helmut', 'hoodie-down', 'hoodie-up', 'killerwhale', 'knight', 'lollipop', 'lost', 'moving', 'party', 'present', 'quaggan', 'rain', 'scifi', 'seahawks', 'sleep', 'summer', 'vacation'];
    quaggan = quaggans[Math.floor(Math.random() * quaggans.length)];
  }

  const isMobile = useMobile();
  const media = useMemo<ContainerProps.Media>(() => {
    if (isMobile) {
      return {
        position: 'top',
        height: '200px',
        content: <img style={{ height: '200px', width: 'auto' }} src={`https://static.staticwars.com/quaggans/${quaggan}.jpg`} alt={'Quaggan'} referrerPolicy={'no-referrer'} crossOrigin={'anonymous'} />,
      };
    }

    return {
      position: 'side',
      width: '300px',
      content: <img style={{ height: 'auto', width: '300px' }} src={`https://static.staticwars.com/quaggans/${quaggan}.jpg`} alt={'Quaggan'} referrerPolicy={'no-referrer'} crossOrigin={'anonymous'} />,
    };
  }, [quaggan, isMobile]);

  return (
    <ContentLayout header={<Header variant={'h1'}>Oops!</Header>}>
      <Container media={media}>
        <SpaceBetween direction={'vertical'} size={'s'}>
          <Box variant={'h2'}>{error.error ?? 'Sorry, an unexpected error has occurred.'}</Box>
          {error.message ? <Box variant={'span'}>{error.message}</Box> : undefined}
          <ExpandableSection headerText={'Details'} variant={'footer'}>
            <CodeView content={JSON.stringify(error, null, 2)} highlight={jsonHighlight} />
          </ExpandableSection>
        </SpaceBetween>
      </Container>
    </ContentLayout>
  );
}
