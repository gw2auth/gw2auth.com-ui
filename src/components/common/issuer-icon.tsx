import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Issuer } from '../../lib/api/api.model';
import { Gw2AuthLogo } from './gw2auth-logo';

export function IssuerIcon({ issuer }: { issuer: Issuer }) {
  return {
    [Issuer.GITHUB]: (<FontAwesomeIcon icon={faGithub} />),
    [Issuer.GOOGLE]: (<FontAwesomeIcon icon={faGoogle} />),
    [Issuer.COGNITO]: (<Gw2AuthLogo />),
  }[issuer];
}
