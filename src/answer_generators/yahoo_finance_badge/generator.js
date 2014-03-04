function generateResults(recognitionResults, q, context) {
  'use strict';

  // In case of explicit activation
  var stockSymbols = q;
  var relevance = 0;
  var comparisonIndicator = '';
  var rrs = recognitionResults['com.solveforall.recognition.finance.stocks.StockSymbol'];

  if (rrs) {
    var stockSymbolArray = _(rrs[0].stockList).map(function (stock) {
      return stock.englishSymbol;
    });

    if (stockSymbolArray.length > 0) {
      relevance = 1.0;
    }

    if (stockSymbolArray.length > 1) {
      comparisonIndicator = ',,comparison';
    }

    stockSymbols = stockSymbolArray.join(',');
  }

  if (!stockSymbols || (stockSymbols.length === 0)) {
    return null;
  }

  var settings = context.settings;
  var chartInterval = '5d';
  var newsCount = '5';
  if (settings) {
    chartInterval = settings.chartInterval;
    newsCount = settings.newsCount;
  }

  var chartFragment = ';chart=' + chartInterval;

  if (chartInterval === 'None') {
    chartFragment = '';
  }

  // TODO: validate stockSymbols, chartInterval, newsCount

  var encodedStockSymbol = encodeURIComponent(stockSymbols);

  return [{
    label: 'Yahoo! Finance',
    iconUrl: 'https://finance.yahoo.com/favicon.ico',
    uri: 'http://api.finance.yahoo.com/instrument/1.0/' + encodedStockSymbol +
      '/badge' + chartFragment + comparisonIndicator + ';news=' +
      newsCount + ';quote/HTML/f.white?AppID=f0L2..pOymKhmdoad.D7vJulKkc5&sig=Ypb18cXVe63kvDF9Uz5GH5RcLBU-&t=1393739815394',
    embeddable: true,
    relevance: relevance
  }];
}