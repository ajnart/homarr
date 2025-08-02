import { Anchor, Button, Group, Image, List, Modal, Text, ThemeIcon, Title } from '@mantine/core';
import { IconBrandAbstract, IconLock, IconPlug, IconTestPipe } from '@tabler/icons-react';
import { getCookie, setCookie } from 'cookies-next';
import localFont from 'next/font/local';
import { useState } from 'react';

const poetsenOne = localFont({ src: '../../../public/PoetsenOne-Regular.ttf' });

export const CheckUpgradeModal = () => {
  const [isDismissed, setIsDismissed] = useState(getCookie('dismissed-upgrade-modal'));

  const close = () => {
    const sevenDays = 7 * 24 * 60 * 60; // 7 days in seconds
    setCookie('dismissed-upgrade-modal', 'true', {
      maxAge: sevenDays,
      path: '/',
    });
    setIsDismissed(true);
  };

  return (
    <Modal opened={!isDismissed} onClose={close} size={'xl'} radius={'xl'}>
      <Image src={'/imgs/2340450-2.png'} alt={'Homarr illustration'} width={300} height={'auto'} ml={'auto'}
             mr={'auto'} />
      <Title order={2} align={'center'} color={'red'} weight={'bolder'} mb={'lg'} className={poetsenOne.className}>Taking
        dashboards to<br />the next
        level 🚀</Title>

      <Text color={'#616161'}>Homarr just got the biggest update ever. It is a complete rewrite. Here's a short summary
        of it:</Text>

      <List my={'lg'} spacing={3}>
        <List.Item
          icon={
            <ThemeIcon color={'red'} radius={'md'} variant={'light'}>
              <IconPlug size={'1rem'} />
            </ThemeIcon>}>
          <b>Improved integrations</b> system with asynchronous fetching
          system</List.Item>
        <List.Item
          icon={
            <ThemeIcon color={'red'} radius={'md'} variant={'light'}>
              <IconLock size={'1rem'} />
            </ThemeIcon>}>
          Detailed <b>permission system</b></List.Item>
        <List.Item
          icon={
            <ThemeIcon color={'red'} radius={'md'} variant={'light'}>
              <IconTestPipe size={'1rem'} />
            </ThemeIcon>}>
          Automatic <b>integration testing</b> and <b>centralized management</b> of apps and integrations</List.Item>
        <List.Item
          icon={
            <ThemeIcon color={'red'} radius={'md'} variant={'light'}>
              <IconBrandAbstract size={'1rem'} />
            </ThemeIcon>}>
          <b>Reimagined widgets</b> with better design, better UX and <b>more options</b>.</List.Item>
      </List>


      <Text color={'#616161'}>Since 1.0 is a <Anchor
        href={'https://homarr.dev/blog/2024/09/23/version-1.0#breaking-changes'} target={'_blank'}>breaking
        release</Anchor>, we require you to manually upgrade to 1.0 and migrate your data over.
        Please read the migration guide carefully to avoid data loss. Depending in your installation method, you may
        need to check the migration guides of them respectively. Please backup your data before attempting the
        migration. <em>This message will not be displayed for the next 7 days, if you acknowledge and close</em>.</Text>

      <Group mt={'xl'} grow>
        <Button onClick={close} variant={'subtle'} color={'red'} radius={'xl'}>Acknowledge and close</Button>
        <Button variant={'light'} color={'green'} component={'a'}
                href={'https://homarr.dev/blog/2025/01/19/migration-guide-1.0'} target={'_blank'} radius={'xl'}>See 1.0
          migration
          guide</Button>
      </Group>

      <Text mt="lg" size="sm" color="dimmed" align="center">
        You can permanently disable this message by setting the <b>DISABLE_UPGRADE_MODAL</b> environment variable to <b>true</b>.
      </Text>
    </Modal>
  );
};