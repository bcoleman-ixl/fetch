function search() {
  pass = true;
  elementId = "element"
}

function filter() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("search-bar");
  filter = input.value.toUpperCase().split(' ');
  ul = document.getElementById("data-table");
  li = ul.getElementsByTagName("li");
  for (k = 0; k < li.length; k++) {
    content = li[k].textContent;
    console.log(content);
    for (var m = 0; m < filter.length; m++) {
      if (content.toUpperCase().indexOf(filter[m]) > -1) {
        li[k].style.display = "";
      } else {
        li[k].style.display = "none";
      }
    }
    //for(var i = 0; i < elements.length; i++) {
    //     var current = elements[i];
    //     if(current.children.length === 0 && current.textContent.replace(/ |\n/g,'') !== '') {
    // Check the element has no children && that it is not empty
    //         array.push(current.textContent);
    //      }
    //  }
  }
}

filter();
