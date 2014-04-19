/*jslint continue: true, devel: true, evil: true, indent: 2, nomen: true, plusplus: true, regexp: true, rhino: true, sloppy: true, sub: true, unparam: true, vars: true, white: true */
/*global _, HostAdapter, hostAdapter */

function generateResults(recognitionResults, q, context) {
  'use strict';

  var words = _.words(q);
  var participants = null;
  var relevance = 0.0;
  var callType = null;
  var skypeAccountNameResult = recognitionResults['com.solveforall.recognition.messaging.SkypeAccountName'];

  if (skypeAccountNameResult) {
    participants = skypeAccountNameResult[0].accountName;

    relevance = 0.2;  
    if (participants.search(/[0-9_\-]/) >= 0) {
      relevance = 0.4; 
    }
  } else {
    var phoneNumbers = recognitionResults['com.solveforall.recognition.phone.UsPhoneNumber'];

    if (phoneNumbers) {
      var phoneNumber = phoneNumbers[0].fullNumber;
      participants = '+1' + phoneNumber;
      relevance = 1.0;
      callType = 'audio'; // Don't allow video or chat
    } else {
      var users = _(words).filter(function (w) {
        return w.match(/[\w\.\-_,]{6,32}/);
      });

      if (users.length === 0) {
        return null;
      }

      participants = users.join(';');

      relevance = 0.2;    
      if (participants.search(/[0-9_\-]/) >= 0) {
        relevance = 0.4; 
      }

      relevance = Math.max(relevance - 0.2 * (users.length - 1), 0.0);
    }
  }

  if (!callType) {
    var i = 0;
    for (i = 0; i < words.length; i++) {
      var w = words[i].toLowerCase();

      if (!callType && ((w === 'audio') || (w === 'video') || (w === 'chat'))) {
        callType = w;
        relevance = Math.min(relevance + 0.2, 1.0);        
      } else if (w === 'skype') {
        relevance = 1.0;
      } else if (w === 'call') {
        relevance = Math.min(relevance + 0.2, 1.0);
      }
    }

    if (!callType) {
      callType = 'audio';

      var settings = context.settings;
      if (settings) {
        callType = settings.callType || 'audio';
      }
    }
  }

  var extension = '?call';
  var summaryHtml = 'Audio call with ';

  if (callType === 'video') {
    extension += '&video=true';
    summaryHtml = 'Video call with ';
  } else if (callType === 'chat') {
    extension = '?chat';
    summaryHtml = 'Chat with ';
  }

  summaryHtml +=  '<strong>' + _(participants).escapeHTML() + '</strong>';

  return [{
    label: 'Skype',
    iconUrl: 'http://www.skype.com/favicon.ico',
    summaryHtml: summaryHtml,
    uri: 'skype:' + participants + extension,
    embeddable: false,
    relevance: relevance
  }];
}
