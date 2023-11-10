import { Container, Grid, Text } from '@mantine/core';
import { IconCursorText } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { GenericAvailableElementType } from '../Shared/GenericElementType';
import { SelectorBackArrow } from '../Shared/SelectorBackArrow';

interface AvailableStaticTypesProps {
  onClickBack: () => void;
}

export const AvailableStaticTypes = ({ onClickBack }: AvailableStaticTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  return (
    <>
      <SelectorBackArrow onClickBack={onClickBack} />

      <Text mb="md" color="dimmed">
        Static elements provide you additional control over your dashboard. They are static, because
        they don&apos;t integrate with any apps and their content never changes.
      </Text>

      <Grid grow>
        {/*
        <GenericAvailableElementType
          name="Static Text"
          description="Display a fixed string on your dashboard"
          image={IconCursorText}
          handleAddition={async () => {}}
        /> */}
      </Grid>
    </>
  );
};
