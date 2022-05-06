import { Button } from '@mantine/core';
import fileDownload from 'js-file-download';
import { Download } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';

export default function SaveConfigComponent(props: any) {
  const { config } = useConfig();
  function onClick(e: any) {
    if (config) {
      fileDownload(JSON.stringify(config, null, '\t'), 'config.json');
    }
  }
  return (
    <Button leftIcon={<Download />} variant="outline" onClick={onClick}>
      Download your config
    </Button>
  );
}
