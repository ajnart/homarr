import { Group, Image, Select, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconLanguage } from '@tabler/icons';

import { forwardRef, useState } from 'react';
import { useTranslation } from 'next-i18next';

export default function LanguageSwitch() {
  const { t, i18n } = useTranslation('settings/general/internationalization');
  /*const { language, languages, changeLanguage } = i18n;

  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(language);

  const data = languages.map((language) => ({
    image: `https://countryflagsapi.com/png/${language.split('-').pop()}`,
    label: 'JA',
    value: language,
  }));*/

  const onChangeSelect = (value: string) => {
    //setSelectedLanguage(value);

    const languageName = 'JA IS HALZ SCHEISSE NE';

    /*changeLanguage(value)
      .then(() => {
        showNotification({
          title: 'Language changed',
          message: `You changed the language to '${languageName}'`,
          color: 'green',
          autoClose: 5000,
        });
      })
      .catch((err) => {
        showNotification({
          title: 'Failed to change language',
          message: `Failed to change to '${languageName}', Error:'${err}`,
          color: 'red',
          autoClose: 5000,
        });
      });*/
  };

  return (
    <Stack>
      <Select
        icon={<IconLanguage size={18} />}
        label={t('label')}
        data={[
          {
            value: 'uwu',
            label: 'asdf',
          },
        ]}
        itemComponent={SelectItem}
        nothingFound="Nothing found"
        onChange={onChangeSelect}
        /*
        value={selectedLanguage}
        defaultValue={language}
        */
      />
    </Stack>
  );
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Image src={image} width={30} height={20} radius="xs" />

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  )
);
