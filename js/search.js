function search() {
  // On document load:
  // Loop through SQL database
  // Load all elements with data
  pass = true;
  elementId = "element"
  if (pass) {
    for (var k = 1; k < 9; k++) {
      object = createObj(k);
      var div = document.getElementById("data-table");
      div.appendChild(object);
    }
  }
}

function createObj(id) {
  templateArr = [
    ["The red fox jumped over the river.", "red"],
    ["The blue dog went under the river", "blue"],
    ["The red heron jumped over the moon.", "red"],
    ["The blue bear visited the moon.", "blue"],
    ["The red jaguar visited the river.", "red"],
    ["The black bee swam underneath the bridge.", "black"],
    ["The orange tiger swam underneath the moonlight", "orange"],
    ["The black flamingo jumped over the moon","black"]
  ]
  var li = document.createElement("LI");
  var a = document.createElement("a");
  var h3 = document.createElement("h3");
  var br = document.createElement("br");
  var nodeTitle = document.createTextNode("Template " + id + "." + id);
  var nodeTemplate = document.createTextNode(templateArr[id - 1][0]);
  li.id = elementId;
  a.classList.add(templateArr[id -1][1]);
  h3.appendChild(nodeTitle)
  li.appendChild(h3);
  li.appendChild(a);
  a.appendChild(br)
  a.appendChild(nodeTemplate)
  return li;
}

function filter() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("search-bar");
  filter = input.value.toUpperCase();
  ul = document.getElementById("data-table");
  li = ul.getElementsByTagName("li");
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

search();
