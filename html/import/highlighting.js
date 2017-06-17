
(function() { // bubbling to reduce visibility of variables

  var marker = new Mark(document.querySelector('main'));
  var keywordInput = document.querySelector('#keyword-controls input');
  var clearKeywordButon = document.querySelector('#keyword-controls button');
  var timeoutID;

  function asyncMark() {
    if (typeof timeoutID === 'number') {
      window.clearTimeout(timeoutID);
      timeoutID = undefined;
    }
    timeoutID = window.setTimeout(function() {
      marker.unmark({
        done: function(){
          marker.mark(keywordInput.value, { separateWordSearch: true });
        }
      });
      timeoutID = undefined;
    }, 200);
  };

  function mainContentChanged() {
    // mark tags and angular processing doesn't fit well together, so we remove mark tags first
    marker.unmark();
    asyncMark();
  }

  // listeners
  keywordInput.addEventListener('input', asyncMark);
  clearKeywordButon.addEventListener('click', asyncMark);
  document.addEventListener('main-content-changed', mainContentChanged);

})();
