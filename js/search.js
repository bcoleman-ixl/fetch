function search() {
  pass = true;
  elementId = "element"
  if (pass) {
    for (var k = 1; k < 19; k++) {
      object = createObj(k);
      var div = document.getElementById("data-table");
      div.appendChild(object);
    }
  }
}

function createObj(id) {
  templateArr = [
    ["For teachers, IXL Analytics offers real-time...", "analytics"],
    ["You will find these skills in your analytics...", "skills"],
    ["This subject will now appear in your Analytics...", "analytics"],
    ["Please provide me with the skill you were...", "skills"],
    ["To sign in to your account, please...", "signingIn"],
    ["Click on the Analytics tab at the top...", "analytics"],
    ["The SmartScore will adjust...", "smartScore"],
    ["To sign in to your account...","signingIn"],
    ["This subject will now appear in your Analytics...", "analytics"],
    ["The SmartScore will adjust...", "smartScore"],
    ["You will find these skills in your analytics...", "skills"],
    ["Click on the Analytics tab at the top...", "analytics"],
    ["To access the Trouble spots report, please...", "analytics"],
    ["To sign in to your account, please...", "signingIn"],
    ["Please provide me with the skill you were...", "skills"],
    ["Please go to ixl.com to sign in...","signingIn"]
  ]
  var li = document.createElement("LI");
  var a = document.createElement("p");
  var h3 = document.createElement("h3");
  var h5 = document.createElement("h5");
  var br = document.createElement("br");
  var nodeTitle = document.createTextNode("Template " + id + "." + Math.floor(Math.random() * 20));
  var nodeLastUpdatedDate = document.createTextNode('Last updated Jan 31, 2018');
  var nodeTemplate = document.createTextNode(templateArr[id - 1][0]);
  li.id = elementId;
  a.classList.add(templateArr[id -1][1]);
  h3.classList.add(templateArr[id -1][1]);
  h3.appendChild(nodeTitle)
  h5.appendChild(nodeLastUpdatedDate)
  li.appendChild(h3);
  li.appendChild(h5);
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
    a = li[i].getElementsByTagName("p")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

search();
