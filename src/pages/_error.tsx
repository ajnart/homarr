import { Accordion, Center, createStyles, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { IconDeviceDesktop, IconInfoCircle, IconServer } from '@tabler/icons-react';
import { NextPageContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import imageBugFixing from '~/images/undraw_bug_fixing_oc-7-a.svg';

function Error({ statusCode }: { statusCode: number }) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const getColor = (color: string) => theme.colors[color][theme.colorScheme === 'dark' ? 5 : 7];
  return (
    <Center className={classes.root} h="100dvh" maw={400}>
      <Head>
        <title>An error occurred • Homarr</title>
      </Head>
      <Stack>
        <Image className={classes.image} src={imageBugFixing} alt="bug illustration" />
        <Title>An unexpected error has occurred</Title>
        <Text>
          This page has crashed unexpectedly. We're sorry for the inconvenience. Please try again or
          contact an administrator
        </Text>

        <Accordion variant="contained">
          <Accordion.Item value="detailed">
            <Accordion.Control icon={<IconInfoCircle color={getColor('red')} size="1rem" />}>
              Detailed error information
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="xs">
                <Group position="apart">
                  <Text fw="bold">Type</Text>
                  <Text>
                    {statusCode ? (
                      <Group spacing="xs">
                        <IconServer size="1rem" />
                        <Text>Server side</Text>
                      </Group>
                    ) : (
                      <Group spacing="xs">
                        <IconDeviceDesktop size="1rem" />
                        <Text>Client side</Text>
                      </Group>
                    )}
                  </Text>
                </Group>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Center>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

const useStyles = createStyles(() => ({
  root: {
    margin: '0 auto',
  },
  image: {
    maxWidth: 400,
    maxHeight: 200,
    display: 'block',
    margin: '0 auto',
  },
}));

export default Error;
