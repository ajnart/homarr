import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { MainLayout } from '../../components/layout/admin/main-layout';
import { getServerSideTranslations } from '../../tools/server/getServerSideTranslations';

const Index: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => (
  <MainLayout />
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translations = await getServerSideTranslations(
    ['common', 'form'],
    context.locale,
    context.req,
    context.res,
  );

  return { props: { ...translations } };
};

export default Index;
