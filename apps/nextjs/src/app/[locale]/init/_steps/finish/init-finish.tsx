import type { MantineColor } from "@mantine/core";
import { Button, Card, Stack, Text } from "@mantine/core";
import { IconBook2, IconCategoryPlus, IconLayoutDashboard, IconMailForward } from "@tabler/icons-react";

import { isProviderEnabled } from "@homarr/auth/server";
import { getMantineColor } from "@homarr/common";
import { db } from "@homarr/db";
import { createDocumentationLink } from "@homarr/definitions";
import { getScopedI18n } from "@homarr/translation/server";
import { Link } from "@homarr/ui";
import type { TablerIcon } from "@homarr/ui";

export const InitFinish = async () => {
  const firstBoard = await db.query.boards.findFirst({ columns: { name: true } });
  const tFinish = await getScopedI18n("init.step.finish");

  return (
    <Card w={64 * 6} maw="90vw" withBorder>
      <Stack>
        <Text>{tFinish("description")}</Text>

        {firstBoard ? (
          <InternalLinkButton
            href={`/auth/login?callbackUrl=/boards/${firstBoard.name}`}
            iconProps={{ icon: IconLayoutDashboard, color: "blue" }}
          >
            {tFinish("action.goToBoard", { name: firstBoard.name })}
          </InternalLinkButton>
        ) : (
          <InternalLinkButton
            href="/auth/login?callbackUrl=/manage/boards"
            iconProps={{ icon: IconCategoryPlus, color: "blue" }}
          >
            {tFinish("action.createBoard")}
          </InternalLinkButton>
        )}

        {isProviderEnabled("credentials") && (
          <InternalLinkButton
            href="/auth/login?callbackUrl=/manage/users/invites"
            iconProps={{ icon: IconMailForward, color: "pink" }}
          >
            {tFinish("action.inviteUser")}
          </InternalLinkButton>
        )}

        <ExternalLinkButton
          href={createDocumentationLink("/docs/getting-started/after-the-installation")}
          iconProps={{ icon: IconBook2, color: "yellow" }}
        >
          {tFinish("action.docs")}
        </ExternalLinkButton>
      </Stack>
    </Card>
  );
};

interface LinkButtonProps {
  href: string;
  children: string;
  iconProps: IconProps;
}

interface IconProps {
  icon: TablerIcon;
  color: MantineColor;
}

const Icon = ({ icon: IcomComponent, color }: IconProps) => {
  return <IcomComponent color={getMantineColor(color, 6)} size={16} stroke={1.5} />;
};

const InternalLinkButton = ({ href, children, iconProps }: LinkButtonProps) => {
  return (
    <Button variant="default" component={Link} href={href} leftSection={<Icon {...iconProps} />}>
      {children}
    </Button>
  );
};

const ExternalLinkButton = ({ href, children, iconProps }: LinkButtonProps) => {
  return (
    <Button variant="default" component="a" href={href} leftSection={<Icon {...iconProps} />}>
      {children}
    </Button>
  );
};
