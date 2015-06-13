/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

const ICON_URL = 'https://news.ycombinator.com/favicon.ico';
const BASE_RELEVANCE = 0.4;

function makeLinkAnswer(q) {
  return {
    label: 'Hacker News Search',
    uri: 'https://hn.algolia.com/#!/story/forever/0/' + encodeURIComponent(q),
    tooltip: 'Hacker News Search results for "' + _(q).escape() + '"',
    iconUrl: ICON_URL,
    relevance: BASE_RELEVANCE,
    serverSideSanitized: true,
    categories: [{value: 'programming', weight: 1.0}, {value: 'business', weight: 0.5}]
  };
}

function hostForUrl(url) {
  const startIndex = url.indexOf('//') + 2;
  let endIndex = url.indexOf('/', startIndex);
  const endIndex2 = url.indexOf('?', startIndex);

  if (endIndex < 0) {
    endIndex = endIndex2;

    if (endIndex < 0) {
      return url.substring(startIndex);
    }
  }

  return url.substring(startIndex, endIndex);
}

function makeResponseHandler(q, context) {
  return function (responseText, response) {
    console.log('Got response');

    if (response.statusCode !== 200) {
      console.error('Got bad status code ' + response.statusCode);
      return null;
    }

    const resultObject = JSON.parse(responseText);
    let hits = resultObject.hits;
    console.log('Got ' + hits.length + ' hits');
    console.log('Collect links = ' + context.settings.collectLinks);

    const collectLinks = (context.settings.collectLinks !== false);

    hits = _(hits).filter(function (hit) {
      if (collectLinks) {
        return hit.url;
      } else {
        return hit.url || hit.story_text;
      }
    });

    if (hits.length === 0) {
      return [];
    }

    if (collectLinks) {
      let xml = <s><![CDATA[
<!doctype html>
<html>
  <title>Hacker News Search Results</title>
  <body>
    <h3>Hacker News search results for &quot;<%= q %>&quot;:</h3>
    <ul>
      <% _(hits).each(function (hit) { %>
        <li>
          <% if (hit.url) { %>
            <a href="<%= hit.url %>" target="_top">
          <% } %>
            <%= hit.title || '(Untitled)' %>
          <% if (hit.url) { %>
            </a>
          <% } %>
          <% if (hit.story_text) { %>
            : <%= _(hit.story_text).prune(100) %>
          <% } %>
          <% if (hit.url) { %>
            &nbsp;<small>(<%= hostForUrl(hit.url) %>)</small>
          <% } %>
        </li>
      <% }); %>
    </ul>
    <p>
      <small>Search results provided by <a href="https://www.algolia.com/" target="_top">Algolia</a>.</small>
    </p>
  </body>
</html>
]]></s>;

      let template = xml.toString();
      let model = { q: q, hits: hits, hostForUrl: hostForUrl };
      let content = ejs.render(template, model);
      const answer = makeLinkAnswer(q);
      answer.content = content;
      return [answer];
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
          summaryHtml: _(hit.story_text || '').escape(),
          relevance: BASE_RELEVANCE * (1.0 - Math.pow(2.0, -Math.max((hit.points || 0), 1) * 0.01))
        };
      }).value();
    }
  };
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (!q) {
    return [];
  }

  if (context.isSuggestionQuery) {
    return [makeLinkAnswer(q)];
  }

  const url = 'https://hn.algolia.com/api/v1/search';

  const request = hostAdapter.makeWebRequest(url, {
    data: {
      query: q
    }
  });

  request.send('makeResponseHandler(' + JSON.stringify(q) +
    ',' + JSON.stringify(context) + ')');

  return HostAdapter.SUSPEND;
}
