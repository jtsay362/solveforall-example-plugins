function handleResponse(response) {
  'use strict';

  if (response.statusCode !== 200) {
    return null;
  }

  var resultObject = JSON.parse(response.body);

  return _(resultObject.hits).map(function (hit) {
    return {
      label : hit.title,
      uri : hit.url,
      embeddable: false,
      summaryHtml: _(story_text).escapeHTML(),
      relevance: 0.4 * (hit.points || 0) * 0.01
    };
  });
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  var url = 'https://hn.algolia.com/api/v1/search';

  var request = HostAdapter.makeWebRequest(url, {
    data: {
      query: q
    }
  });
  
  request.execute('handleResponse');

  return HostAdapter.SUSPEND;
}
