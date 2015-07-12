function defaultOnImageFallbacksExhausted(element)  {
  if (element.attr('data-img-remove-on-error') !== 'false') {
    s4aDebug('Removing image after fallbacks exhausted');
    element.remove();
  } else if (element.attr('data-img-restore-src') !== 'false') {
    s4aDebug('Restoring original src after fallbacks exhausted');
    element.prop('src', element.attr('data-img-src-0'));
  }
}

function makeDefaultTempFallbackImageSrc() {
  return document.location.origin + '/favicon.ico';
}

function loadFallbackImages(opts) {
  opts = opts || {};

  var onFallbacksExhausted = opts.onFallbacksExhausted ||
    defaultOnImageFallbacksExhausted;

  function maybeStartNextImageLoad(i, element) {
    var fallbackMethod = element.attr('data-img-fallback-method');

    var currentSrc = element.prop('src');

    if ((fallbackMethod === 'ajax') && currentSrc) {
      s4aDebug('Image already has source, exiting');
      return false;
    }

    var url = element.attr('data-img-src-' + i);

    if (url) {
      var statusAttribute = 'data-img-src-' + i + '-status';
      var status = element.attr(statusAttribute);

      if (!status) {
        // s4aDebug('Starting image check ...');
        element.attr(statusAttribute, 'loading');

        if (fallbackMethod === 'ajax') {
          $.ajax({
            url: url,
            type: 'HEAD',
            success: makeImageLoadResponse(i, element, 'success'),
            error: makeImageLoadResponse(i, element, 'error')
          });
        } else {
          element.off('error');
          element.error(makeImageLoadResponse(i, element, 'error'));

          //s4aDebug('Setting new source to ' + url);
          element.prop('src', url);
        }
        return true;
      } else {
        s4aDebug('Status is ' + status + ', not loading');
        return false;
      }
    } else {
      s4aDebug('All fallback urls exhausted');
      onFallbacksExhausted(element);
      return false;
    }
  }

  function makeImageLoadResponse(i, element, status) {
    var originalUrl = element.attr('data-img-src-' + i);

    return function () {
      var url = element.attr('data-img-src-' + i);

      if (originalUrl === url) {
        s4aDebug('Image check for ' + url + ' has status ' + status);
        element.attr('data-img-src-' + i + '-status', status);

        if (status === 'success') {
          s4aDebug('Image loaded successfully: ' + url);
          element.prop('src', url);
        } else {
          s4aDebug('Image load failed, loading next image');

          // Fix containing link URLs
          var linkParent = element.closest('a');
          if (linkParent && (linkParent.attr('href') === url)) {
            linkParent.attr('href', element.attr('data-img-src-' + (i + 1)) || '#');
          }

          if (element.attr('data-img-fallback-method') !== 'ajax') {
            element.off('error');
          }

          maybeStartNextImageLoad(i + 1, element);
        }
      } else {
        s4aDebug('Image URL changed, someone is messing with us.');
      }
    };
  }

  s4aDebug('Loading fallback images ...');

  var anyPending = false;
  var selector = opts.selector || $('img.with_fallback');
  var tempSrcUrl = opts.tempSrcUrl || makeDefaultTempFallbackImageSrc();

  selector.each(function () {
    var e = $(this);

    var src = e.prop('src');
    if (!src || (src === tempSrcUrl)) {
      if (maybeStartNextImageLoad(0, e)) {
        anyPending = true;
      }
    }
  });

  s4aDebug('Done initiating fallback images, anyPending = ' + anyPending);

  return anyPending;
}

function resetFallbackImages(opts) {
  opts = opts || {};
  var selector = opts.selector || $('img.with_fallback');
  var tempSrcUrl = opts.tempSrcUrl || makeDefaultTempFallbackImageSrc();

  selector.each(function () {
    var i = 0;
    var done = false;
    var element = $(this);
    element.prop('src', tempSrcUrl);

    do {
      var srcAttribute = ('data-img-src-' + i);
      var url = element.attr(srcAttribute);

      if (url) {
        element.removeAttr('data-img-src-' + i + '-status');

        if (opts.clearSources) {
          element.removeAttr(srcAttribute);
        }
      } else {
        done = true;
      }
      i++;
    } while (!done);
  });
}
