/**
 * Main script for application. Handles clicks, ranking,
 * sorting, and operations for creating, updating,
 * deleting, and copying templates.
 *
 *
 */
// Constants and function for creating the updated date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
$(document).ready(function() {
  $('#data-table').show();
});
/* Ensures that modal for adding hyperlinks in MCE loads correctly */
$(document).on('focusin', function(e) {
  if ($(e.target).closest(".mce-window").length) {
    e.stopImmediatePropagation();
  }
});

/**
 * Fires when document loads,
 * initializes editor, adds updated date
 * to add new template form, and
 * adds event listener to dataTable field
 *
 */
function initialize() {
  /**
   * Initialize settings for Tiny MCE editor
   * --Force break tag when entering new lines.
   *  --Only allow for hyperlinks, italics, unorderd list
   *  underline, bold tags (changes strong to bold) and break
   *  tags (changes div to br)
   *  --Hide menu bar and show status backcolor
   *  --Disables custom name for the bootom anchor in
   *  the url type ahead drop down
   *  --Toolbar buttons defined
   *
   */
  tinymce.init({
    selector: '#body',

    force_br_newlines: true,
    force_p_newlines: false,
    forced_root_block: false,
    convert_newlines_to_brs: true,
    menubar: false,
    statusbar: true,
    anchor_bottom: false,
    anchor_top: false,
    height: '275',
    plugins: 'lists, advlist, textcolor, colorpicker, link',
    toolbar: [
      'undo redo | bold italic underline | alignleft  aligncenter  alignright | numlist  bullist | forecolor | backcolor | removeformat | link'
    ]
  });
  let date = new Date().toDateInputValue();
  document.getElementById('updatedDate').value = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  let dataTable = document.querySelector('#data-table');
  dataTable.addEventListener('click', handleClick, false);
  dataTable.addEventListener('drop', handleDrop, false);
}

Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local;
})

/**
 * Shows modal to confirm deletion of a template
 */
$('#confirmRemoveDialog').on('hidden.bs.modal', function() {
  $('#confirmRemoveModal').find('a').attr('id', 'confirmRemoveBtn');
})

/**
 * Clears search box when x is clicked, search() Function
 * is also fired to resort list.
 */
$("#clear-search").click(function() {
  $("#search-bar").val('');
  search();
  // Places cursor back in search box
  $("#search-bar").focus();
});

/* Functions for template modal */

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
/* Prevents colors from sticking on button operations when clicked */
$(".btn").mouseup(function() {
  $(this).blur();
})

/**
 * Generates a unique alphanumeric ID for each template. Template
 * ID is set when the function completes. setTemplateId() function
 * is fired each time user clicks add new template link in the
 * account menu.
 */
function setTemplateId() {
  var templateId = '';
  let digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // Number 100 - 999
  for (var k = 0; k < 18; k++) {
    if (k % 2 > 0) {
      templateId += Math.floor(Math.random() * 9) + 1;

    } else {
      templateId += digits.charAt(Math.floor((Math.random() * 25)));
    }
  }
  document.getElementById('id').value = templateId;
}

/**
 * Handles all click events in the data-table. When click is fired,
 * function collects the following data:
 * 1. ID of the template nearest the click
 * 2. The users team name (i.e., 'techSupport', 'family')
 * 3. The eventId of the element that was clicked (i.e., 'templateBody', 'copyFull')
 * 4. The template element
 * 5. The template program (i.e., 'IXL', 'FAM', 'QW', etc.)
 * 6. The reply email (a.k.a. Signature e-mail)
 * 7. The tempalte greeting ('Thank you for reaching...')
 * 8. The tempalte closing ('Please let me know if you have any questions...')
 *
 * Logic determines the kind of click and executes appropriate actions
 *
 * @param  {[type]} e the click event
 * @return {[type]}   [description]
 */
