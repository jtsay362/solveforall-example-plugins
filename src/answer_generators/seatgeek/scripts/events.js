const API_BASE_URL = 'https://api.seatgeek.com/2/';
const SEATGEEK_CLIENT_ID = 'NjUwMjE1M3wxNDgyNzA5MDQz';

const PROVIDER_TO_ICON_URL = {
  lastfm : 'http://static-web.last.fm/static/images/favicon.702b239b6194.ico',
  spotify: 'https://d2c87l0yth4zbw.global.ssl.fastly.net/i/_global/favicon.ico',
  musicbrainz: 'https://musicbrainz.org/favicon.ico',
};

const PERFORMER_TEMPLATE = `
  <% if (performer.image) { %>
    <a href="<%= performer.url %>" target="_top">
      <img id="performer_image" height="150" src="<%= performer.image %>"
       class="img-rounded">
    </a>
  <% } %>
  <div>
    <h3 id="performer_name">
      <%= performer.name %>
    </h3>
    <div id="performer_links">
      <a href="<%= performer.url %>" title="View tickets for <%= performer.name %> on SeatGeek"
       target="_top">
        <img src="https://seatgeek.com/favicon.ico" width="32" height="32"
         alt="SeatGeek">
      </a>

      <% _(performer.links || []).each(function (link) {
          var url = link.url;
          if (link.provider === 'musicbrainz') {
            url = 'https://musicbrainz.org/artist/' + encodeURIComponent(link.id);
          } %>
          <a href="<%= url %>" target="_top">
            <% var iconUrl = PROVIDER_TO_ICON_URL[link.provider];
               if (iconUrl) { %>
                 <img src="<%= iconUrl %>" alt="<%= link.provider %>" width="32" height="32">
            <% } else { %>
                 <%= link.provider %>
            <% } %>
          </a>
      <% }); %>
    </div>
  </div>
`;

const EVENTS_TEMPLATE = `
  <div id="num_events_found">
    <%= meta.total %> event<%= (meta.total === 1) ? '' : 's' %> found:
  </div>
  <table class="table table-striped table-condensed">
    <thead></thead>
    <tbody>
    <% _(events).each(function (event) { %>
      <tr class="event_container">
        <td>
          <% if (event.datetime_utc) {
               var m = moment.utc(event.datetime_utc);
               m.local();
          %>
            <div>
              <%= m.format('ddd, MMM D, YYYY') %>
            </div>
            <div>
              <%= moment(event.datetime_local).format('h:mm a') %>
            </div>
          <% } %>
        </td>
        <td>
          <div class="event_title">
            <a href="<%= event.url %>" target="_top"><%= event.title %></a>
          </div>
          <% if (event.venue) { v = event.venue; %>
            <div>
              <%= v.display_location %>
              <% if (v.name) { %>
                (<%= v.name %>)
              <% } %>
            </div>
          <% } %>
        </td>
      </tr>
  <% }); %>
    </tbody>
  </table>
  <% var remainingEvents = meta.total - events.length;
     if (remainingEvents > 0) { %>
       <p>
        See <%= remainingEvents %> more event<%= (remainingEvents === 1) ? '' : 's' %>
        at <a href="<%= performer.url %>" title="More events" target="_top">SeatGeek</a>
      </p>
  <% } %>
`;

function showPerformer(performer) {
  const contents = ejs_no_node.render(PERFORMER_TEMPLATE, {
    performer
  });

  $('#performer_info').html(contents);
}

function showEvents(performer, data) {
  const contents = ejs_no_node.render(EVENTS_TEMPLATE, _.extend({
    performer
  }, data));

  console.log('contents = ' + contents);

  $('#events').html(contents);
}

function addAuthToUrl(originalUrl) {
  let url = originalUrl;
  if (url.indexOf('?') >= 0) {
    url += '&';
  } else {
    url += '?';
  }

  url += 'client_id=';
  url += encodeURIComponent(SEATGEEK_CLIENT_ID);
  return url;
}

function fetchEventsForPerformer(performer) {
  const eventEndpointUrl = addAuthToUrl(API_BASE_URL + 'events?performers.id=' +
    encodeURIComponent(performer.id));

  $.ajax({
    url: eventEndpointUrl,
    crossDomain: true,
    success: function (data) {
      //$('#debug').text('yo5' + JSON.stringify(data));
      showEvents(performer, data);
    }
  });
}

$(function() {
  const performerName = $('#data_to_transfer').attr('data-performer');
  const performerUrl = addAuthToUrl(API_BASE_URL + 'performers?q=' +
    encodeURIComponent(performerName));

  $.ajax({
    url: performerUrl,
    crossDomain: true,
    success: function (data) {
      //$('#debug').text('yo4' + JSON.stringify(data));

      const performers = data.performers;

      if (performers.length === 0) {
        $('#performer_info').text('No performers found on SeatGeek.');
      } else {
        const performer = performers[0];
        showPerformer(performer);

        if (performer.has_upcoming_events) {
          fetchEventsForPerformer(performer);
        } else {
          $('#events').text('No upcoming events found.');
        }
      }
    }
  });
});
