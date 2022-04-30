import { Anchor, Button, ThemeIcon, Tooltip } from '@mantine/core';
import fileDownload from 'js-file-download';
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Download } from 'tabler-icons-react';

export default function SaveConfigComponent(props: any) {
  function onClick(e: any) {
    const services = localStorage.getItem('services');
    if (services) {
      fileDownload(JSON.stringify(JSON.parse(services), null, '\t'), 'services.json');
    }
  }
  return (
      <Button leftIcon={<Download />} variant="outline" onClick={onClick}>
        Download your config
      </Button>
  );
}
