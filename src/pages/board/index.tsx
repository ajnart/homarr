import { Title } from '@mantine/core';
import { GetServerSideProps } from 'next';
import { MainLayout } from '~/components/layout/main';

export default function BoardPage() {
  return (
    <MainLayout>
      <Title order={1}>BoardPage</Title>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  console.log('getServerSideProps');
  return {
    props: {},
  };
};
