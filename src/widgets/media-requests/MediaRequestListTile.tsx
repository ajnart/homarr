import { Badge, Card, Center, Flex, Group, Image, Stack, Text } from '@mantine/core';
import { IconGitPullRequest } from '@tabler/icons';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery } from './media-request-query';
import { MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-list',
  icon: IconGitPullRequest,
  options: {},
  component: MediaRequestListTile,
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type MediaRequestListWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface MediaRequestListWidgetProps {
  widget: MediaRequestListWidget;
}

function MediaRequestListTile({ widget }: MediaRequestListWidgetProps) {
  const { data, isFetching } = useMediaRequestQuery();

  if (!data || isFetching) {
    return <WidgetLoading />;
  }

  if (data.length === 0) {
    return (
      <Center h="100%">
        <Text>There are no requests. Ensure that you&apos;ve configured your apps correctly.</Text>
      </Center>
    );
  }

  const countPendingApproval = data.filter(
    (x) => x.status === MediaRequestStatus.PendingApproval
  ).length;

  return (
    <Stack>
      {countPendingApproval > 0 ? (
        <Text>There are {countPendingApproval} requests waiting for an approval.</Text>
      ) : (
        <Text>There are currently no pending approvals. You&apos;re good to go!</Text>
      )}
      {data.map((item) => (
        <Card pos="relative" withBorder>
          <Flex justify="space-between" gap="md">
            <Flex gap="md">
              <Image
                src={item.posterPath}
                width={30}
                height={50}
                alt="poster"
                radius="xs"
                withPlaceholder
              />
              <Stack spacing={0}>
                <Group spacing="xs">
                  <Text>{item.airDate.split('-')[0]}</Text>
                  <MediaRequestStatusBadge status={item.status} />
                </Group>
                <Text
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  lineClamp={1}
                  weight="bold"
                  component="a"
                  href={item.href}
                >
                  {item.name}
                </Text>
              </Stack>
            </Flex>
            <Flex gap="xs">
              <Image src={item.userProfilePicture} width={25} height={25} alt="requester avatar" />
              <Text
                component="a"
                href={item.userLink}
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                {item.userName}
              </Text>
            </Flex>
          </Flex>

          <Image
            src={item.backdropPath}
            pos="absolute"
            w="100%"
            h="100%"
            opacity={0.1}
            top={0}
            left={0}
            style={{ pointerEvents: 'none' }}
          />
        </Card>
      ))}
    </Stack>
  );
}

const MediaRequestStatusBadge = ({ status }: { status: MediaRequestStatus }) => {
  switch (status) {
    case MediaRequestStatus.Approved:
      return <Badge color="green">Approved</Badge>;
    case MediaRequestStatus.Declined:
      return <Badge color="red">Declined</Badge>;
    case MediaRequestStatus.PendingApproval:
      return <Badge color="orange">Pending approval</Badge>;
    default:
      return <></>;
  }
};

export default definition;
