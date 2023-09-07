import { Group, Select, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { getCookie, setCookie } from 'cookies-next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { forwardRef, useState } from 'react';
import { api } from '~/utils/api';

import { COOKIE_LOCALE_KEY } from '../../../../../data/constants';
import { Language, getLanguageByCode } from '~/tools/language';

export default function LanguageSelect() {
  const { data: sessionData } = useSession();
  const { t, i18n } = useTranslation('settings/general/internationalization');
  const { changeLanguage } = i18n;
  const configLocale = getCookie(COOKIE_LOCALE_KEY);
  const { locale, locales, pathname, query, asPath, push } = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    sessionData?.user.language ?? (configLocale as string) ?? locale ?? 'en'
  );
  const { mutateAsync } = api.user.changeLanguage.useMutation();

  const data = locales
    ? locales.map((localeItem) => ({
        value: localeItem,
        label: getLanguageByCode(localeItem).originalName,
        icon: getLanguageByCode(localeItem).emoji,
        language: getLanguageByCode(localeItem),
      }))
    : [];

  const onChangeSelect = (value: string) => {
    setSelectedLanguage(value);

    const newLanguage = getLanguageByCode(value);
    changeLanguage(value)
      .then(async () => {
        setCookie(COOKIE_LOCALE_KEY, value, {
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'strict',
        });

        if (sessionData?.user && new Date(sessionData.expires) > new Date()) {
          await mutateAsync({
            language: value,
          });
        }

        push(
          {
            pathname,
            query,
          },
          asPath,
          { locale: value }
        );

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
        icon={<Text>{getLanguageByCode(selectedLanguage).emoji}</Text>}
        label={t('label')}
        data={data}
        itemComponent={SelectItem}
        nothingFound="Nothing found"
        onChange={onChangeSelect}
        value={selectedLanguage}
        defaultValue={locale}
        searchable
        filter={(value, item) => {
          const selectItems = item as unknown as { value: string; language: Language };
          return (
            selectItems.language.originalName
              .toLowerCase()
              .trim()
              .includes(value.toLowerCase().trim()) ||
            selectItems.language.translatedName
              .toLowerCase()
              .trim()
              .includes(value.toLowerCase().trim())
          );
        }}
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
        <Text>{language.emoji}</Text>

        <div>
          <Text size="sm">
            {language.originalName} ({language.translatedName})
          </Text>
        </div>
      </Group>
    </div>
  )
);
