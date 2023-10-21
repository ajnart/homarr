import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';
import { RouterOutputs } from '~/utils/api';

import { AvailableElementTypes } from './Overview/AvailableElementsOverview';
import { AvailableIntegrationElements } from './WidgetsTab/AvailableWidgetsTab';

type InnerProps = {
  board: RouterOutputs['boards']['byName'];
};

export const SelectElementModal = ({ id, innerProps }: ContextModalProps<InnerProps>) => {
  const [activeTab, setActiveTab] = useState<undefined | 'integrations'>();

  if (activeTab === 'integrations') {
    return (
      <AvailableIntegrationElements
        modalId={id}
        boardName={innerProps.board.name}
        onClickBack={() => setActiveTab(undefined)}
      />
    );
  }

  return (
    <AvailableElementTypes
      modalId={id}
      board={innerProps.board}
      onOpenIntegrations={() => setActiveTab('integrations')}
    />
  );
};
