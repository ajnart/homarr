import { SettingsMenuButton } from './SettingsMenu';

export default {
  title: ' menu',
  args: {
    opened: false,
  },
};

export const Default = (args: any) => <SettingsMenuButton {...args} />;
