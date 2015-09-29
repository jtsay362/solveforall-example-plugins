/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */
const moment = require('moment');
const ICON_URL = 'https://news.ycombinator.com/favicon.ico';
const BASE_RELEVANCE = 0.4;

function makeLinkAnswer(q, settings, tags) {
  const sortBy = settings.sortBy || 'Popularity';
  const dateRange = settings.dateRange || 'all';
  const typ = (tags === 'comment') ? 'comment' : 'story';

  return {
    label: 'Hacker News Search',
    uri: 'https://hn.algolia.com/?query=' + encodeURIComponent(q) +
      '&sort=by' + encodeURIComponent(sortBy) + '&prefix&page=0&dateRange=' +
      encodeURIComponent(dateRange) + '&type=' + encodeURIComponent(typ),
    tooltip: 'Hacker News Search results for "' + _(q).escape() + '"',
    iconUrl: ICON_URL,
    relevance: BASE_RELEVANCE,
    serverSideSanitized: true,
    categories: [{value: 'programming', weight: 1.0}, {value: 'business', weight: 0.5}]
  };
}

function hnUrlForHit(hit) {
  return 'https://news.ycombinator.com/item?id=' + encodeURIComponent(hit.objectID);
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

function makeSummaryHtml(hit, inside) {
  let html = '<small>' + _.pluralize('pt', hit.points, true) + '</small>';

  if (hit.url) {
    html += ' | <a href="' + _.escape(hnUrlForHit(hit)) + '" target="_top" rel="noreferrer"><small>' +
      _.pluralize('comment', hit.num_comments, true) + '</small></a>';
  }

  if (hit.created_at_i) {
    html += ' | <small>' + moment.unix(hit.created_at_i).fromNow() + '</small>';
  }

  if (hit.comment_text) {
    let comment = hit.comment_text;

    if (inside) {
      comment = comment.replace(/<[^>]+>/, '').replace('<', '');
    }

    comment = _.prune(comment, 300);


    // comment_text is already HTML, let server-side sanitization take care of it
    html += ' | <small>' + _.escape(hit.author) + '</small><br/>' + comment;
  }

  return html;
}

function makeResponseHandler(q, context, tags) {
  const settings = context.settings;
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

    if (hits.length === 0) {
      return [];
    }

    if (collectLinks) {
      const template = `
<!doctype html>
<html>
  <title>Hacker News Search Results</title>
  <body>
    <h3>Hacker News <%= _.pluralize(_.str.capitalize(tags)) %> for &quot;<%= q %>&quot;:</h3>
    <ul>
      <% _(hits).each(function (hit) {
        const url = hit.url || hnUrlForHit(hit);
        %>
        <li>
          <a href="<%= url %>" target="_top">
            <%= hit.title || hit.story_title || '(Untitled)' %>
          </a>
          <% if (hit.story_text) { %>
            : <%= _(hit.story_text).prune(100) %>
          <% } %>
          <% if (hit.url) { %>
            &nbsp;<small>(<%= hostForUrl(hit.url) %>)</small>
          <% } %>
          &nbsp;
          <%- makeSummaryHtml(hit, true) %>
        </li>
      <% }); %>
    </ul>
    <p>
      <small>Search results provided by <a href="https://www.algolia.com/" target="_top">Algolia</a>.</small>
    </p>
  </body>
</html>`;

      const model = {
        _,
        q,
        hits,
        hostForUrl,
        makeSummaryHtml,
        hnUrlForHit,
        tags
      };
      const ejs = require('ejs');
      const content = ejs.render(template, model);
      const answer = makeLinkAnswer(q, settings, tags);
      answer.content = content;
      return [answer];
    } else {
      return _(hits).map(function (hit) {
        console.log('got hit url = ' + hit.url);

        let summaryHtml = makeSummaryHtml(hit, false);

        if (hit.story_text) {
          summaryHtml = _.escape(hit.story_text) + '<br/>' + summaryHtml;
        }

        return {
          label : hit.title || hit.story_title || '',
          iconUrl: ICON_URL,
          uri : hit.url || hnUrlForHit(hit),
          // embeddable: false, let solveforall guess
          summaryHtml,
          relevance: BASE_RELEVANCE * (1.0 - Math.pow(2.0, -Math.max((hit.points || 0), 1) * 0.01))
        };
      });
    }
  };
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (!q) {
    return [];
  }

  const settings = context.settings;

  const prefixMatches = /^(?:(?:hn|hacker\s*news)\s+)*(?:(?:(stor(?:y|ies)|comments?|polls?|show|ask)\s+)?(?:(?:for|about|on|of)\s+))/i.exec(q);
  let tags = settings.tags || 'story';

  if (prefixMatches) {
    q = q.substr(prefixMatches[0].length);

    tags = prefixMatches[1].toLowerCase();
    if (tags === 'stories') {
      tags = 'story';
    } else if (_.endsWith(tags, 's')) {
      tags = tags.substr(0, tags.length - 1);
    }
  }

  if (context.isSuggestionQuery) {
    return [makeLinkAnswer(q, settings, tags)];
  }

  let url = 'https://hn.algolia.com/api/v1/search';

  const sortBy = settings.sortBy || 'Popularity';

  if (sortBy === 'Date') {
    url += '_by_date';
  }

  const data = {
    query: q,
    tags: tags
  };

  const dateRange = settings.dateRange || 'all';
  console.log('dateRange = ' + dateRange);

  let maxAgeInSeconds;
  switch (dateRange) {
    case 'last24h':
    maxAgeInSeconds = 24 * 3600;
    break;

    case  'pastWeek':
    maxAgeInSeconds = 7 * 24 * 3600;
    break;

    case 'pastMonth':
    maxAgeInSeconds = 31 * 24 * 3600;
    break;
  }

  if (maxAgeInSeconds) {
    data.numericFilters = 'created_at_i>' +
      Math.round(new Date().getTime() * 0.001 - maxAgeInSeconds);
  }

  const request = hostAdapter.makeWebRequest(url, {
    data: data
  });

  request.send('makeResponseHandler(' + JSON.stringify(q) +
    ',' + JSON.stringify(context) + ',' + JSON.stringify(tags) + ')');

  return HostAdapter.SUSPEND;
}
