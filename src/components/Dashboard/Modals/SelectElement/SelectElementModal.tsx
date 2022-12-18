import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';
import { AvailableIntegrationElements } from './Components/WidgetsTab/AvailableWidgetsTab';
import { AvailableElementTypes } from './Components/Overview/AvailableElementsOverview';
import { AvailableStaticTypes } from './Components/StaticElementsTab/AvailableStaticElementsTab';

export const SelectElementModal = ({ context, id }: ContextModalProps) => {
  const [activeTab, setActiveTab] = useState<undefined | 'integrations' | 'static_elements'>();

  switch (activeTab) {
    case undefined:
      return (
        <AvailableElementTypes
          onOpenIntegrations={() => setActiveTab('integrations')}
          onOpenStaticElements={() => setActiveTab('static_elements')}
        />
      );
    case 'integrations':
      return <AvailableIntegrationElements onClickBack={() => setActiveTab(undefined)} />;
    case 'static_elements':
      return <AvailableStaticTypes onClickBack={() => setActiveTab(undefined)} />;
    default:
      /* default to the main selection tab */
      setActiveTab(undefined);
      return <></>;
  }
};
