import withMock from 'storybook-addon-mock';
import WeatherComponent from './WeatherModule';
import mockdata from './mockdata.json';

export default {
  title: 'Weather module',
  decorators: [withMock],
};

export const Default = (args: any) => <WeatherComponent {...args} />;
Default.parameters = {
  mockData: [
    {
      url: 'https://api.open-meteo.com/v1/forecast',
      method: 'GET',
      status: 200,
      response: {
        data: mockdata,
      },
    },
  ],
};
