import { GetServerSideProps } from 'next';
import { MainLayout } from '../../components/layout/admin/main-layout';
import { getServerSideTranslations } from '../../tools/getServerSideTranslations';

const Index: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
  return <MainLayout></MainLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translations = await getServerSideTranslations(
    context.req,
    context.res,
    ['common', 'form'],
    context.locale
  );

  return { props: { ...translations } };
};

export default Index;
