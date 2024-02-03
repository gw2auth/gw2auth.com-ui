import { CodeView } from '@cloudscape-design/code-view';
import {
  Box, Container, ContainerProps, ContentLayout, ExpandableSection, Header, SpaceBetween,
} from '@cloudscape-design/components';
import React, { useMemo } from 'react';
import { useRouteError } from 'react-router-dom';
import { RootLayout } from '../components/root';
import { useMobile } from '../components/util/state/common';

export default function ErrorPage() {
  const error = useRouteError() as { status?: number; statusText?: string; message?: string; };
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
  }, [isMobile]);

  return (
    <RootLayout headerHide={false} breadcrumbsHide={false}>
      <ContentLayout header={<Header variant={'h1'}>Oops!</Header>}>
        <Container media={media}>
          <SpaceBetween direction={'vertical'} size={'s'}>
            <Box variant={'h2'}>Sorry, an unexpected error has occurred.</Box>
            <Box variant={'span'}>{error.statusText ?? error.message}</Box>
            <ExpandableSection headerText={'Details'} variant={'footer'}>
              <CodeView content={JSON.stringify(error, null, 2)} />
            </ExpandableSection>
          </SpaceBetween>
        </Container>
      </ContentLayout>
    </RootLayout>
  );
}
