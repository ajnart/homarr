import { Welcome } from '../components/Welcome/Welcome';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import AppShelf from '../components/AppShelf/AppShelf';
import { Center } from '@mantine/core';
import SaveConfigComponent from '../components/Config/SaveConfig';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { useEffect, useState } from 'react';
import { serviceItem } from '../components/AppShelf/AppShelf.d';

export default function HomePage() {
  return (
    <>
      <AppShelf />
      <LoadConfigComponent  />
    </>
  );
}
