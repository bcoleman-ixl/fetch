function search() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("search-bar");
  filterArr = input.value.toUpperCase().split(' ').clean('');
  ul = document.getElementById("data-table");
  li = ul.getElementsByTagName("li");
  // TODO: Remove Category and Type names from search
  // Loop through each list element
  for (k = 0; k < li.length; k++) {
    var listElement = li[k];
    content = listElement.textContent; // convert element to text
    // if search bar is blank, display all
    if (filterArr.length == 0) {
      listElement.style.display = '';

    } else if (listElement.style.display == 'none') {
      if (test(filterArr, listElement)) {
        listElement.style.display = '';
      }

    } else {
      if (test(filterArr, listElement)) {
        listElement.style.display = '';
      } else {
        listElement.style.display = 'none';
      }
    }
  }
}

function test(filterArr, listElement) {
  for (var m = 0; m < filterArr.length; m++) {
    // If content of element doesn't match
    if (content.toUpperCase().indexOf(filterArr[m]) == -1) {
      return false;
    }
  }
  return true;
}

Array.prototype.clean = function(value) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == value) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

search();
