"use client";

import { Button } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";

import { revalidatePathActionAsync } from "@homarr/common/client";
import { UploadMedia } from "@homarr/forms-collection";
import { useI18n } from "@homarr/translation/client";

export const UploadMediaButton = () => {
  const t = useI18n();
  const onSettledAsync = async () => {
    await revalidatePathActionAsync("/manage/medias");
  };

  return (
    <UploadMedia onSettled={onSettledAsync} multiple>
      {({ onClick, loading }) => (
        <Button onClick={onClick} loading={loading} rightSection={<IconUpload size={16} stroke={1.5} />}>
          {t("media.action.upload.label")}
        </Button>
      )}
    </UploadMedia>
  );
};
