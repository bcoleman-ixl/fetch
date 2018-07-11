var searchLogArr = new Array();

function search() {
  let input = document.getElementById('search-bar');
  let filterArr = input.value.toUpperCase().split(' ').clean('');
  let ul = document.getElementById('data-table');
  let li = ul.getElementsByClassName('template');
  if (filterArr == '') {
    console.log(filterArr);
    for (var i = 0; i < li.length; i++) {
      let item = li[i];
      item.style.display = '';
    }
  }
  for (k = 0; k < li.length; k++) {
    // Loop through each list item
    let item = li[k];
    // convert item to text and replace date with blank space
    content = item.textContent.replace(/[A-Z]*[a-z][a-z]\s\d*,\s\d{4}/, '');

    // If search bar is blank, display this element
    if (filterArr.length == 0) {
      item.style.display = '';
      // If item is hidden, test to see if its content matches filter
    } else if (item.style.display == 'none') {
      if (test(filterArr, item)) {
        // If item content matches filter, display item
        item.style.display = '';
      }
      // If item is displayed to user, check to see if its content matches filter
    } else {
      if (test(filterArr, item)) {
        // If item content matches filter, show item
        item.style.display = '';
      } else {
        // If item content doesn't match filter, hide item
        item.style.display = 'none';
      }
    }
  }
  document.getElementById('templateCount').innerHTML = $('#data-table').children(':visible').length;

  if ($('#data-table').children(':visible').length == 0) {
    let searchContents = document.getElementById('search-bar').value;

    if ($.inArray(searchContents, searchLogArr) < 0) {
      searchLogArr.push(searchContents);
      console.log(searchLogArr);
      $('#test').show();
    } else {

    }
  } else if ($('#data-table').children(':visible').length != 0 && searchLogArr.length > 0) {
    updateLogs(searchLogArr[searchLogArr.length - 1]);
    console.log('sending: ' + searchLogArr[searchLogArr.length - 1]);
    searchLogArr = [];
  }
}

function test(filterArr, item) {
  for (let m = 0; m < filterArr.length; m++) {
    // If at any point item content doesn't match the filter, return false
    if (content.toUpperCase().indexOf(filterArr[m]) == -1) {
      return false;
    }
  }
  // If item content does match filter, return true
  return true;
}

function showAll(){
  let ul = document.getElementById('data-table');
  let li = ul.getElementsByClassName('template');
  for (k = 0; k < li.length; k++) {
    let item = li[k];
      item.style.display = '';
      console.log('showAll');
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
