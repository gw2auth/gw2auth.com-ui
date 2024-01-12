import React from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { AddApiTokenWizard } from '../../components/add-api-token/add-api-token';

export function Gw2AccountsAdd() {
  const navigate = useNavigate();
  const accountsHref = useHref('/accounts');

  function onDismiss() {
    navigate(accountsHref);
  }

  return (
    <AddApiTokenWizard onDismiss={onDismiss} />
  );
}
