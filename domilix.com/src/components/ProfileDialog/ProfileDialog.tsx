'use client';

import SettingsPanel, { type SettingsPanelProps } from '@components/SettingsPanel/SettingsPanel';

export default function ProfileDialog(props: SettingsPanelProps) {
  return <SettingsPanel {...props} variant='modal' />;
}
