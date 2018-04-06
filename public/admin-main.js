//Constant for creating date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/*
 * Initializes the document by setting up
 * fields, initializing componenets, and
 * adding eventListner to the dataTable
 */
function initialize() {
  // Sets up editor and loads toolbar
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
  // Loads date into updatedDate field
  let date = new Date().toDateInputValue();
  document.getElementById('updatedDate').value = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

  // Adds event listener to the entire dataTable field, sends event to handleClick when caught
  let dataTable = document.querySelector('#data-table');
  dataTable.addEventListener('click', handleClick, false);
}

/**
 * Generates a unique itemId
 */
function setItemId() {
  let digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // TODO: Limit digits to 100-999.
  randNum = Math.floor((Math.random() * (999 - 100) + 1) + 100);
  digit1 = digits.charAt(Math.floor((Math.random() * 25)));
  digit2 = digits.charAt(Math.floor((Math.random() * 25)));
  document.getElementById('id').value = (digit1 + digit2 + randNum);
}

$('#manageItems').on('hidden.bs.modal', function() {
  $('#itemsForm').trigger('reset');
  document.getElementById('manageItemsTitle').innerHTML = 'Add new item';
  form = document.getElementById('itemsForm');
  document.getElementById('submitBtn').removeEventListener('click', update);
  form.method = 'POST';
  form.action = '/add';
  let updateBtn = document.getElementById('submitBtn');
  updateBtn.onclick = '';
})

$('#confirmRemoveDialog').on('hidden.bs.modal', function() {
  $('#confirmRemoveModal').find('a').attr('id', 'confirmRemoveBtn');
})

function handleClick(e) {
  let itemId = $(e.target).closest(`li[class^='item']`).attr('id');
  let eventId = $(e.target).closest('div').attr('id');

  // TODO:   rewrite code to incolorste all button click here

  // Copy
  if (e.target !== e.currentTarget && eventId == 'itemBody') {
    // Removing all p tags is not a long term solution
    let body = document.getElementById(itemId).querySelector('#itemBody').outerHTML.replace('<p>', '<br>').replace('</p>', '<br>');
    copy(buildItem(body));
    let ranking = document.getElementById(itemId).querySelector('#itemRanking').innerHTML;
    let currentRanking = parseInt(ranking);
    updateRanking(itemId, currentRanking + 1);

  } else if (e.target !== e.currentTarget && eventId == 'copyPortion') {
    body = document.getElementById(itemId).querySelector('#itemBody').outerHTML.replace('<p>', '<br>').replace('</p>', '<br>');
    copy(body);
    let ranking = document.getElementById(itemId).querySelector('#itemRanking').innerHTML;
    let currentRanking = parseInt(ranking);
    updateRanking(itemId, currentRanking + 1);

    // Remove
  } else if (e.target !== e.currentTarget && eventId == 'removeConfirm') {

    let confirmRemoveName = document.getElementById('confirmRemoveName');
    let confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    let nameToRemove = document.getElementById(itemId).querySelector('#itemName');
    confirmRemoveName.innerHTML = nameToRemove.innerHTML;
    confirmRemoveBtn.id = itemId;
    $('#confirmRemoveDialog').modal('show');

    // Edit
  } else if (e.target !== e.currentTarget && eventId == 'edit') {
    $('#manageItems').modal('show');
    editItem(itemId);

  } else if (e.target !== e.currentTarget && eventId == 'clearRank') {
    updateRanking(itemId, 0);

    // Do nothing
  } else {
    e.stopPropagation();
  }
}

function copy(html) {
  // Create container for the HTML
  let container = document.createElement('div');
  container.innerHTML = html;

  // Hide element
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.opacity = 0;

  // Detect all style sheets of the page
  let activeSheets = Array.prototype.slice.call(document.styleSheets)
    .filter(function(sheet) {
      return !sheet.disabled;
    });

  // Mount the iframe to the DOM to make `contentWindow` available
  document.body.appendChild(container);

  // Copy to clipboard
  window.getSelection().removeAllRanges();

  let range = document.createRange();
  range.selectNode(container);
  window.getSelection().addRange(range);
  document.execCommand('copy');

  for (let i = 0; i < activeSheets.length; i++) {
    activeSheets[i].disabled = true;
  }

  document.execCommand('copy');

  for (let i = 0; i < activeSheets.length; i++) {
    activeSheets[i].disabled = false;
  }

  // Remove the iframe
  //document.body.removeChild(container)
}

function buildItem(body) {
  // Update to pull from settings
  let userFirstName = document.getElementById('userFirstName').innerHTML;
  let user = `<span style='color: blue;'><b> ${userFirstName} </b></span></br>`;
  let email = `E-mail: help@ixl.com<br>`;
  let program = 'IXL Support<br>';
  let phone = 'Phone: 855.255.6676<br>';
  let website = 'Website: www.ixl.com<br>';
  let greeting = 'Dear NAME,<br><br>Thank you for reaching out to us.<br>';
  let closing = 'Please let me know if you have any questions and I will be happy to help!<br>'
  let logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
  let logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
  let signature = `<br>Sincerely, <br> ${user} ${program} <br> ${email} ${phone} ${website} ${logo}`;
  return `${greeting} ${body} ${closing} ${signature}`;
}

function remove(e) {
  fetch('remove', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'id': e.target.id
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
  let form, idField, nameField, bodyField, categoryField, typeField, tagsField, itemAddBtn;
  // Grab form/fields
  form = document.getElementById('itemsForm');
  idField = document.getElementById('id');
  nameField = document.getElementById('name');
  bodyField = tinymce.get('body').getBody();
  categoryField = document.getElementById('category');
  typeField = document.getElementById('type');
  tagsField = document.getElementById('tags');

  //Grab active item information
  let today, updatedDate, name, body, category, type, tags;
  name = document.getElementById(itemId).querySelector('#itemName');
  body = document.getElementById(itemId).querySelector('#itemBody');
  category = document.getElementById(itemId).querySelector('#itemCategory');
  type = document.getElementById(itemId).querySelector('#itemType');
  tags = document.getElementById(itemId).querySelector('#itemTags');
  today = new Date().toDateInputValue();

  idField.value = itemId;
  nameField.value = name.textContent;
  bodyField.innerHTML = body.innerHTML;
  categoryField.value = category.textContent;
  typeField.value = type.textContent;
  tagsField.value = tags.textContent;

  form.method = '';
  form.action = '';
  document.getElementById('manageItemsTitle').innerHTML = 'Edit item';
  let updateBtn = document.getElementById('submitBtn');
  updateBtn.onclick = update;
}

function update(e) {
  let id = document.querySelector('#id').value;
  let updatedDate = document.querySelector('#updatedDate').value;
  let name = document.querySelector('#name').value;
  let body = tinymce.get('body').getBody().innerHTML;
  let category = document.querySelector('#category').value;
  let type = document.querySelector('#type').value;
  let tags = document.querySelector('#tags').value;
  fetch('update', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': id,
      'updatedDate': updatedDate,
      'name': name,
      'body': body,
      'category': category,
      'type': type,
      'tags': tags
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {
    window.location.reload(true)
  })
}

function updateRanking(id, newRanking) {
  let itemRanking = document.getElementById(id).querySelector('#itemRanking');
  itemRanking.innerHTML = newRanking;
  fetch('updateRanking', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': id,
      'ranking': newRanking
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {})
}

Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local;
})

initialize()