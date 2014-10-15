/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

var ICON_URL = 'https://news.ycombinator.com/favicon.ico';
var BASE_RELEVANCE = 0.4;

function makeResponseHandler(q, context) {
  'use strict';

  return function (responseText, response) {
    'use strict';

    console.log('Got response');

    if (response.statusCode !== 200) {
      console.error('Got bad status code ' + response.statusCode);
      return null;
    }

    var resultObject = JSON.parse(responseText);
    var hits = resultObject.hits;
    console.log('Got ' + hits.length + ' hits');
    
    if (hits.length === 0) {
      return []; 
    }

    var outputLinks = false;
    
    if (!context.isSuggestionQuery || (context.settings.outputLinks !== 'true')) {            
      var xml = <s><![CDATA[
<!doctype html>
<html>
  <title>Hacker News Search Results</title>      
  <body>    
    <h3>Hacker News search results for &quot;<%= q %>&quot;:</h3>
    <ul>

      <% _(hits).each(function (hit) {         
          if (hit.url) { %>          
            <li>
            <a href="<%= hit.url %>" target="_top"><%= hit.title || '(No title)' %></a>
            <% if (hit.story_text) { %>        
              : <%= _(hit.story_text).prune(100) %>
            <% } %>
            </li>
      <%  } }); %> 
    </ul>
    <p>
      <small>Search results provided by <a href="https://www.algolia.com/" target="_top">Algolia</a>.</small>    
    </p>
  </body>
</html>
]]></s>;
      
      var template = xml.toString();
      var model = { q: q, hits: hits };
      var content = ejs.render(template, model); 
      
      return [{
        label: 'Hacker News Search',
        uri: 'https://hn.algolia.com/#!/story/forever/0/' + encodeURIComponent(q),
        tooltip: 'Hacker News Search results for "' + _(q).escapeHTML() + '"',
        iconUrl: ICON_URL,
        relevance: BASE_RELEVANCE,
        content: content,
        serverSideSanitized: true,
        categories: [{value: 'programming', weight: 1.0}, {value: 'business', weight: 0.5}]
      }];
      
    } else {      
      return _(hits).chain().filter(function (hit) {
        return !!hit.url;
      }).map(function (hit) {
        console.log('got hit url = ' + hit.url);
        return {
          label : hit.title || '',
          iconUrl: ICON_URL,
          uri : hit.url,
          // embeddable: false, let solveforall guess
          summaryHtml: _(hit.story_text || '').escapeHTML(),
          relevance: BASE_RELEVANCE * (1.0 - Math.pow(2.0, -Math.max((hit.points || 0), 1) * 0.01))
        };
      }).value();
    }
  };
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
  
  request.send('makeResponseHandler(' + JSON.stringify(q) + 
    ',' + JSON.stringify(context) + ')');

  return HostAdapter.SUSPEND;
}
