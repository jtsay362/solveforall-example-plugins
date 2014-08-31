/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
function generateResults(recognitionResults, q, context) {
  'use strict';

  // In case of explicit activation
  var stockSymbols = q;
  var relevance = 0;
  var comparisonIndicator = '';
  var rrs = recognitionResults['com.solveforall.recognition.finance.stocks.StockSymbol'];

  if (rrs) {
    var stockSymbolArray = _(rrs).map(function (rr) {
      return rr.symbol;
    });

    if (stockSymbolArray.length > 0) {
      relevance = _(rrs).chain().map(function(rr) {
        return rr.recognitionLevel;
      }).max().value();    
      
      console.log('set relevance = ' + relevance);
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
  var chartInterval = settings.chartInterval || '5d';
  var newsCount = settings.newsCount || '5';

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
    shouldEmbed: true,
    relevance: relevance,
    minHeight: 294,
    preferredHeight: 294,
    preferredWidth: 320
  }];
}
