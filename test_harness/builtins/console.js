var Console = function() {};

// http://getfirebug.com/wiki/index.php/Console_API
Console.prototype = {
  log: function(msg) {
    print(msg || null);
  },

  trace: function(msg) {
    print('TRACE: ' + (msg || 'Unknown'));
  },

  debug: function(msg) {
    print('DEBUG: ' + (msg || 'Unknown'));
  },

  info: function(msg) {
    print('INFO: ' + (msg || 'Unknown'));
  },

  warn: function(msg) {
    print('WARN: ' + (msg || 'Unknown'));
  },

  error: function(msg) {
    print('ERROR: ' + (msg || 'Unknown'));
  },

  assert: function(expr, msg) {
    if (!expr) {
      error('Assertion failed: ' + msg);
    }
  },

  clear: function() {    
  },

  dir: function(obj) {
    this.log(JSON.stringify(obj || null));
  },

  dirxml: function(node) {
    this.warn('Console.dirxml() not supported');
  },

  group: function(obj) {
    this.warn('Console.group() not supported');
  },

  groupCollapsed: function(obj) {
    this.warn('Console.groupCollapsed() not supported');
  },

  groupEnd: function(obj) {
    this.warn('Console.groupEnd() not supported');
  },

  time: function(name) {
    this.warn('Console.time() not supported');
  },

  timeStamp: function(name) {
    this.warn('Console.timeStamp() not supported');
  },

  profile: function(title) {
    this.warn('Console.profile() not supported');
  },

  profileEnd: function() {
    this.warn('Console.profileEnd() not supported');
  },

  exception: function(errorObject) {
    this.warn('Console.exception() not supported');
  },

  table: function(errorObject) {
    this.warn('Console.table() not supported');
  }
};

/* var */console = new Console();