function handleClick(e) {
  let templateId = $(e.target).closest(`li[class^='template']`).attr('id');
  let userTeam = document.getElementById('userTeam').innerHTML;
  let eventId = $(e.target).closest('div').attr('id');
  let template = $(e.target).closest(`li[class^='template']`);
  let program = $(`#` + templateId + ` #templateProgram`).text().trim();
  let folder = $(`#` + templateId + ` #templateFolder`).text().trim();
  let replyEmail = $(`#` + templateId + ` #templateReplyEmail`).text();
  let greeting = $(e.target).closest(`.template`).find(`#templateGreeting`).text();
  let closing = $(e.target).closest(`.template`).find(`#templateClosing`).text();
  /**
   * If templateBody or copyFull is clicked, then execute the following:
   * 1. P tags are removed and replaced with breaks. Divs are also replaced with breaks. TODO: Need better solution here.
   * 2. Alert user that the template has been copied.
   * 3. Copy by sending body to buildEmail(). Greeting, closing, signature, and othe components added. Then full e-mail is copied to the clipboard.
   * 4. Updates the ranking of this template.
   */
  if (e.target !== e.currentTarget && (eventId == 'templateBody' || eventId == 'copyFull')) {
    let body = $(e.target).closest(`.template`).find(`#templateBody`).html().replace('<p>', '</br>').replace('</p>', '</br>');
    body = document.getElementById(templateId).querySelector('#templateBody').innerHTML
    alertUser(template);
    copy(buildEmail(body, program, replyEmail, greeting, closing, templateId, userTeam, folder));
    updateRanking(templateId, eventId);
    /**
     * If copyPortion is clicked, then execute the following:
     * 1. Alert user that the template has been copied.
     * 3. Copy the body of the template using copy().
     * 4. Updates the ranking of this template.
     */
  } else if (e.target !== e.currentTarget && eventId == 'copyPortion') {
    alertUser(template);
    body = document.getElementById(templateId).querySelector('#templateBody').innerHTML;
    copy(body);
    updateRanking(templateId, eventId);

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
    updateRanking(templateId, 0, 0, 0);

    // Do nothing
  } else {
    e.stopPropagation();
  }
}



/**
 * Alerts the user when a template has
 * been copied by displaying the word
 * 'copied' on the template
 */
function alertUser(template) {
  // Grab the span element
  let span = $(template).find(`#copiedAlert`);
  $(span).fadeIn(400).fadeOut(1000);
}

/**
 * 1. Creates and hides a container for the HTML
 * 2. Detects the stylesheets of the page
 * 3. Mounts the iframe to the DOM to make 'contentWindow' available
 * 4. Copies the HTML to the clipboard.
 * 5. Removes the iframe
 *
 * @param  {[type]} html [description]
 */

function copy(html) {
  let container = document.createElement('div');
  container.innerHTML = html;
  container.style.opacity = 100;
  let activeSheets = Array.prototype.slice.call(document.styleSheets)
    .filter(function(sheet) {
      return !sheet.disabled;
    });
  document.body.appendChild(container);
  window.getSelection().removeAllRanges();
  let range = document.createRange();
  range.selectNode(container);
  window.getSelection().addRange(range);
  document.execCommand('copy');
  console.log("copied:" + html);
  document.body.removeChild(container)
}





function buildEmail(body, program, replyEmail, greeting, closing, templateId, userTeam, folder) {
  /**
   * Grabs users first name from their account menu (set by Google Profile).
   * Sets e-mail, program, phone number, website, greeting,
   * closing, and location of the IXL logo. Uses these elements
   * to build the email which includes the greeting, template body,
   * closing, and signature.
   * @return {String} Complete e-mail response
   */
  var opening = '';
  if (greeting == 'default' && closing == 'default') {
    greeting = 'Thank you for reaching out to us.';
    opening = `Dear NAME, <br/><br/> ${greeting}`;
    closing = 'Please let me know if you have any questions and I will be happy to help!</br></br>';
    body = `</br></br>${body}</br></br>`;
  } else if ((greeting == 'none' || greeting == ' ' || greeting == '') && (templateId != `X00_1_Blank_Signature_only`)) {
    greeting = '';
    closing = closing + `</br></br>`;
    body = `</br></br>${body}</br></br>`;
    opening = `Dear NAME, ${greeting}`;
  } else if (templateId == `X00_1_Blank_Signature_only`) {
    return getProgramSignature(program, replyEmail, userTeam, folder);
  } else {
    body = `</br></br>${body}</br></br>`;
    closing = `${closing}</br></br>`;
    opening = `Dear NAME, <br/><br/> ${greeting}`;
  }
  var signature = getProgramSignature(program, replyEmail, userTeam, folder);
  return `${opening} ${body} ${closing} ${signature}`;
}

