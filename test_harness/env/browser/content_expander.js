function handleContentExpansion(element) {
  var parent = element;
  var done = false;
  do {
    if (parent.length > 0) {
      var expandable = parent.next('.content_expandable');

      if (expandable.length > 0) {
        expandable.slideToggle();
        var label = null;

        var labelContainer = element.find('.content_expander_label');

        if (labelContainer.length > 0) {
          label = labelContainer.text();
        }

        var down = element.find('.fa-chevron-down');

        if (down.length > 0) {
          down.addClass('fa-chevron-up').removeClass('fa-chevron-down').prop('title', 'Hide details');

          if (label) {
            label = labelContainer.attr('data-less-label') || label.replace(/more/, 'less').replace(/More/, 'Less');
          }
        } else {
          var up = element.find('.fa-chevron-up');
          up.addClass('fa-chevron-down').removeClass('fa-chevron-up').prop('title', 'More details');

          if (label) {
            label = labelContainer.attr('data-more-label') || label.replace(/less/, 'more').replace(/Less/, 'More');
          }
        }

        if (label) {
          labelContainer.text(label);
        }

        done = true;
      }
      parent = parent.parent().not('._s4a_answer').not('#warning_container');
    } else {
      done = true;
    }
  } while (!done);
}
