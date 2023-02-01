import { Input, Slider, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';

export const GridstackConfiguration = () => {
  const { t } = useTranslation();
  return (
    <>
      <Title order={6}>Gridstack configuration</Title>

      <Input.Wrapper
        label="Small"
        description="Number of columns when the screen is less than 768 pixels wide"
        mb="md"
      >
        <Slider min={4} max={10} mt="xs" />
      </Input.Wrapper>
      <Input.Wrapper
        label="Medium"
        description="Number of columns when the screen is less than 768 pixels wide"
        mb="md"
      >
        <Slider min={4} max={10} mt="xs" />
      </Input.Wrapper>
      <Input.Wrapper
        label="Large"
        description="Number of columns when the screen is less than 768 pixels wide"
      >
        <Slider min={4} max={10} mt="xs" />
      </Input.Wrapper>
    </>
  );
};
