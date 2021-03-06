var searchLogArr = new Array();
let noResults = document.getElementById('noResults');
let ul = document.getElementById('data-table');
let li = ul.getElementsByClassName('template');

function search() {
  let input = document.getElementById('searchBar');
  // If the user has entered one character, do not search.
  if (input.value.length != 0) {
    let filterArr = input.value.toUpperCase().split(' ').clean('');
    if (filterArr == '') {
      for (var i = 0; i < 25; i++) {
        let item = li[i];
        item.style.display = '';
      }
      document.getElementById('templateCount').innerHTML = li.length;
    } else {
      for (k = 0; k < li.length; k++) {

        // Loop through each list item
        let item = li[k];

        // convert item to text and replace date with blank space
        content = item.textContent.replace(/[A-Z]*[a-z][a-z]\s\d*,\s\d{4}/, '');

        // If item content matches filter, display item
        if (item.style.display == 'none' && test(filterArr, content)) {
          item.style.display = '';

          // If item is not equal to 'none' and content matches filter, show item
        } else if (test(filterArr, content)) {
          item.style.display = '';

          // If item content doesn't match filter, hide item
        } else {
          item.style.display = 'none';
        }
      }

      document.getElementById('templateCount').innerHTML = $('#data-table').children(':visible').length;
      if (($('#data-table').children(':visible').length) == 0) {
        let searchContents = document.getElementById('searchBar').value;
        noResults.style.display = 'block';
      } else {
        noResults.style.display = 'none';
      }
    }
  } else {
    reset();
    let filterArr = input.value.toUpperCase().split(' ').clean('');
    if (filterArr == '') {
      for (var i = 0; i < 24; i++) {
        let item = li[i];
        if (typeof item != "undefined") {
          item.style.display = '';
        }
      }
    }
  }
}

function test(filterArr, content) {
  var searchString = filterArr.join(" ");

  // For string which has quotes surrounding it
  if (searchString[0] == "\"" && searchString[searchString.length - 1] == "\"") {
    searchString = searchString.replace(/\"/g, "");
    for (let m = 0; m < filterArr.length; m++) {
      // If at any point item content doesn't match the filter, return false
      if (content.toUpperCase().match(searchString.toUpperCase()) == null) {
        return false;
      }
    }
    // If item content does match filter, return true
    return true;
  }

  // For string which has no quotes surrounding it
  for (let m = 0; m < filterArr.length; m++) {
    // If at any point item content doesn't match the filter, return false
    if (content.toUpperCase().indexOf(filterArr[m]) == -1) {
      return false;
    }
  }
  // If item content does match filter, return true
  return true;
}

function reset() {
  let ul = document.getElementById('data-table');
  let li = ul.getElementsByClassName('template');
  for (k = 0; k < 25; k++) {
    let item = li[k];
    if (typeof item != "undefined") {
      item.style.display = '';
    }
  }
  document.getElementById('templateCount').innerHTML = li.length;
}

Array.prototype.clean = function(value) {
  // Remove trailing and ending white space
  for (let i = 0; i < this.length; i++) {
    if (this[i] == value) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

/**
 * Searches only when user has finished typing (when 200ms has passed without key activity)
 * @type {Number}
 */
var typingTimer; //timer identifier
var doneTypingInterval = 200; //time in ms
var $input = $('#searchBar');

//on keyup, start the countdown
$input.on('keyup', function() {
  clearTimeout(typingTimer);
  typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

//on keydown, clear the countdown
$input.on('keydown', function() {
  clearTimeout(typingTimer);
});

//user is finished typing, search
function doneTyping() {
  search();
}