import { Card, Center, Flex, Group, Stack, Text } from '@mantine/core';
import { IconReportSearch, IconUnlink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'indexer-manager',
  icon: IconReportSearch,
  options: {
    url: {
      type: 'text',
      defaultValue: '',
    },
    apiKey: {
      type: 'text',
      defaultValue: '',
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 2,
  },
  component: IndexerManagerWidgetTile,
});

export type IIndexerManagerWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface IndexerManagerWidgetProps {
  widget: IIndexerManagerWidget;
}

function IndexerManagerWidgetTile({ widget }: IndexerManagerWidgetProps) {
  const [indexerData, setIndexerData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIndexerStatus = async () => {
      try {
        const response = await fetch(`${widget.properties.url}/api/v1/indexer`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': widget.properties.apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setIndexerData(data);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchIndexerStatus();
  }, []);

  if (error) {
    return (
      <Center h="100%">
        <Stack spacing="xs" align="center">
          <IconUnlink size={40} strokeWidth={1.2} />
          <Text> Error: {error}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={2}>Indexer Status</Text>
      <Card py={5} px={10} radius="md" style={{ overflow: 'unset' }} withBorder>
        {indexerData.map((indexer: any, index) => {
          return (
            <Group key={index} position="apart">
              <Text color="dimmed" align="center" size="xs">
                {indexer.name}
              </Text>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: indexer.enable ? '#2ecc71' : '#d9534f',
                }}
              />
            </Group>
          );
        })}
      </Card>
    </Flex>
  );
}

export default definition;
