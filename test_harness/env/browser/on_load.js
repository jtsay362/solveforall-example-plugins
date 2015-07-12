jQuery(function () {
  loadFallbackImages();

  $('.content_expander').click(function () {
    handleContentExpansion($(this));
  });
  
  twttr.widgets.load();
});
