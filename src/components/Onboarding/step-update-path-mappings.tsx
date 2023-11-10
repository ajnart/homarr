import { Box, Button, Code, Group, List, Space, Tabs, TabsValue, Text, Title } from '@mantine/core';
import { Prism } from '@mantine/prism';
import {
  IconArrowRight,
  IconBrandDebian,
  IconBrandDocker,
  IconInfoSquareRounded,
} from '@tabler/icons-react';
import Image from 'next/image';
import { useState } from 'react';

import { OnboardingStepWrapper } from './common-wrapper';

const dockerRunCommand = `docker run  \\
--name homarr \\
--restart unless-stopped \\
-p 7575:7575 \\
-v your-path/homarr/configs:/app/data/configs \\
-v your-path/homarr/data:/data \\
-v your-path/homarr/icons:/app/public/icons \\
-d ghcr.io/ajnart/homarr:latest`;

const dockerComposeCommand = `version: '3'
#---------------------------------------------------------------------#
#     Homarr - A simple, yet powerful dashboard for your server.     #
#---------------------------------------------------------------------#
services:
  homarr:
    container_name: homarr
    image: ghcr.io/ajnart/homarr:latest
    restart: unless-stopped
    volumes:
      - ./homarr/configs:/app/data/configs
      - ./homarr/data:/data
      - ./homarr/icons:/app/public/icons
    ports:
      - '7575:7575'`;

const added = { color: 'green', label: '+' };

export const StepUpdatePathMappings = ({ next }: { next: () => void }) => {
  const [selectedTab, setSelectedTab] = useState<TabsValue>('standard_docker');
  return (
    <OnboardingStepWrapper>
      <Title order={2} align="center" mb="md">
        Update path mappings
      </Title>
      <Text color="dimmed">
        Homarr has updated the location of the saved data. We detected, that your instance might
        need an update to function as expected. It is recommended, that you take a backup of your
        .json configuration file on the file system and copy it, in case something goes wrong.
      </Text>

      <Space h={15} />
      <Tabs value={selectedTab} onTabChange={(tab) => setSelectedTab(tab)} mt="xs">
        <Tabs.List position="center">
          <Tabs.Tab value="standard_docker" icon={<IconBrandDocker size={16} />}>
            Docker
          </Tabs.Tab>
          <Tabs.Tab value="docker_compose" icon={<IconBrandDocker size={16} />}>
            Docker Compose
          </Tabs.Tab>
          <Tabs.Tab value="standalone" icon={<IconBrandDebian size={16} />}>
            Standalone Linux / Windows
          </Tabs.Tab>
          <Tabs.Tab
            value="unraid"
            icon={<Image width={16} height={16} src="/imgs/app-icons/unraid-alt.svg" alt="" />}
          >
            Unraid
          </Tabs.Tab>
          <Tabs.Tab value="others" icon={<IconInfoSquareRounded size={16} />}>
            Others
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="standard_docker" p="xs">
          <List type="ordered">
            <List.Item>
              <Text>
                <b>Back up your configuration</b>. In case you didn't mount your configuration
                correctly, you could risk loosing your dashboard. To back up,
                <b>go on your file system and copy the directory, containing your </b>
                <Code>default.json</Code> to your local machine.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Before you continue, check that you still have the command, that you set up Homarr
                with. Otherwise, your configuration might not be loaded correctly or icons are
                missing.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Run <Code>docker rm homarr</Code>, where <Code>homarr</Code> indicates the name of
                your container
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Run <Code>docker run ...</Code> again, that you used to create the Homarr container.
                Note, that you need to add a new line:
              </Text>
              <Prism highlightLines={{ 6: added }} language="bash" withLineNumbers>
                {dockerRunCommand}
              </Prism>
            </List.Item>
            <List.Item>Refresh this page and click on "continue"</List.Item>
          </List>
        </Tabs.Panel>

        <Tabs.Panel value="docker_compose" p="xs">
          <List type="ordered">
            <List.Item>
              <Text>
                <b>Back up your configuration</b>. In case you didn't mount your configuration
                correctly, you could risk loosing your dashboard. To back up,
                <b>go on your file system and copy the directory, containing your </b>
                <Code>default.json</Code> to your local machine.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Navigate to the directory, where the <Code>docker-compose.yml</Code> for Homarr is
                located.
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Run <Code>docker compose down</Code>
              </Text>
            </List.Item>
            <List.Item>
              <Text>
                Edit <Code>docker-compose.yml</Code> using text editor. Use Notepad or VSC on GUI
                based systems. Use <Code>nano</Code> or <Code>vim</Code> on terminal systems.
              </Text>
              <Prism highlightLines={{ 12: added }} language="bash" withLineNumbers>
                {dockerComposeCommand}
              </Prism>
            </List.Item>
            <List.Item>
              Run <Code>docker compose up</Code>.
            </List.Item>
            <List.Item>Refresh this page and click on "continue"</List.Item>
          </List>
        </Tabs.Panel>

        <Tabs.Panel value="standalone" p="xs">
          <Text>
            You're lucky. For installation <b>without Docker</b> on Windows and Linux, there are no
            additional steps required. However, be advised that your backups should start to include
            the files located at <Code>/database</Code> too, if you run automatic backups.
          </Text>
        </Tabs.Panel>

        <Tabs.Panel value="unraid" p="xs">
          <List type="ordered">
            <List.Item>Click on your Homarr application and click "Edit"</List.Item>
            <List.Item>
              Scroll down and click on the link "Add another path, port, variable or device"
            </List.Item>
            <List.Item>
              After the new modal has opened, make sure that "Path" has been selected at the top
            </List.Item>
            <List.Item>
              In the container path, enter <Code>/data</Code>
            </List.Item>
            <List.Item>
              In the host path, enter a new path on your host system. Choose a similar path, but the
              innermost directory should be different, than your existing mounting points (eg.{' '}
              <Code>/mnt/user/appdata/homarr/data</Code>)
            </List.Item>
            <List.Item>Click "Apply" and wait for the container to be restarted.</List.Item>
            <List.Item>Refresh this page and click on "continue"</List.Item>
          </List>
        </Tabs.Panel>

        <Tabs.Panel value="others" p="xs">
          <Text>
            We are sadly not able to include upgrade guides for all kind of systems. If your system
            was not listed, you should mount this new mounting point in your container:
          </Text>
          <Code>/data</Code>
        </Tabs.Panel>
      </Tabs>

      {selectedTab ? (
        <Group align="end" mt="lg">
          <Button
            onClick={next}
            rightIcon={<IconArrowRight size="0.9rem" />}
            color="green"
            fullWidth
          >
            Continue
          </Button>
        </Group>
      ) : (
        <Box w="100%" p="xl">
          <Text color="dimmed" align="center" size="xs">
            Please select your installation method
          </Text>
        </Box>
      )}
    </OnboardingStepWrapper>
  );
};
