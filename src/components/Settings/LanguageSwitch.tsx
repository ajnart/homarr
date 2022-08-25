import { Group, Image, Select, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { forwardRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { getCookie, setCookie } from 'cookies-next';
import { getLanguageByCode, Language } from '../../languages/language';

export default function LanguageSwitch() {
  const { t, i18n } = useTranslation('settings/general/internationalization');
  const { changeLanguage } = i18n;
  const configLocale = getCookie('config-locale');
  const { locale, locales } = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(
    (configLocale as string) ?? locale
  );

  const data = locales
    ? locales.map((localeItem) => ({
        value: localeItem,
        label: getLanguageByCode(localeItem).originalName,
        image: `imgs/flags/${localeItem}.png`,
        language: getLanguageByCode(localeItem),
      }))
    : [];

  const onChangeSelect = (value: string) => {
    setSelectedLanguage(value);

    const newLanguage = getLanguageByCode(value);
    changeLanguage(value)
      .then(() => {
        setCookie('config-locale', value, {
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'strict',
        });

        showNotification({
          title: 'Language changed',
          message: `You changed the language to '${newLanguage.originalName}'`,
          color: 'green',
          autoClose: 5000,
        });
      })
      .catch((err) => {
        showNotification({
          title: 'Failed to change language',
          message: `Failed to change to '${newLanguage.originalName}', Error:'${err}`,
          color: 'red',
          autoClose: 5000,
        });
      });
  };

  return (
    <Stack>
      <Select
        icon={
          <Image
            width={30}
            height={18}
            src={`/imgs/flags/${selectedLanguage}.png`}
            alt="country flag"
            styles={{
              root: {
                borderRadius: 1.5,
                overflow: 'hidden',
              },
            }}
          />
        }
        label={t('label')}
        data={data}
        itemComponent={SelectItem}
        nothingFound="Nothing found"
        onChange={onChangeSelect}
        value={selectedLanguage}
        defaultValue={locale}
        styles={{
          icon: {
            width: 42,
          },
          input: {
            paddingLeft: '45px !important',
          },
        }}
      />
    </Stack>
  );
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  language: Language;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ language, image, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Image src={image} width={30} height={20} radius="xs" />

        <div>
          <Text size="sm">
            {language.originalName} ({language.translatedName})
          </Text>
        </div>
      </Group>
    </div>
  )
);
