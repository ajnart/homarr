import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';

import { AvailableElementTypes } from './Components/Overview/AvailableElementsOverview';
import { AvailableIntegrationElements } from './Components/WidgetsTab/AvailableWidgetsTab';

export const SelectElementModal = ({ context, id }: ContextModalProps) => {
  const [activeTab, setActiveTab] = useState<undefined | 'integrations' | 'dockerImport'>();

  switch (activeTab) {
    case undefined:
      return (
        <AvailableElementTypes
          modalId={id}
          onOpenIntegrations={() => setActiveTab('integrations')}
        />
      );
    case 'integrations':
      return <AvailableIntegrationElements onClickBack={() => setActiveTab(undefined)} />;
    default:
      /* default to the main selection tab */
      setActiveTab(undefined);
      return <></>;
  }
};
