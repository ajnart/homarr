import {
  Accordion,
  Button,
  Center,
  Code,
  Group,
  Stack,
  Table,
  Text,
  Title,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconDeviceDesktop, IconInfoCircle, IconServer } from '@tabler/icons-react';
import { NextPageContext } from 'next';
import Image from 'next/image';
import imageBugFixing from '~/images/undraw_bug_fixing_oc-7-a.svg';

function Error({ statusCode, err }: { statusCode: number; err: Error }) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const clipboard = useClipboard();
  const getColor = (color: string) => theme.colors[color][theme.colorScheme === 'dark' ? 5 : 7];
  return (
    <Center className={classes.root} h="100dvh" maw={400}>
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
                {err && (
                  <>
                    <Group position="apart">
                      <Text fw="bold">Error name</Text>
                      <Text>{err.name}</Text>
                    </Group>
                    <Group position="apart">
                      <Text fw="bold">Error message</Text>
                      <Text>{err.message}</Text>
                    </Group>
                  </>
                )}
                {err?.stack && (
                  <Group position="apart">
                    <Text fw="bold">Stacktrace</Text>
                    <Button
                      onClick={() => {
                        modals.open({
                          modalId: 'error_stacktrace',
                          title: <Text fw="bold">Error stacktrace</Text>,
                          children: (
                            <Stack>
                              <Text>
                                This may contain sensitive information. Please remove any private
                                data and send to trusted people only.
                              </Text>
                              <Code block>{err.stack}</Code>
                              <Group grow>
                                <Button
                                  onClick={() => {
                                    clipboard.copy(err.stack);
                                  }}
                                  variant="default"
                                >
                                  Copy
                                </Button>
                                <Button
                                  onClick={() => {
                                    modals.close('error_stacktrace');
                                  }}
                                  variant="light"
                                >
                                  Dismiss
                                </Button>
                              </Group>
                            </Stack>
                          ),
                        });
                      }}
                      variant="light"
                    >
                      Show stacktrace
                    </Button>
                  </Group>
                )}
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
  return { statusCode, err };
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
