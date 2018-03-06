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

function handle(e) {
  if ((e.target !== e.currentTarget && e.target.id == 'copy') || (e.target.parentNode.id == 'copy')) {
    var id, li, template, html;
    id = e.target.parentNode.id;
    li = document.getElementById(id);
    template = li.querySelector('#template');
    html = template.outerHTML;
    copy(html);
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
