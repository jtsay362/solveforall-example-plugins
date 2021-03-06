/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

const IMAGE_URL_BASE = 'https://solveforall.com/libs/jquery-raty/img/';

function makeRatingHtml(rating) {
  const intRating = Math.floor(rating);
  const escapedRating = _.escape(rating);

  let s = '<span title="Rating: ' + escapedRating + '">';
  s += ' <span class="sr-only">' + escapedRating + '</span>';

  let i = 0;
  for (i = 0; i < intRating; i++) {
    s += '<img src="' + IMAGE_URL_BASE + 'star-on.png" width="16" height="16" alt="">';
  }

  const fractionRating = rating - intRating;
  if (fractionRating >= 0.5) {
    s += '<img src="' + IMAGE_URL_BASE + 'star-half.png" width="16" height="16" alt="">';
    i += 1;
  }

  for (; i < 5; i++) {
    s += '<img src="' + IMAGE_URL_BASE + 'star-off.png" width="16" height="16" alt="">';
  }

  return s;
}

function makeResponseHandler(key, bestResult) {
  return function(responseText, httpResponse) {
    console.log('got response text = "' + responseText + '"');

    const title = JSON.parse(responseText);

    const uri = 'http://www.allflicks.net/movies/' +
      encodeURIComponent(title.show_id) + '/';

    const contentTemplate = `
<html>
  <head>
    <style>
      h4 {
        margin-top: 0;
      }
      .header_line {
        margin-top: 8px;
      }
      dl {
        margin-bottom: 12px;
      }
      dt {
        margin-top: 8px;
      }
      img.poster {
        margin-right: 10px;
        margin-bottom: 10px; /* In case summary is wrapped to next line */
      }
      .watch_button {
        font-weight: bold;
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <% if (title.poster) { %>
    <div class="pull-left">
      <a href="<%= uri %>">
        <img class="poster with_fallback" data-img-src-0="<%= title.poster %>"
         width="250" alt="Movie Poster">
      </a>
    </div>
    <% } %>

    <div class="pull-left">
      <h4><%= title.show_title %></h4>
      <%- ratingHtml %> (<%= title.rating %> / 5.0)
      <div class="header_line">
        Released: <%= title.release_year %>
      </div>
      <% if (title.director) { %>
        <div class="header_line">
        Director:
        <a href="http://allflicks.net/director/?director=<%= encodeURIComponent(title.director) %>">
          <%= title.director %>
        </a>
        </div>
      <% } %>
      <% if (title.category) { %>
        <div class="header_line">
          Category:
          <a href="http://allflicks.net/?keyword=<%= encodeURIComponent(title.category) %>">
            <%= title.category %>
          </a>
        </div>
      <% } %>
      <% if (title.runtime && (title.runtime !== 'N/A')) { %>
        <div class="header_line">
          <%= title.runtime %>
        </div>
      <% } %>
      </div>
    </div>

    <div class="clear"></div>

    <div>
      <dl>
        <% if (title.show_cast && (title.show_cast.length > 0)) { %>
        <dt>
          Cast
        </dt>
        <dd>
          <%- title.show_cast.split(/\\s*,\\s*/).map(function (name) {
            return '<a href="http://allflicks.net/actor/?actor=' +
              encodeURIComponent(name) + '">' + _(name).escapeHTML() + '</a>';
          }).join(', ') %>
        </dd>
        <% } %>
        <dt>
          Summary
        </dt>
        <dd>
          <%= title.summary %>
        </dd>
      </dl>
    </div>

    <div>
      <a class="btn btn-danger watch_button"
       href="http://www.netflix.com/WiPlayer?movieid=<%= encodeURIComponent(title.show_id) %>">
        <i class="fa fa-play"></i> Watch on Netflix
      </a>
    </div>

    <p>
      <small>
        API access from <a href="http://netflixroulette.net/">Flix Roulette</a>,
        using data from <a href="http://www.netflix.com">Netflix</a>.
      </small>
    </p>
  </body>
</html>`;

    const ejs = require('ejs');

    const model = {
      _,
      title,
      uri,
      ratingHtml: makeRatingHtml(title.rating)
    };

    return [{
      label: title.show_title,
      content: ejs.render(contentTemplate, model),
      contentType: 'text/html',
      serverSideSanitized: true,
      uri,
      iconUrl: 'http://www.allflicks.net/favicon.png',
      summaryHtml: _.escape(title.summary),
      relevance: bestResult.recognitionLevel + 0.01
    }];
  };
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  if (context.isSuggestionQuery) {
    return [];
  }

  const articles = recognitionResults['com.solveforall.recognition.WikipediaArticle'];

  if (!articles || (articles.length === 0)) {
    console.info('No Wikipedia article references found');
    return [];
  }

  let bestResult = null;
  let bestKey = null;
  let bestName = null;

  _(['org.dbpedia.ontology.Film', 'org.dbpedia.ontology.TelevisionShow']).each(function (key) {
    var rrs = recognitionResults[key];

    _(rrs || []).each(function (rr) {
      if (!bestResult || (rr.recognitionLevel > bestResult.recognitionLevel)) {
        var article = _(articles).find(function (a) {
            return (a.article === rr.wikipediaArticleName);
        });

        if (article) {
          bestName = article.title;
          bestKey = key;
          bestResult = rr;
        }
      }
    });
  });

  if (!bestResult) {
    console.info('No title found');
    return [];
  }

  const url = 'http://netflixroulette.net/api/api.php?title=' +
    encodeURIComponent(bestName);

  const request = hostAdapter.makeWebRequest(url, {
    accept: 'application/json'
  });

  request.send('makeResponseHandler(' + JSON.stringify(bestKey) + ',' +
               JSON.stringify(bestResult) + ')');

  return HostAdapter.SUSPEND;
}
