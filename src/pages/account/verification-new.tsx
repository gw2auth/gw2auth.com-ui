import React from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { VerificationWizard } from '../../components/verification/verification-wizard';

export function Gw2AccountVerificationNew() {
  const navigate = useNavigate();
  const parentHref = useHref('/verification');

  return (
    <VerificationWizard onDismiss={() => navigate(parentHref)} />
  );
}
