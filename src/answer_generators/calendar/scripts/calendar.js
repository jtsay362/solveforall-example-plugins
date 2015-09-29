/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, browser: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global $ */
$(document).ready(function($) {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var dataHolder = $('#data');
  var yearString = dataHolder.attr('data-year');
  var monthString = dataHolder.attr('data-month');
  var dayString = dataHolder.attr('data-day');
  var dateString = dayString + '/' + monthString + '/' + yearString;

  var events = [
    {
      date: dateString
    }
  ];

  $('#calendar').bic_calendar({
      date: dateString,
      startWeekDay: 1,
      events: events,
      dayNames: dayNames,
      monthNames: monthNames,
      showDays: true,
      displayMonthController: true,
      displayYearController: true
  });
});