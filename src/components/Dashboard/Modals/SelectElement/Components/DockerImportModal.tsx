import { Button, Card, Center, Checkbox, Grid, Group, Image, Stack, Text } from '@mantine/core';
import { closeAllModals, closeModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import Dockerode from 'dockerode';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ContainerState from '~/components/Manage/Tools/Docker/ContainerState';
import { useConfigContext } from '~/config/provider';
import { NormalizedIconRepositoryResult } from '~/tools/server/images/abstract-icons-repository';
import { api } from '~/utils/api';
import { ConditionalWrapper } from '~/utils/security';
import { WidgetLoading } from '~/widgets/loading';

import { SelectorBackArrow } from './Shared/SelectorBackArrow';

function DockerDispaly({
  container,
  selected,
  setSelected,
  iconsData,
}: {
  container: Dockerode.ContainerInfo;
  selected: Dockerode.ContainerInfo[];
  setSelected: (containers: Dockerode.ContainerInfo[]) => void;
  iconsData: NormalizedIconRepositoryResult[];
}) {
  const containerName = container.Names[0].replace('/', '');
  const isSelected = selected.includes(container);
  // Example image : linuxserver.io/sonarr:latest
  // Remove the slashes
  const imageParsed = container.Image.split('/');
  // Remove the version
  const image = imageParsed[imageParsed.length - 1].split(':')[0];
  const foundIcon = iconsData
    .flatMap((repository) =>
      repository.entries.map((entry) => ({
        ...entry,
        repository: repository.name,
      }))
    )
    .find((entry) => entry.name.toLowerCase().includes(image.toLowerCase()));
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      style={{
        cursor: 'pointer',
      }}
      onClick={() =>
        setSelected(isSelected ? selected.filter((c) => c !== container) : [...selected, container])
      }
    >
      <Card style={{ height: '100%' }} shadow="sm" radius="md" withBorder>
        <Stack justify="space-between" style={{ height: '100%' }}>
          <Group
            style={{
              alignSelf: 'flex-end',
            }}
          >
            <ContainerState state={container.State} />
            <Checkbox radius="xl" checked={isSelected} size="sm" />
          </Group>

          <Center>
            <Image
              withPlaceholder
              h={60}
              maw={60}
              w={60}
              src={foundIcon?.url ?? `https://placehold.co/60x60?text=${containerName}`}
            />
          </Center>
          <Stack spacing={0}>
            <Text lineClamp={1} align="center">
              {containerName}
            </Text>
            {container.Image && (
              <Text
                size="xs"
                style={{ overflow: 'hidden', textOverflow: 'elipsis' }}
                align="center"
                color="dimmed"
              >
                {container.Image}
              </Text>
            )}
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
}

function findIconForContainer(
  container: Dockerode.ContainerInfo,
  iconsData: NormalizedIconRepositoryResult[]
) {
  const imageParsed = container.Image.split('/');
  // Remove the version
  const image = imageParsed[imageParsed.length - 1].split(':')[0];
  const foundIcon = iconsData
    .flatMap((repository) =>
      repository.entries.map((entry) => ({
        ...entry,
        repository: repository.name,
      }))
    )
    .find((entry) => entry.name.toLowerCase().includes(image.toLowerCase()));
  return foundIcon;
}

export default function ImportFromDockerModal({ onClickBack }: { onClickBack: () => void }) {
  const { data, isLoading } = api.docker.containers.useQuery(undefined, {});
  const { data: iconsData } = api.icon.all.useQuery();
  const { config } = useConfigContext();
  const { mutateAsync, isLoading: mutationIsLoading } =
    api.boards.addAppsForContainers.useMutation();

  const [selected, setSelected] = useState<Dockerode.ContainerInfo[]>([]);

  if (isLoading || !data || !iconsData) return <WidgetLoading />;
  return (
    <Stack m="sm">
      <SelectorBackArrow onClickBack={onClickBack} />
      <Grid>
        {data?.map((container) => (
          <Grid.Col xs={12} sm={4} md={3}>
            <DockerDispaly
              selected={selected}
              setSelected={setSelected}
              iconsData={iconsData}
              container={container}
            />
          </Grid.Col>
        ))}
      </Grid>
      <Button
        loading={mutationIsLoading}
        style={{
          zIndex: 1000,
        }}
        pos={'sticky'}
        bottom={10}
        disabled={selected.length === 0}
        onClick={async () => {
          mutateAsync({
            apps: selected.map((container) => ({
              name: (container.Names.at(0) ?? 'App').replace('/', ''),
              port: container.Ports.at(0)?.PublicPort,
              icon: findIconForContainer(container, iconsData)?.url,
            })),
            boardName: config?.configProperties.name!,
          }).then(() => {
						//TODO: Reload config
            closeAllModals();
            notifications.show({
              title: 'Success',
              message: 'Containers added to dashboard',
              color: 'green',
            });
          });
        }}
      >
        Add {selected.length} container{selected.length > 1 && 's'} to dashboard
      </Button>
    </Stack>
  );
}
