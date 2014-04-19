/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function pad(num, length, def) {
  'use strict';  
  return _('' + (num || def)).pad(length, '0');
}

function generateResults(recognitionResults, q, context) {
  'use strict';

  var recognitionResult = recognitionResults['com.solveforall.recognition.date.DateRange'];

  if (!recognitionResult || (recognitionResult.length === 0)) {
    console.warn("No recognition result found");
    return [];
  }

  var dateRange = recognitionResult[0];
  var start = dateRange.start;

  if (!start) {
    console.warn("No start date found");
    return [];
  }

  var now = new Date();
  var paddedMonth = pad(start.month, 2, now.getMonth() + 1);
  var paddedDay = pad(start.dayOfMonth, 2, now.getDate());
  var year = '' + (start.year || now.getFullYear());

  return [{
    label: 'Calendar',
    iconUrl: 'http://calendar.google.com/googlecalendar/images/favicon_v2010_8.ico',
    summaryHtml: 'Google Calendar',
    uri: 'https://www.google.com/calendar/render?tab=mc&date=' + year +
      paddedMonth + paddedDay,
    embeddable: false,
    relevance: dateRange.recognitionLevel
  }];
}