import { useState } from 'react';
import { ContextModalProps } from '@mantine/modals';

import { AvailableElementTypes } from './Components/Overview/AvailableElementsOverview';
import { AvailableStaticTypes } from './Components/StaticElementsTab/AvailableStaticElementsTab';
import { AvailableIntegrationElements } from './Components/WidgetsTab/AvailableWidgetsTab';

export const SelectElementModal = ({ context, id }: ContextModalProps) => {
  const [activeTab, setActiveTab] = useState<undefined | 'integrations' | 'static_elements'>();

  switch (activeTab) {
    case undefined:
      return (
        <AvailableElementTypes
          modalId={id}
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
