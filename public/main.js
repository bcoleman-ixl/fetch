const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function initialize() {
  tinymce.init({
    selector: '#body',
    menubar: false,
    statusbar: true,
    height: '350',
    plugins: 'lists, advlist, textcolor, colorpicker',
    // TODO: Need to organize toolbar
    toolbar: [
      'undo redo | bold italic underline | alignleft  aligncenter  alignright | numlist  bullist | forecolor | backcolor | removeformat | link'
    ]
  });
  Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local;
  })
  var date = new Date().toDateInputValue();
  document.getElementById('creationDate').value = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

}

function setItemId() {
  var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // TODO: Limit digits to 100-999.
  randNum = Math.floor((Math.random() * (999 - 100) + 1) + 100);
  digit1 = digits.charAt(Math.floor((Math.random() * 25)));
  digit2 = digits.charAt(Math.floor((Math.random() * 25)));
  document.getElementById('id').value = (digit1 + digit2 + randNum);
}

$('#manageItems').on('hidden.bs.modal', function() {
  console.log('running');
  $("#itemsForm").trigger('reset');
  document.getElementById('manageItemsTitle').innerHTML = 'Add new item';
})

/* Handle clicks */
var dataTable = document.querySelector('#data-table');
dataTable.addEventListener('click', handleClick, false);

function handleClick(e) {
  var itemId, item, body;
  itemId = $(e.target).closest('li').attr('id');
  eventId = $(e.target).closest('div').attr('id');
  // Copy
  if (e.target !== e.currentTarget && eventId == 'itemBody' ) {
    // Removing all p tags is not a long term solution
    body = document.getElementById(itemId).querySelector('#itemBody').outerHTML.replace('<p>', '<br>').replace('</p>', '<br>');
    copy(buildItem(body));
    console.log('copied: ' + itemId);
    // Remove
  } else if (e.target !== e.currentTarget && eventId == 'remove' ) {
    remove(itemId);

    // Edit
  } else if (e.target !== e.currentTarget && eventId == 'edit') {
    $('#manageItems').modal('show');
    editItem(itemId);

    // Do nothing
  } else {
    e.stopPropagation();
  }
}

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

function buildItem(body) {
  // Update to pull from settings
  user = '<b>Bryce</b> </br>';
  email = 'E-mail: help@ixl.com<br>'
  program = 'IXL Support<br>'
  phone = 'Phone: 855.255.6676<br>'
  website = 'Website: www.ixl.com<br>';
  greeting = 'Dear NAME,<br><br>Thank you for reaching out to us.<br>';
  signature = 'Sincerely, <br>' + user + program + '<br>' + email + phone + website + '<img src=\'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000\' alt=\'ixl-logo\'>';
  return html = greeting + body + signature;
}

function remove(id) {
  fetch('remove', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': id
      })
    })
    .then(res => {
      if (res.ok) return res.json()
    }).
  then(data => {
    window.location.reload()
  })
}

function editItem(itemId) {
  var form, nameField, bodyField, categoryField, typeField, tagsField, itemAddBtn;
  // Grab form/fields
  form = document.getElementById('itemsForm');
  nameField = document.getElementById('name');
  bodyField = tinymce.get('body').getBody();
  categoryField = document.getElementById('category');
  typeField = document.getElementById('type');
  tagsField = document.getElementById('tags');

  //Grab active item information
  var name, body, category, type, tags;
  name = document.getElementById(itemId).querySelector('#itemName');
  body = document.getElementById(itemId).querySelector('#itemBody');
  category = document.getElementById(itemId).querySelector('#itemCategory');
  type = document.getElementById(itemId).querySelector('#itemType');
  tags = document.getElementById(itemId).querySelector('#itemTags');

  nameField.value = name.textContent;
  bodyField.innerHTML = body.innerHTML;
  categoryField.value = category.textContent;
  typeField.value = type.textContent;
  tagsField.value = tags.textContent;

  form.method = '';
  form.action = '';
  document.getElementById('manageItemsTitle').innerHTML = 'Edit item';
  var update = document.getElementById('submitBtn')

  update.addEventListener('click', function() {
    var body = tinymce.get('body').getBody().innerHTML;
    var name = document.querySelector('#name').value;
    var tags = document.querySelector('#tags').value;
    console.log(category);
    fetch('update', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': itemId,
        'name': name,
        'body': body,
        'tags': tags
      })
    }).then(res => {
      if (res.ok) return res.json()
    }).then(data => {
      console.log(data)
      window.location.reload(true)
    })
  })
}



initialize()
