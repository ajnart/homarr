"use client";

import { Alert, Anchor } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";

import { createDocumentationLink } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

export const ReservedGroupAlert = () => {
  const t = useI18n();

  return (
    <Alert variant="light" color="yellow" icon={<IconExclamationCircle size="1rem" stroke={1.5} />}>
      {t.rich("group.reservedNotice.message", {
        checkoutDocs: () => (
          <Anchor
            size="sm"
            component={Link}
            href={createDocumentationLink("/docs/management/users", "#special-groups")}
            target="_blank"
          >
            {t("common.action.checkoutDocs")}
          </Anchor>
        ),
      })}
    </Alert>
  );
};
