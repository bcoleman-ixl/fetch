/**
 * Main script for application. Handles clicks, ranking,
 * sorting, and opeartions for creating, updating,
 * deleting, and copying templates.
 *
 */

/**
 * Fires when document loads, sorts templates,
 * initializes editor, adds updated date, and
 * adds event listener to dataTable filed
 *
 * @return {[type]} [description]
 */
function initialize() {
  // Sorts all templates by rank number
  rank();
  // Sets up editor and loads toolbar
  tinymce.init({
    selector: '#body',
    menubar: false,
    statusbar: true,
    height: '350',
    plugins: 'lists, advlist, textcolor, colorpicker',
    toolbar: [
      'undo redo | bold italic underline | alignleft  aligncenter  alignright | numlist  bullist | forecolor | backcolor | removeformat | link'
    ]
  });
  // Loads date into updatedDate field
  let date = new Date().toDateInputValue();
  document.getElementById('updatedDate').value = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

  // Sends all click events to handleClick function
  let dataTable = document.querySelector('#data-table');
  dataTable.addEventListener('click', handleClick, false);
}

// Constants and function for creating the updated date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local;
})

/**
 * When Manage Templates modal is hidden,
 * form fields, method, and action are reset
 */
$('#manageTemplates').on('hidden.bs.modal', function() {
  $('#templatesForm').trigger('reset');
  document.getElementById('manageTemplatesTitle').innerHTML = 'Add new template';
  form = document.getElementById('templatesForm');
  document.getElementById('submitBtn').removeEventListener('click', update);
  form.method = 'POST';
  form.action = '/add';
  let updateBtn = document.getElementById('submitBtn');
  updateBtn.innerHTML = 'Submit';
  updateBtn.onclick = '';
})

$('#confirmRemoveDialog').on('hidden.bs.modal', function() {
  $('#confirmRemoveModal').find('a').attr('id', 'confirmRemoveBtn');
})

// CLears search box when x is clicked
$("#clear-search").click(function() {
  $("#search-bar").val('');
  // Runs search function so templates are sorted by rank number
  search();
  // Places cursor back in search box
  $("#search-bar").focus();
});

// Prevents colors from sticking on button operations
$(".btn").mouseup(function() {
  $(this).blur();
})

// Generates a unique ID for each template
function setTemplateId() {
  let digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // Number 100 - 999
  let randNum = Math.floor((Math.random() * (999 - 100) + 1) + 100);
  // First random digit
  let digit1 = digits.charAt(Math.floor((Math.random() * 25)));
  // Second random digit
  let digit2 = digits.charAt(Math.floor((Math.random() * 25)));
  // Set tempalteId
  let templateId = digit1 + digit2 + randNum;
  // Assign newly created ID to the template's ID field
  document.getElementById('id').value = templateId;
}

/**
 * Handles all clicks for the dataTable
 */
function handleClick(e) {
  // Get templateId from the template where this click origniated
  let templateId = $(e.target).closest(`li[class^='template']`).attr('id');
  // Grab the id of the element that was clicked
  let eventId = $(e.target).closest('div').attr('id');

  /* If copy full button was clicked or template body was clicked */
  if (e.target !== e.currentTarget && (eventId == 'templateBody' || eventId == 'copyFull')) {
    // P tags are removed and replaced with breaks. TODO: Need better solution here.
    let body = document.getElementById(templateId).querySelector('#templateBody').outerHTML.replace('<p>', '<br>').replace('</p>', '<br>');
    // Sends message to user that the item has been copied
    alertUser(templateId);
    /**
     * Sends template body to buildEmail function
     * to add template components (greeting, closing, signature,
     * etc.). Then copies the full e-mail to the clipboard
     */
    copy(buildEmail(body));

    // Selects ranking element and currentRanking. Converts to integer and updates ranking number
    let ranking = document.getElementById(templateId).querySelector('#templateRanking').innerHTML;
    let currentRanking = parseInt(ranking);
    // Updates ranking number for this templateId
    updateRanking(templateId, currentRanking + 1);

    /* If copy portion button was clicked */
  } else if (e.target !== e.currentTarget && eventId == 'copyPortion') {
    // Sends message to user that the item has been copied
    alertUser(templateId);
    // Grabs template body and copies it to the clipboard
    body = document.getElementById(templateId).querySelector('#templateBody').outerHTML.replace('<p>', '<br>').replace('</p>', '<br>');
    copy(body);

    // Selects ranking element and currentRanking. Converts to integer and updates ranking number
    let ranking = document.getElementById(templateId).querySelector('#templateRanking').innerHTML;
    let currentRanking = parseInt(ranking);
    // Updates ranking number for this templateId
    updateRanking(templateId, currentRanking + 1);

    /* If trash (or remove) button was clicked */
  } else if (e.target !== e.currentTarget && eventId == 'removeConfirm') {
    // Grab elements to load template name and id into these elements
    let confirmRemoveName = document.getElementById('confirmRemoveName');
    let confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    // Grab name of tempalte to be removed
    let nameToRemove = document.getElementById(templateId).querySelector('#templateName');
    // Set to display name of item to be removed, set btn id to template id
    confirmRemoveName.innerHTML = nameToRemove.innerHTML;
    confirmRemoveBtn.id = templateId;

    // Display the confirmation box
    $('#confirmRemoveDialog').modal('show');

    /* If edit button was clicked */
  } else if (e.target !== e.currentTarget && eventId == 'edit') {
    //  Show manage teampltes modal
    $('#manageTemplates').modal('show');
    // Load all elements into the modal
    editTemplate(templateId);

    /* If clear rank button was clicked */
  } else if (e.target !== e.currentTarget && eventId == 'clearRank') {
    // Use update ranking to set template Id to 0
    updateRanking(templateId, 0);

    // Do nothing
  } else {
    e.stopPropagation();
  }
}

