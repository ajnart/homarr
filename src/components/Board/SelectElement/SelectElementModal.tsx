import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';

import { AvailableElementTypes } from './Overview/AvailableElementsOverview';
import { AvailableIntegrationElements } from './WidgetsTab/AvailableWidgetsTab';

type InnerProps = {};

export const SelectElementModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const [activeTab, setActiveTab] = useState<undefined | 'integrations'>();

  if (activeTab === 'integrations') {
    return (
      <AvailableIntegrationElements modalId={id} onClickBack={() => setActiveTab(undefined)} />
    );
  }

  return (
    <AvailableElementTypes modalId={id} onOpenIntegrations={() => setActiveTab('integrations')} />
  );
};
