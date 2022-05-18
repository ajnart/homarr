import { Title } from '@mantine/core';
import { useRouter } from 'next/router';

export default function SlugPage(props: any) {
  const router = useRouter();
  const { slug } = router.query;
  return <Title>ok</Title>;
}
