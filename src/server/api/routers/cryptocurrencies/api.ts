import { cryptoDataSchema, cryptoMarketChartSchema, cryptoWidgetDataSchema } from "./types";

export const getCoinGeckoCryptoData = async (crypto = 'bitcoin') => {
    const url = `https://api.coingecko.com/api/v3/coins/${crypto}`;
    const res = await fetch(url);
    return cryptoDataSchema.parse(await res.json());
  };
  export const getCoinGeckoCryptoMarketChart = async ({
    crypto = 'bitcoin',
    fiatCurrency = 'usd',
    days = 7,
  }) => {
    const url = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=${fiatCurrency}&days=${days}`;
    const res = await fetch(url);
    return cryptoMarketChartSchema.parse(await res.json());
  };
  export const getInitialData = async () => {
    const cryptoData = cryptoDataSchema.parse(await getCoinGeckoCryptoData());
    const marketData = cryptoMarketChartSchema.parse(await getCoinGeckoCryptoMarketChart({}));
    console.log(cryptoData);

    return cryptoWidgetDataSchema.parse({ cryptoData, marketData });
  };