function handleDrop(e) {
  let templateId = $(e.target).closest(`li[class^='template']`).attr('id');
  let eventId = $(e.target).closest('div').attr('id');
  let template = $(e.target).closest(`li[class^='template']`);
  var data = e.dataTransfer.getData("Text");
  //console.log(data);
  //console.log(templateId);
}

function allowDrop(event) {
  event.preventDefault();
}

/**
 * Builds signature. Uses userTeam and template program to determine signature
 * @param  {[type]} program    Name of the program associated with the template
 * @param  {[type]} replyEmail The reply e-mail that will be included in the signature
 * @return {String}            Return the complete signature
 */
function getProgramSignature(program, replyEmail, userTeam, folder) {
  console.log(folder);
  var user = document.getElementById('userFirstName').innerHTML;
  if (userTeam == 'techSupport' && program == 'IXL') {
    var valediction = `Sincerely,</br>`;
    var name = `<b>${user}</b></br>`;
    var department = 'IXL Support</br></br>';
    var email = `E-mail: ${replyEmail}</br>`;
    var phone = 'Phone: 855.255.6676</br>';
    var website = 'Website: www.ixl.com</br>';
    var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
    var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
    return `${valediction} ${name} ${department} ${email} ${phone} ${website} ${logo}`;
  } else if (userTeam == 'techSupport' && program != 'IXL') {
    var valediction = `Sincerely,</br>`;
    var name = `${user}</br>Quia Support</br>`;
    return `${valediction} ${name} ${replyEmail}`;
  } else if (userTeam == 'family') {
    var valediction = `Sincerely,</br></br>`;
    var name = `<b>${user}</b></br>`;
    var department = 'IXL Membership Specialist</br></br>';
    var email = `E-mail: support@ixl.com</br>`;
    if (folder == 'Family Translated Editions') {
      var phone = '';
    } else {
      var phone = 'Phone: 855.255.8800</br>';
    }
    var website = 'Website: www.ixl.com</br>';
    var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
    var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
    return `${valediction} ${name} ${department} ${email} ${phone} ${website} ${logo}`;
  }

}

/**
 * Sends the eventId (which is the template Id)
 * to be removed. Reloads window after it
 * has been removed.
 * @param  {Event} e the Click event
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

/**
 * 1. Collect the manage templates form.
 * 2. Collect empty form fields.
 * 3. Collect fileds from the template that was clicked.
 * @param  {[type]} templateId [description]
 * @return {[type]}            [description]
 */
