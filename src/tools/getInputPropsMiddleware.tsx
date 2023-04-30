import { Trans } from 'next-i18next';

export const getInputPropsMiddleware = (inputProps: { error: string } & any) => ({
  ...inputProps,
  error: inputProps.error ? <Trans ns="form" i18nKey={inputProps.error} /> : undefined,
});
