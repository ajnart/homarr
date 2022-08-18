import { ReactNode, Suspense } from 'react';

import { I18nextProvider } from 'react-i18next';
import { loadI18n } from '../translations/i18n';

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  return (
    <Suspense>
      <I18nextProvider i18n={loadI18n()}>{children}</I18nextProvider>
    </Suspense>
  );
};
