import { GetServerSideProps } from 'next';

export default function BoardPage() {
  return (
    <div>
      <h1>BoardPage</h1>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  console.log('getServerSideProps');
  return {
    props: {},
  };
};
