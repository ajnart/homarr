import { Button, Card, Center, Code, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { openModal } from '@mantine/modals';
import { IconBrandGithub, IconBug, IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import Consola from 'consola';
import { withTranslation } from 'next-i18next';
import React, { ReactNode } from 'react';
import { WidgetsMenu } from '~/components/Dashboard/Tiles/Widgets/WidgetsMenu';

import { IWidget } from './widgets';

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | undefined;
};

type ErrorBoundaryProps = {
  t: (key: string) => string;
  children: ReactNode;
  integration: string;
  widget: IWidget<string, any>;
};

/**
 * A custom error boundary, that catches errors within widgets and renders an error component.
 * The error component can be refreshed and shows a modal with error details
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Consola.error(`Error while rendering widget, ${error}: ${errorInfo}`);
  }

  render() {
    // Check if the error is thrown
    if (this.state.hasError) {
      return (
        <Card
          m={10}
          sx={(theme) => ({
            backgroundColor: theme.colors.red[5],
          })}
          radius="lg"
          shadow="sm"
          withBorder
          h="calc(100% - 20px)"
        >
          <WidgetsMenu integration={this.props.integration} widget={this.props.widget} />
          <ScrollArea h="100%" type="auto" offsetScrollbars>
            <Center>
              <Stack align="center" spacing="xs">
                <IconBug color="white" />
                <Stack spacing={0} align="center">
                  <Title order={5} color="white" align="center">
                    {this.props.t('card.title')}
                  </Title>
                  {this.state.error && (
                    <Text color="white" align="center" size="sm">
                      {this.state.error.toString()}
                    </Text>
                  )}
                </Stack>
                <Group spacing="xs">
                  <Button
                    onClick={() =>
                      openModal({
                        title: 'Your widget had an error',
                        children: (
                          <>
                            <Text size="sm" mb="sm">
                              {this.props.t('modal.text')}
                            </Text>
                            {this.state.error && (
                              <>
                                <Text weight="bold" size="sm">
                                  {this.props.t('modal.label')}
                                </Text>
                                <Code block>{this.state.error.toString()}</Code>
                              </>
                            )}
                            <Button
                              sx={(theme) => ({
                                backgroundColor: theme.colors.gray[8],
                                '&:hover': {
                                  backgroundColor: theme.colors.gray[9],
                                },
                              })}
                              leftIcon={<IconBrandGithub />}
                              component="a"
                              href="https://github.com/ajnart/homarr/issues/new?assignees=&labels=%F0%9F%90%9B+Bug&template=bug.yml&title=New%20bug"
                              target="_blank"
                              mt="md"
                              fullWidth
                            >
                              {this.props.t('modal.reportButton')}
                            </Button>
                          </>
                        ),
                      })
                    }
                    leftIcon={<IconInfoCircle size={16} />}
                    variant="light"
                  >
                    {this.props.t('card.buttons.details')}
                  </Button>
                  <Button
                    onClick={() => this.setState({ hasError: false })}
                    leftIcon={<IconRefresh size={16} />}
                    variant="light"
                  >
                    {this.props.t('card.buttons.tryAgain')}
                  </Button>
                </Group>
              </Stack>
            </Center>
          </ScrollArea>
        </Card>
      );
    }

    // Return children components in case of no error
    return this.props.children;
  }
}

export default withTranslation('widgets/error-boundary')(ErrorBoundary);