function editTemplate(templateId) {
  // Grab the maange templates form
  let form = document.getElementById('templatesForm');
  let idField = document.getElementById('id');

  // Grab form fields
  let nameField = document.getElementById('name');
  let bodyField = tinymce.get('body').getBody();
  let categoryField = document.getElementById('category');
  let programField = document.getElementById('program');
  let tagsField = document.getElementById('tags');
  let teamField = document.getElementById('team');
  let publicStatusField = document.getElementById('publicStatus');
  let greetingField = document.getElementById('greeting');
  let closingField = document.getElementById('closing');
  let replyEmailField = document.getElementById('replyEmail');

  // Grab this templates information
  let name = document.getElementById(templateId).querySelector('#templateName');
  let body = document.getElementById(templateId).querySelector('#templateBody');
  let category = document.getElementById(templateId).querySelector('#templateCategory');
  let program = document.getElementById(templateId).querySelector('#templateProgram');
  let tags = document.getElementById(templateId).querySelector('#templateTags');
  let team = document.getElementById(templateId).querySelector('#templateTeam');
  let publicStatus = document.getElementById(templateId).querySelector('#templatePublicStatus');
  let greeting = document.getElementById(templateId).querySelector('#templateGreeting');
  let closing = document.getElementById(templateId).querySelector('#templateClosing');
  let replyEmail = document.getElementById(templateId).querySelector('#templateReplyEmail');
  let today = new Date().toDateInputValue();
  // Set all form fields equal to this templates fields
  idField.value = templateId;
  nameField.value = name.textContent.trim();
  bodyField.innerHTML = body.innerHTML.trim();
  categoryField.value = category.textContent.trim();
  programField.value = program.textContent.trim();
  tagsField.value = tags.textContent;
  teamField.value = team.textContent;
  publicStatusField.value = publicStatus.textContent;

  greetingField.value = greeting.textContent;
  closingField.value = closing.textContent;
  replyEmailField.value = replyEmail.textContent;

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

// TODO: Remove e from function parameter
function update(e) {
  let id = document.querySelector('#id').value;
  let updatedDate = document.querySelector('#updatedDate').value;
  let name = document.querySelector('#name').value;
  let body = tinymce.get('body').getBody().innerHTML;
  let category = document.querySelector('#category').value;
  let program = document.querySelector('#program').value;
  let tags = document.querySelector('#tags').value;
  let team = document.querySelector('#team').value;
  let publicStatus = document.querySelector('#publicStatus').value;
  let greeting = document.querySelector('#greeting').value;
  let closing = document.querySelector('#closing').value;
  let replyEmail = document.querySelector('#replyEmail').value;
  body = format(body);
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
      'program': program,
      'tags': tags,
      'team': team,
      'publicStatus': publicStatus,
      'greeting': greeting,
      'closing': closing,
      'replyEmail': replyEmail
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {
    window.location.reload()
  })
}

function format(body) {
  body = body.replace(/<div><br><\/div>/g, "<br/>");
  body = body.replace(/<\/div>/g, "");
  body = body.replace(/<div>/g, "<br/>");
  body = body.replace(/ \"body\": "<br\/>/g, "\"body\": \"");
  body = body.replace(/&nbsp;/g, "");
  if (body.substring(0, 5) == "<br/>") {
    body = body.substring(5);
  }
  return body;
}


function updateRanking(templateId, eventId) {
  let ranking = document.getElementById(templateId).querySelector('#templateRanking').innerHTML;
  let copyFull = document.getElementById(templateId).querySelector('#templateCopyFull').innerHTML;
  let copyPortion = document.getElementById(templateId).querySelector('#templateCopyPortion').innerHTML;

  if (eventId == 'copyFull' || eventId == 'templateBody') {
    var newRanking = +ranking + 1;
    var newFull = +copyFull + 1;
    var newPortion = +copyPortion;
  } else {
    var newRanking = +ranking + 1;
    var newFull = +copyFull;
    var newPortion = +copyPortion + 1;
  }
  console.log(newRanking, newFull, newPortion);
  console.log(templateId);

  ranking.innerHTML = newRanking;
  copyFull.innerHTML = newFull;
  copyPortion.innerHTML = newPortion;
  // Send update to database, do not reload page
  fetch('updateRanking', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': templateId,
      'ranking': newRanking,
      'copyFull': newFull,
      'copyPortion': newPortion
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

/**
 * Updates search logs by recording searches where no templates were found
 * @param  {[type]} userSearch An array of the users search content
 */
function updateLogs(userSearch) {
  let userEmail = document.getElementById('userEmail').innerHTML.toLowerCase();
  fetch('updateLogs', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'userEmail': userEmail,
      'userSearch': userSearch
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {})
}

initialize()