/**
 * Alerts the user when a template has
 * been copied by displayin the word
 * 'copied' on the template
 */
function alertUser(templateId) {
  // Grab the span element
  let span = document.getElementById(templateId).querySelector('#copiedAlert');
  // Show span and text 'Copied'
  span.style.transition = 'none';
  span.style.opacity = 1;
  span.textContent = 'Copied';
  void span.offsetWidth;
  // Make transition last 1.5 seconds
  span.style.transition = 'opacity 1.5s';
  // Set opacity to 0 and hide element
  span.style.opacity = '0';
}

function copy(html) {
  // TODO: Add more comments
  // Create container for the HTML
  let container = document.createElement('div');
  container.innerHTML = html;

  // Hide the element
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
  document.body.removeChild(container)
}

function buildEmail(body) {
  /**
   * Grabs users first name from their account menu (set by Google Profile).
   * Sets e-mail, program, phone number, website, greeting,
   * closing, and location of the IXL logo. Uses these elements
   * to build the email which includes the greeting, template body,
   * closing, and signature.
   *
   * TODO: Need to update so user can select their own greeting/closing
   */
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

/**
 * Sends the eventId (which is the template Id)
 * to be removed. Reloads window after it
 * has been removed.
 */
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

function editTemplate(templateId) {
  // Grab the maange templates form
  let form = document.getElementById('templatesForm');

  // Grab form fields
  let idField = document.getElementById('id');
  let nameField = document.getElementById('name');
  let bodyField = tinymce.get('body').getBody();
  let categoryField = document.getElementById('category');
  let typeField = document.getElementById('type');
  let tagsField = document.getElementById('tags');

  // Grab this templates information
  let name = document.getElementById(templateId).querySelector('#templateName');
  let body = document.getElementById(templateId).querySelector('#templateBody');
  let category = document.getElementById(templateId).querySelector('#templateCategory');
  let type = document.getElementById(templateId).querySelector('#templateType');
  let tags = document.getElementById(templateId).querySelector('#templateTags');
  let today = new Date().toDateInputValue();

  // Set all form fields equal to this templates fields
  idField.value = templateId;
  nameField.value = name.textContent;
  bodyField.innerHTML = body.innerHTML;
  categoryField.value = category.textContent;
  typeField.value = type.textContent;
  tagsField.value = tags.textContent;

  // Removes forms method and action, form handled by update method (below)
  form.method = '';
  form.action = '';
  // Change title of template to 'Edit template'
  document.getElementById('manageTemplatesTitle').innerHTML = 'Edit template';
  let updateBtn = document.getElementById('submitBtn');
  updateBtn.innerHTML = 'Update';
  // Run update function on click of update button
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
  // Get ranking element and update it with new rank number
  let templateRanking = document.getElementById(id).querySelector('#templateRanking');
  templateRanking.innerHTML = newRanking;
  // Send update to database, do not reload page
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

/**
 * Sorts all tempaltes in the dataTable in order
 * from highest rank number to lowest.
 */
function rank() {
  let list = document.getElementById('data-table');
  let li = null;
  let shouldSwitch = false;
  let switching = true;
  /* Make a loop that will continue until
  no switching has been done */
  while (switching) {
    // Start by saying: no switching is done
    switching = false;
    li = list.getElementsByClassName('template');
    // Loop list of templates
    for (k = 0; k < (li.length - 1); k++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Check if the next template should
      switch place with the current template: */
      if (parseInt(li[k].querySelector('#templateRanking').innerHTML) < parseInt(li[k + 1].querySelector('#templateRanking').innerHTML)) {
        /* If next template is alphabetically lower than current template,
        mark as a switch and break the loop */
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark the switch as done */
      li[k].parentNode.insertBefore(li[k + 1], li[k]);
      switching = true;
    }
  }
}


initialize()