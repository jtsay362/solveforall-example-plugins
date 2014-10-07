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
      callType = context.settings.callType || 'audio';
    }
  }

  var extension = '?call';
  var tooltip = 'Audio call with ';

  if (callType === 'video') {
    extension += '&video=true';
    tooltip = 'Video call with ';
  } else if (callType === 'chat') {
    extension = '?chat';
    tooltip = 'Chat with ';
  }

  var userArray = participants.split(';');  
  if (userArray.length == 1) {
    tooltip += participants;    
  } else if (userArray.length == 2) {
    tooltip += userArray.join(' and ');    
  } else {
    var s = userArray.join(', ');
    var lastCommaIndex = s.lastIndexOf(',');
    tooltip = s.substr(0, lastCommaIndex) + ', and ' + s.substr(lastCommaIndex + 2);    
  }
      
  return [{
    label: 'Skype',
    iconUrl: 'https://www.skype.com/favicon.ico',
    tooltip: tooltip,
    uri: 'skype:' + participants + extension,
    embeddable: false,
    relevance: relevance
  }];
}
