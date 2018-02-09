function search() {
  pass = true;
  elementId = "element"
  if (pass) {
    for (var k = 0; k < 16; k++) {
      object = createObj(k);
      var div = document.getElementById("data-table");
      div.appendChild(object);
    }
  }
}

function createObj(id) {
  templateArr = [
    ["For teachers, IXL Analytics offers real-time...Lorem ipsum dolor sit scing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "analytics"],
    ["You will find these skills in your analytics...Lorem ipsum dolor sit onsectetur adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "skills"],
    ["To view this Analytics report, select the subject from...Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "analytics"],
    ["Please provide me with the skill you were...Lorem ipsum dolor sit ametetur adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "skills"],
    ["To sign in to your account, please...Lorem ipsum dolor sit amet, consdipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "signingIn"],
    ["Click on the Analytics tab at the top...Lorem ipsum dolor sit amet, c adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "analytics"],
    ["The SmartScore will adjust...Lorem ipsum dolor sit amet, consectetur ng elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "smartScore"],
    ["To sign in to your account...Lorem ipsum dolor sit amet, consectetur g elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "signingIn"],
    ["This subject will appear in your Analytics...Lorem ipsum dolor sit ametur adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "analytics"],
    ["The SmartScore will adjust...Lorem ipsum dolor sit amet, consectetur  elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "smartScore"],
    ["You will find these skills in your analytics...Lorem ipsum dolor sit ctetur adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "skills"],
    ["Click on the Analytics tab at the top...Lorem ipsum dolor sit amet, cipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "analytics"],
    ["To access the this report, please...Lorem ipsum dolor sit amet, consepiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "analytics"],
    ["To sign in to your account, please...Lorem ipsum dolor sit amet, conspiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "signingIn"],
    ["Please provide me with the skill you were...Lorem ipsum dolor sit ameur adipiscing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "skills"],
    ["Please go to ixl.com to sign in...Lorem ipsum dolor sit amet, consectcing elit. Ut arcu nisl, mollis eu efficitur ac, gravida vel lectus. Praesent feugiat aliquet velit, ", "signingIn"]
  ]
  var li = document.createElement("LI");
  var i = document.createElement("i");
  var p = document.createElement("p");
  var h3 = document.createElement("h3");
  var h5 = document.createElement("h5");
  var br = document.createElement("br");
  var tags = document.createElement("p");
  var nodeTitle = document.createTextNode("Template " + id + "." + Math.floor(Math.random() * 20) + '  ');
  var nodeLastUpdatedDate = document.createTextNode('Last updated Jan 31, 2018');
  var nodeTemplate = document.createTextNode(templateArr[id]);
  var nodeTags = document.createTextNode('Tags {password, reset, analytics, SmartScore} ');
  li.id = elementId;
  p.classList.add(templateArr[id][1]);
  h3.classList.add(templateArr[id][1]);
  i.classList.add("glyphicon");
  i.classList.add("glyphicon-copy");
  tags.classList.add('tags');
  h3.appendChild(nodeTitle);
  h5.appendChild(nodeLastUpdatedDate);
  tags.appendChild(nodeTags);
  li.appendChild(h3);
  li.appendChild(h5);
  li.appendChild(p);
  p.appendChild(br);
  p.appendChild(nodeTemplate);
  li.appendChild(tags);
  h3.appendChild(i);
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
