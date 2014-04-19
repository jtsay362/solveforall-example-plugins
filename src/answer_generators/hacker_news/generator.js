/*jslint continue: true, devel: true, evil: true, indent: 2, plusplus: true, rhino: true, unparam: true, vars: true, white: true */
function handleResponse(responseText, response) {
  'use strict';
  
  console.log('Got response');
  
  if (response.statusCode !== 200) {
    console.error('Got bad status code ' + response.statusCode);
    return null;
  }

  var resultObject = JSON.parse(responseText);

  console.log('Got ' + resultObject.hits.length + ' hits');
  
  return _(resultObject.hits).map(function (hit) {
    return {
      label : hit.title || '',
      iconUrl: 'https://news.ycombinator.com/favicon.ico',
      uri : hit.url,
      embeddable: false,
      summaryHtml: _(hit.story_text || '').escapeHTML(),
      relevance: 0.4 * (1.0 - Math.pow(2.0, -Math.max((hit.points || 0), 1) * 0.01))
    };
  });
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (context.isSuggestionQuery) {
    return [];
  }
  
  var url = 'https://hn.algolia.com/api/v1/search';

  var request = hostAdapter.makeWebRequest(url, {
    data: {
      query: q
    }
  });
  
  request.send('handleResponse');

  return HostAdapter.SUSPEND;
}
