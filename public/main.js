tinymce.init({
  selector: "#editor",
  plugins: "lists, advlist, textcolor, colorpicker",
  // TODO: Need to organize toolbar
  toolbar: [
    'undo redo | styleselect | bold italic | link image | alignleft | aligncenter | alignright | forecolor | backcolor'
  ]
});

var update = document.getElementById('update');
var findName = document.getElementById('findName').value;
var newName = document.getElementById('newName').value;

update.addEventListener('click', function() {
  fetch('update-template', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'findName': findName,
      'newName': newName
    })
  })
})


var dataTable = document.querySelector('#data-table');
dataTable.addEventListener('click', handle, false);
console.log(dataTable);

function handle(e) {
  if ((e.target !== e.currentTarget && e.target.id == 'copy') || (e.target.parentNode.id == 'copy')) {
    var id, li, template, html;
    id = e.target.parentNode.id;
    li = document.getElementById(id);
    template = li.querySelector('#template');
    // Removing all p tags is not a long term solution
    content = template.outerHTML.replace('<p>', '<br>').replace('</p>', '<br>');

    copy(buildTemplate(content));
    console.log('copied');
  } else if (e.target !== e.currentTarget && e.target.id == 'delete' || e.target.parentNode.id == 'delete') {

    var id = e.target.parentNode.id;
    deleteTemplate(id);
    console.log('deleted');
  } else {
    e.stopPropagation();
    console.log(e.target);
  }
}

function buildTemplate(content) {
  user = '<b>Bryce</b> </br>';
  email = 'E-mail: help@ixl.com<br>'
  program = 'IXL Support<br>'
  phone = 'Phone: 855.255.6676<br>'
  website = 'Website: www.ixl.com<br>';
  greeting = 'Dear NAME,<br><br>Thank you for reaching out to us.<br>';
  signature = 'Sincerely, <br>' + user + program + '<br>' + email + phone + website + '<img src=\'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000\' alt=\'ixl-logo\'>';
  return html = greeting + content + signature;
}


function deleteTemplate(id) {
  fetch('quotes', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'name': id
      })
    })
    .then(res => {
      if (res.ok) return res.json()
    }).
  then(data => {
    window.location.reload()
  })
}
// This function expects an HTML string and copies it as rich text.

function copy(html) {
  // Create container for the HTML
  var container = document.createElement('div')
  container.innerHTML = html

  // Hide element
  container.style.position = 'fixed'
  container.style.pointerEvents = 'none'
  container.style.opacity = 0

  // Detect all style sheets of the page
  var activeSheets = Array.prototype.slice.call(document.styleSheets)
    .filter(function(sheet) {
      return !sheet.disabled
    })

  // Mount the iframe to the DOM to make `contentWindow` available
  document.body.appendChild(container)

  // Copy to clipboard
  window.getSelection().removeAllRanges()

  var range = document.createRange()
  range.selectNode(container)
  window.getSelection().addRange(range)
  document.execCommand('copy')

  for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = true

  document.execCommand('copy')

  for (var i = 0; i < activeSheets.length; i++) activeSheets[i].disabled = false

  // Remove the iframe
  document.body.removeChild(container)
}
