import { Button, Group, Popover, Stack, Tabs, Text, ThemeIcon } from '@mantine/core';
import { UseFormReturnType, useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import {
  IconAccessPoint,
  IconAdjustments,
  IconAlertTriangle,
  IconBrush,
  IconClick,
  IconPlug,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { z } from 'zod';
import { appNamePositions, appNameStyles } from '~/server/db/items';
import { objectKeys } from '~/tools/object';
import { RouterOutputs } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';

import { DebouncedImage } from '../../../IconSelector/DebouncedImage';
import { AppItem } from '../../context';
import { AppearanceTab } from './Edit/AppereanceTab';
import { BehaviourTab } from './Edit/BehaviourTab';
import { GeneralTab } from './Edit/GeneralTab';
import { IntegrationTab } from './Edit/IntegrationTab/IntegrationTab';
import { NetworkTab } from './Edit/NetworkTab';
import { useAppActions } from './app-actions';

const appUrlRegex =
  '(https?://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|https?://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

const appUrlWithAnyProtocolRegex =
  '([A-z]+://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|[A-z]+://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

export type EditAppModalInnerProps = {
  app: AppItem;
  board: RouterOutputs['boards']['byName'];
  allowAppNamePropagation: boolean;
};

export const EditAppModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<EditAppModalInnerProps>) => {
  const { t } = useTranslation(['layout/modals/add-app', 'common']);
  const [activeTab, setActiveTab] = useState<EditAppModalTab>('general');
  const { createOrUpdateApp } = useAppActions({ boardName: innerProps.board.name });
  // TODO: change to ref
  const [allowAppNamePropagation, setAllowAppNamePropagation] = useState<boolean>(
    innerProps.allowAppNamePropagation
  );

  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm<FormType>({
    initialValues: innerProps.app,
    validate: i18nZodResolver(appFormSchema),
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const onSubmit = (values: FormType) => {
    createOrUpdateApp({ app: values });
    // also close the parent modal
    context.closeAll();
  };

  const closeModal = () => {
    context.closeModal(id);
  };

  const validationErrors = objectKeys(form.errors) as (keyof AppItem)[];

  const ValidationErrorIndicator = ({ keys }: { keys: (keyof AppItem)[] }) => {
    const relevantErrors = validationErrors.filter((x) => keys.includes(x));

    return (
      <ThemeIcon
        opacity={relevantErrors.length === 0 ? 0 : 1}
        color="red"
        size={18}
        variant="light"
      >
        <IconAlertTriangle size={15} />
      </ThemeIcon>
    );
  };

  return (
    <>
      <Stack spacing={0} align="center" my="lg">
        <DebouncedImage src={form.values.iconUrl} width={120} height={120} />

        <Text align="center" weight="bold" size="lg" mt="md">
          {form.values.name ?? 'New App'}
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack
          justify="space-between"
          style={{
            minHeight: 300,
          }}
        >
          <Tabs
            value={activeTab}
            onTabChange={(tab) => setActiveTab(tab as EditAppModalTab)}
            defaultValue="general"
            radius="md"
          >
            <Tabs.List grow>
              <Tabs.Tab
                rightSection={
                  <ValidationErrorIndicator keys={['name', 'internalUrl', 'externalUrl']} />
                }
                icon={<IconAdjustments size={14} />}
                value="general"
              >
                {t('tabs.general')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['openInNewTab', 'description']} />}
                icon={<IconClick size={14} />}
                value="behaviour"
              >
                {t('tabs.behaviour')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['isPingEnabled', 'statusCodes']} />}
                icon={<IconAccessPoint size={14} />}
                value="network"
              >
                {t('tabs.network')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={
                  <ValidationErrorIndicator
                    keys={['iconUrl', 'nameStyle', 'fontSize', 'namePosition', 'nameLineClamp']}
                  />
                }
                icon={<IconBrush size={14} />}
                value="appearance"
              >
                {t('tabs.appearance')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={[]} />}
                icon={<IconPlug size={14} />}
                value="integration"
              >
                {t('tabs.integration')}
              </Tabs.Tab>
            </Tabs.List>

            <GeneralTab form={form} />
            <BehaviourTab form={form} />
            <NetworkTab form={form} />
            <AppearanceTab
              form={form}
              disallowAppNamePropagation={() => setAllowAppNamePropagation(false)}
              allowAppNamePropagation={allowAppNamePropagation}
            />
            <IntegrationTab form={form} />
          </Tabs>

          <Group noWrap position="right" mt="md">
            <Button onClick={closeModal} px={50} variant="light" color="gray">
              {t('common:cancel')}
            </Button>
            <SaveButton formIsValid={form.isValid()} />
          </Group>
        </Stack>
      </form>
    </>
  );
};

const SaveButton = ({ formIsValid }: { formIsValid: boolean }) => {
  const [opened, { close, open }] = useDisclosure(false);
  const { t } = useTranslation(['layout/modals/add-app', 'common']);

  return (
    <Popover opened={opened && !formIsValid} width={300} withArrow withinPortal>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Button disabled={!formIsValid} px={50} type="submit">
            {t('common:save')}
          </Button>
        </div>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>{t('validation.popover')}</Popover.Dropdown>
    </Popover>
  );
};

export type EditAppModalTab = 'general' | 'behaviour' | 'network' | 'appereance' | 'integration';

export const appFormSchema = z.object({
  id: z.string().nonempty(),
  type: z.literal('app'),
  name: z.string().min(2).max(64),
  internalUrl: z.string().regex(new RegExp(appUrlRegex)),
  externalUrl: z.string().regex(new RegExp(appUrlWithAnyProtocolRegex)).nullable(),
  iconUrl: z.string().nonempty(),
  nameStyle: z.enum(appNameStyles),
  namePosition: z.enum(appNamePositions),
  nameLineClamp: z.number().min(0).max(10),
  fontSize: z.number().min(5).max(64),
  isPingEnabled: z.boolean(),
  statusCodes: z.array(z.number().min(100).max(999)),
  openInNewTab: z.boolean(),
  description: z.string().nonempty().max(512).nullable(),
  integrationId: z.string().nonempty().nullable(),
});

type FormType = z.infer<typeof appFormSchema>;
export type AppForm = UseFormReturnType<FormType, (values: FormType) => FormType>;
