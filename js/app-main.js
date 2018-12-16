/**
 * Main script for application. Handles clicks, ranking,
 * sorting, and operations for creating, updating,
 * deleting, and copying templates.
 */
// Constants and function for creating the updated date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];



/* Ensures that modal for adding hyperlinks in MCE loads correctly */
$(document).on('focusin', function(e) {
  if ($(e.target).closest('.mce-window').length) {
    e.stopImmediatePropagation();
  }
});

/**
 * Limits version titles to 15 characters
 * @param  {[type]} event [description]
 * @return {[type]}       [description]
 */
$('.versionTabs').on('keydown', function(event) {
  if ($(this).text().length === 15 && event.keyCode != 8) {
    event.preventDefault();
  }
});

// NOTE: Side navbar
/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById("mySidenav").style.width = "350px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}


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
   *  — Code button shows html code behind each template
   *
   */
  tinymce.init({
    selector: '.editor',
    force_br_newlines: true,
    force_p_newlines: false,
    forced_root_block: false,
    convert_newlines_to_brs: true,
    menubar: false,
    statusbar: true,
    anchor_bottom: false,
    anchor_top: false,
    height: '275',
    plugins: 'lists, advlist, textcolor, colorpicker, link, code',
    toolbar: [
      'undo redo | bold italic underline | alignleft  aligncenter  alignright | numlist  bullist | removeformat | link | code'
    ]
  });
  let date = new Date().toDateInputValue();
  document.getElementById('updatedDate').value = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  let dataTable = document.querySelector('#data-table');
  dataTable.addEventListener('click', handleClick, false);
  dataTable.addEventListener('drop', handleDrop, false);
  var userType = document.getElementById('userType').innerHTML.trim();
  if (userType == 'admin') {
    var totalErrorCount = parseInt(document.getElementById('totalErrorCount').innerHTML);
    var errorCount = document.getElementById('errorCount');
    if (totalErrorCount > 0) {
      errorCount.innerHTML = "Errors" + " - " + totalErrorCount;
    } else if (totalErrorCount == 0) {
      errorCount.innerHTML = "Errors" + " - " + "None";
    } else {
      errorCount.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  dataTable = document.getElementById('data-table');
  loader = document.getElementById('loader');
  dataTable.style.display = 'inline-block';
  $("#loader").children().css({
    "display": "none"
  });
  $("#loader").children().addClass('stopAnimation');
  search();
}, false);


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
 * Looks for # in URL and loads value into search-bar
 */
var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
if (hashParams[0] == "") {} else {
  for (var i = 0; i < hashParams.length; i++) {
    var p = hashParams[i].split('=');
    document.getElementById('search-bar').value = decodeURIComponent(p[0]);;
  }

}

/**
 * Clears search box when x is clicked, search() Function
 * is also fired to resort list.
 */
$('#clear-search').click(function() {
  document.getElementById('search-bar').value = '';
  reset();
  // Places cursor back in search box
  $('#search-bar').focus();
});



$('#quickAccess').click(function() {
  quickAccess = document.getElementById("quickAccess");
  if ($('#quickAccessObjects').hasClass('quickAccessObjectsShow')) {

    quickAccess.innerHTML = '&#x2039;';
    $('#quickAccessObjects').addClass('quickAccessObjectsHide');
    $('#quickAccessObjects').removeClass('quickAccessObjectsShow');
    console.log('working');
  } else {
    quickAccess.innerHTML = '&#x203A';
    $('#quickAccessObjects').addClass('quickAccessObjectsShow');
    $('#quickAccessObjects').removeClass('quickAccessObjectsHide');
  }
});

$('#empty').click(function() {
  console.log('testing');
});



function toggleQuickAccess() {
  // if showing, change to right: 25px and z-index -1 and change icon to >
  // if not showing, change to right 370px z-index

}

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

  for (var i = 0; i < 4; i++) {
    var versionTab = document.getElementById('version' + i + 'Title');
    versionTab.innerHTML = ('Version' + (i + 1));
  }

  let updateBtn = document.getElementById('submitBtn');
  updateBtn.innerHTML = 'Submit';
  updateBtn.onclick = '';
});


$('#snippetsView').on('hidden.bs.modal', function() {
  for (var i = 0; i < 4; i++) {
    // Grab current blank fields
    var bodyFieldTemp = document.getElementById('version' + i + 'Snippet');
    var versionTab = document.getElementById('version' + i + 'SnippetTitle');
    //Get current version info
    bodyFieldTemp.innerHTML = "";
    versionTab.innerHTML = "";
  }
  for (var k = 0; k < 4; k++) {
    if ($('#originalSnippetTab' + k).hasClass('active')) {
      $('#originalSnippetTab' + k).attr('class', '');
    }
  }
  $('#originalSnippetTab').attr('class', 'active');
  for (var m = 0; m < 4; m++) {
    if ($('#version' + m + 'Snippet').hasClass('active') && $('#version' + m + 'Snippet').hasClass('in')) {
      $('#version' + m + 'Snippet').attr('class', 'tab-pane fade');
    }
  }
  $('#versionOriginalSnippetPill').attr('class', 'tab-pane fade in active');

  // BUG: some issue with how the body loads. with classes fade and in.
});



/* Prevents colors from sticking on button operations when clicked */
$('.btn').mouseup(function() {
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
  if (e.target.id != 'data-table' && e.target.parentNode != null) {
    var obj = buildObj(e);
    var versionsRegex = RegExp(/versionDescription.*/);
    /**
     * If templateBody or copyFull is clicked, then execute the following:
     * 1. P tags are removed and replaced with breaks. Divs are also replaced with breaks. TODO: Need better solution here.
     * 2. Alert user that the template has been copied.
     * 3. Copy by sending body to buildEmail(). Greeting, closing, signature, and othe components added. Then full e-mail is copied to the clipboard.
     * 4. Updates the ranking of this template.
     */
    if (e.target !== e.currentTarget && (obj.eventId == 'templateBody' || obj.eventId == 'copyFull')) {
      copy(buildEmail(obj.body, obj.program, obj.replyEmail, obj.greeting, obj.closing, obj.templateId, obj.userTeam, obj.folder, obj.eventId));
      copiedAlert(e);
      updateRanking(obj.templateId, obj.eventId);
      /**
       * If copyPortion is clicked, then execute the following:
       * 1. Alert user that the template has been copied.
       * 3. Copy the body of the template using copy().
       * 4. Updates the ranking of this template.
       */
    } else if (e.target !== e.currentTarget && obj.eventId == 'reply') {
      copy(buildEmail(obj.body, obj.program, obj.replyEmail, "Thank you for your reply.", obj.closing, obj.templateId, obj.userTeam, obj.folder, obj.eventId));
      copiedAlert(e);
      updateRanking(obj.templateId, obj.eventId);

    } else if (e.target !== e.currentTarget && obj.eventId == 'share') {
      copy("http://scruffy.quiacorp.com:3000/templates" + "#" + obj.templateId);

    } else if (e.target !== e.currentTarget && obj.eventId == 'copyPortion') {
      copy(obj.body);
      copiedAlert(e);
      updateRanking(obj.templateId, obj.eventId);

      /* If trash (or remove) button was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'removeConfirm') {
      // Grab elements to load template name and id into these elements
      let confirmRemoveName = document.getElementById('confirmRemoveName');
      let confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
      // Grab name of tempalte to be removed
      let nameToRemove = document.getElementById(obj.templateId).querySelector('#templateName');
      // Set to display name of item to be removed, set btn id to template id
      confirmRemoveName.innerHTML = nameToRemove.innerHTML.trim();
      confirmRemoveBtn.id = obj.templateId;

      // Display the confirmation box
      $('#confirmRemoveDialog').modal('show');

      /* If snippets icon was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'snippets') {
      // Get the template body and the body field element. Display just the tempalte body.
      $('#snippetsView').modal('show');
      loadSnippetsModal(obj);

      // Display the modal
      updateRanking(obj.templateId, 'copyPortion');

      /* If a version was clicked for copying */
    } else if (e.target !== e.currentTarget && versionsRegex.test(obj.eventId)) {
      let versionsBody = document.getElementById(obj.templateId).querySelector('#versionBody' + (obj.eventId).substr(obj.eventId.length - 1));
      copy(buildEmail(versionsBody.innerHTML, obj.program, obj.replyEmail, obj.greeting, obj.closing, obj.templateId, obj.userTeam, obj.folder, obj.eventId));
      copiedAlert(e);
      updateRanking(obj.templateId, 'copyFull');
      let versionsElementToHide = document.getElementById(obj.templateId).querySelector('.versions');
      versionsDisplay(versionsElementToHide);
      /* If quote  button was clicked for displaying */
    } else if (e.target !== e.currentTarget && obj.eventId == 'quote') {
      if (buildingQuote == true) {
        resetQuote(currentQuoteTemplateId);
      } else {

        buildQuote(e);
      }
      /* If versions button was clicked for displaying */
    } else if (e.target !== e.currentTarget && obj.eventId == 'versions') {
      let versionsElement = document.getElementById(obj.templateId).querySelector('.versions');
      versionsDisplay(versionsElement);
      /* If edit button was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'edit') {
      //  Show manage teampltes modal
      $('#manageTemplates').modal('show');
      // Load all elements into the modal
      editTemplate(obj.templateId);
    } else {
      e.stopPropagation();
    }
  }
}

function loadSnippetsModal(obj) {
  // Grab snippets fields
  let bodyField = document.getElementById('snippetsBody');

  // Grab this templates information
  let templateBody = document.getElementById(obj.templateId).querySelector('#templateBody');
  if (document.getElementById(obj.templateId).querySelector('#versionDescription0') != null) {
    // Grab version body and insert into snippets modal field
    for (var i = 0; i < 4; i++) {

      // Grab current blank fields
      var bodyFieldTemp = document.getElementById('version' + i + 'Snippet');
      var versionTab = document.getElementById('version' + i + 'SnippetTitle');

      //Get current version info
      var versionBodyTemp = document.getElementById(obj.templateId).querySelector('#versionBody' + i);
      var versionDescription = document.getElementById(obj.templateId).querySelector('#versionDescription' + i);
      bodyFieldTemp.innerHTML = versionBodyTemp.innerHTML.trim();
      versionTab.innerHTML = versionDescription.innerHTML.trim();
    }
  }
  // Set all form fields equal to this templates fields
  bodyField.innerHTML = templateBody.innerHTML.trim();

}

function copiedAlert(e) {
  let templateObjId = $(e.target).closest(`li[class^='template']`).attr('id');
  let templateObj = document.getElementById(templateObjId).querySelector('#copiedAlert');
  console.log(templateObj);
  $(templateObj).addClass('animateCopied');
  setTimeout(function() {
      $(templateObj).removeClass('animateCopied');
    },
    1000);

}

function handleFilterClick(e) {
  filterView(e.target);
}

function resetStyle(e) {
  e.target.style.backgroundColor = '';
  e.target.style.border = '';
}

function showOptions() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function versionsDisplay(versionsElement) {
  if (versionsElement.style.opacity < 1) {
    versionsElement.style.opacity = 1;
    versionsElement.style.display = 'inline';

  } else {
    versionsElement.style.opacity = 0;
    versionsElement.style.display = 'none';
  }
}


function buildObj(e) {
  var obj = new Object();
  let templateId = $(e.target).closest(`li[class^='template']`).attr('id');
  obj.templateId = $(e.target).closest(`li[class^='template']`).attr('id');
  obj.userTeam = document.getElementById('userTeam').innerHTML.trim();
  obj.eventId = $(e.target).closest('div').attr('id');
  obj.template = $(e.target).closest(`li[class^='template']`);
  obj.program = $(`#` + templateId + ` #templateProgram`).text().trim();
  obj.folder = $(`#` + templateId + ` #templateFolder`).text().trim();
  obj.replyEmail = $(`#` + templateId + ` #templateReplyEmail`).text();
  obj.greeting = $(e.target).closest(`.template`).find(`#templateGreeting`).text();
  obj.closing = $(e.target).closest(`.template`).find(`#templateClosing`).text();
  obj.body = document.getElementById(obj.templateId).querySelector('#templateBody').innerHTML.trim();
  return obj;
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
  document.body.removeChild(container)
}


function trimElement(element) {
  if (typeof element != 'undefined') {
    return element.trim();
  }
  return "";
}

function buildEmail(body, program, replyEmail, greeting, closing, templateId, userTeam, folder, eventId) {
  body = trimElement(body);
  program = trimElement(program);
  replyEmail = trimElement(replyEmail);
  greeting = trimElement(greeting);
  closing = trimElement(closing);
  templateId = trimElement(templateId);
  userTeam = trimElement(userTeam);
  folder = trimElement(folder);
  eventId = trimElement(eventId);

  /**
   * Grabs users first name from their account menu (set by Google Profile).
   * Sets e-mail, program, phone number, website, greeting,
   * closing, and location of the IXL logo. Uses these elements
   * to build the email which includes the greeting, template body,
   * closing, and signature.
   * @return {String} Complete e-mail response
   */

  if (templateId == 'Y6M7S3G2C2J6M8I1G1') {
    if (greeting == 'none') {
      var opening = `Hi NAME, </br></br>`;
    } else {
      var opening = `Hi NAME, </br></br>${greeting}</br></br>`;
    }

    if (closing == 'none') {
      closing = ''
    } else {
      closing = `</br>${closing}`;
    }
    var valediction = ``;
    var name = `<b>Customer Support Engineer</b></br></br>`;
    var email = `E-mail: ${replyEmail} </br>`;
    var phone = 'Phone: 984-229-9444</br>';
    var website = 'Website: www.ixl.com</br>';
    var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
    var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
    console.log(templateId);
    var signature = `${valediction} ${name} ${email} ${phone} ${website} ${logo}`;
    if (eventId == 'reply') {
      return `Hi NAME, </br></br>Thank you for your reply.</br></br>${body} ${closing}</br></br>${signature}`;
    }
    return `${opening} ${body} ${closing}</br></br>${signature}`;
  }

  if (userTeam == 'accountServices' || userTeam == 'accountManagement' || userTeam == 'teacherMemberships') {
    if (greeting == 'none') {
      var opening = `Hi NAME, </br></br>`;
    } else {
      var opening = `Hi NAME, </br></br>${greeting}</br></br>`;
    }

    if (closing == 'none') {
      closing = ''
    } else {
      closing = `</br></br>${closing}`;
    }

    return `${opening} ${body} ${closing}`;
  }

  var opening = '';
  if (greeting == 'default' && closing == 'default') {
    greeting = 'Thank you for reaching out to us.';
    opening = `Hi NAME, <br/><br/> ${greeting}`;
    closing = 'Please let me know if you have any questions and I will be happy to help!</br></br>';
    body = `</br></br>${body}</br></br>`;
  } else if ((greeting == 'none' || greeting == ' ' || greeting == '') && (closing != '') && (templateId != `X00_1_Blank_Signature_only`)) {
    greeting = '';
    closing = closing + `</br></br>`;
    body = `</br></br>${body}</br></br>`;
    opening = `Hi NAME, ${greeting}`;
  } else if (templateId == `X00_1_Blank_Signature_only`) {
    return getProgramSignature(program, replyEmail, userTeam, folder);

  } else if ((greeting == 'none' || greeting == ' ' || greeting == '') && (closing == '' || closing == ' ' || closing == 'none') && (templateId != `X00_1_Blank_Signature_only`)) {
    greeting = '';
    closing = '';
    body = `</br></br>${body}</br></br>`;
    opening = `Hi NAME, ${greeting}`;
  } else {
    body = `</br></br>${body}</br></br>`;
    closing = `${closing}</br></br>`;
    opening = `Hi NAME, <br/><br/> ${greeting}`;
  }
  var signature = getProgramSignature(program, replyEmail, userTeam, folder);
  if (eventId == 'reply') {
    return `Hello NAME,<br/><br/> ${greeting} ${body} ${closing} ${signature}`;
  }
  return `${opening} ${body} ${closing} ${signature}`;
}

/**
 * Builds signature. Uses userTeam and template program to determine signature
 * @param  {[type]} program    Name of the program associated with the template
 * @param  {[type]} replyEmail The reply e-mail that will be included in the signature
 * @return {String} Return the complete signature
 */
function getProgramSignature(program, replyEmail, userTeam, folder) {
  program = program.trim();
  replyEmail = replyEmail.trim();
  userTeam = userTeam.trim();
  folder = folder.trim();
  var user = document.getElementById('userFirstName').innerHTML.trim();
  var userEmail = document.getElementById('userEmail').innerHTML.trim();

  if ((userTeam == 'techSupport' || userTeam == 'techSupportCSE') && (program == 'IXL' || program == 'IXLT')) {
    var valediction = ``;
    var name = `<b>${user}</b></br>`;
    var department = 'IXL Support</br></br>';
    var email = `E-mail: ${replyEmail}</br>`;
    var phone = 'Phone: 855.255.6676</br>';
    var website = 'Website: www.ixl.com</br>';
    var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
    var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
    return `${valediction} ${name} ${department} ${email} ${phone} ${website} ${logo}`;

  } else if ((userTeam == 'techSupport' || userTeam == 'techSupportCSE') && (program == 'QW' || program == 'QB' || program == 'QBT')) {
    var valediction = ``;
    var name = `${user}</br>Quia Support</br>`;
    return `${valediction} ${name} ${replyEmail}`;

  } else if (userTeam == 'family') {
    var valediction = ``;
    var name = `<b>${user}</b></br>`;
    var department = 'IXL Membership Specialist</br></br>';
    var email = `E-mail: support@ixl.com</br>`;
    if (folder == 'Family Translated Editions') {
      var phone = 'Phone: 855.255.8800</br>';
    }
    var phone = 'Phone: 855.255.8800</br>';

  } else if (userTeam == 'techSupportCSE') {
    var valediction = ``;
    var name = `<b>${user}</b></br>`;
    var department = 'Customer Support Engineer</br></br>';
    var email = `E-mail: ${userEmail} </br>`;
    if (userEmail == 'rrawlins@ixl.com') {
      var phone = 'Phone: 984-255-7929</br>';
    } else {
      var phone = 'Phone: 984-229-9444</br>';
    }
    var website = 'Website: www.ixl.com</br>';
    var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
    var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
    return `${valediction} ${name} ${department} ${email} ${phone} ${website} ${logo}`;
  } else {
    var phone = 'Phone: 855.255.8800</br>';
  }
  var website = 'Website: www.ixl.com</br>';
  var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
  var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
  return `${valediction} ${name} ${department} ${email} ${phone} ${website} ${logo}`;
}


function handleDrop(e) {
  try {
    var obj = buildObj(e);
    let template = $(e.target).closest(`li[class^='template']`);
    var droppedText = e.dataTransfer.getData('Text').replace(/(\r\n|\n|\r)/gm, ' ');
    if (obj.templateId == 'X1_01_New_Set_up_Teacher_info_NOT_included') {
      var regexSchoolName = /Name\s(.*)\sAcce/;
      var regexCustomDomain = /Custom\s*domain\s*([a-z]*)/;
      var regexPrimaryContact = /([\w-_.]+@(?:\w+(?::\d+)?\.){1,3}(?:\w+\.?){1,2})/;
      var schoolName = regexSchoolName.exec(droppedText)[1];
      var customDomain = regexCustomDomain.exec(droppedText)[1];
      var primaryContact = regexPrimaryContact.exec(droppedText)[1];
      obj.body = obj.body.replace('sent to XXXXX', `sent to ${primaryContact}`);
      obj.body = obj.body.replace('[ORG NAME’s]', `<em>${schoolName}’s</em>`);
      obj.body = obj.body.replace('page at XXXX', `page at <em>https://www.ixl.com/signin/${customDomain}</em>`);
    } else {
      var regex = /Username:\s*([a-z0-9_@]+).*(http[^\s]+)/g;
      var split = regex.exec(droppedText);
      var username = split[1];
      var resetLink = split[2];
      obj.body = obj.body.replace('PASSWORDLINK', `<b>${resetLink}</b>`);
      obj.body = obj.body.replace('USERNAME', `<b>${username}</b>`);
      if (username.includes('@')) {
        obj.body = obj.body.replace('http://www.ixl.com/signin/CUSTOM', `<b>http://www.ixl.com/signin/${username.split('@')[1]}</b>`);
      } else {
        obj.body = obj.body.replace('from your dedicated sign in page', '');
        obj.body = obj.body.replace('http://www.ixl.com/signin/CUSTOM', `<b>http://www.ixl.com/signin</b>`);
        obj.body = obj.body.replace('http://books.quia.com', '<b>http://books.quia.com</b>');
        obj.body = obj.body.replace('http://www.quia.com/web', '<b>http://www.quia.com/web</b>');
        obj.body = obj.body.replace('http://hlc.quia.com', '<b>http://hlc.quia.com</b>');
      }
    }
    copy(buildEmail(obj.body, obj.program, obj.replyEmail, obj.greeting, obj.closing, obj.templateId, obj.userTeam, obj.folder));
    updateRanking(obj.templateId, 'copyFull');
    copiedAlert(e);
  } catch (e) {
    console.log(e);
  }

}

function allowDrop(event) {
  event.preventDefault();
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
  let vettedField = document.getElementById('vetted');
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
  let vetted = document.getElementById(templateId).querySelector('#templateVetted');
  let greeting = document.getElementById(templateId).querySelector('#templateGreeting');
  let closing = document.getElementById(templateId).querySelector('#templateClosing');
  let replyEmail = document.getElementById(templateId).querySelector('#templateReplyEmail');
  if (document.getElementById(templateId).querySelector('#versionDescription0') != null) {
    for (var i = 0; i < 4; i++) {
      var bodyFieldTemp = tinymce.get('version' + i + 'Field').getBody();
      var versionTab = document.getElementById('version' + i + 'Title');
      var versionBodyTemp = document.getElementById(templateId).querySelector('#versionBody' + i);
      var versionDescription = document.getElementById(templateId).querySelector('#versionDescription' + i);
      bodyFieldTemp.innerHTML = versionBodyTemp.innerHTML.trim();
      versionTab.innerHTML = versionDescription.innerHTML.trim();
    }
  }
  let today = new Date().toDateInputValue();
  // Set all form fields equal to this templates fields
  idField.value = templateId;
  nameField.value = name.textContent.trim();
  bodyField.innerHTML = body.innerHTML.trim();
  categoryField.value = category.textContent.trim();
  programField.value = program.textContent.trim();
  tagsField.value = tags.textContent.trim();
  teamField.value = team.textContent.trim();
  publicStatusField.value = publicStatus.textContent.trim();
  vettedField.value = vetted.textContent.trim();
  greetingField.value = greeting.textContent.trim();
  closingField.value = closing.textContent.trim();
  replyEmailField.value = replyEmail.textContent.trim();
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
  let body = tinymce.get('body').getBody().innerHTML.trim();
  let category = document.querySelector('#category').value;
  let program = document.querySelector('#program').value;
  let tags = document.querySelector('#tags').value;
  let team = document.querySelector('#team').value;
  let publicStatus = document.querySelector('#publicStatus').value;
  let vetted = document.querySelector('#vetted').value;
  let greeting = document.querySelector('#greeting').value;
  let closing = document.querySelector('#closing').value;
  let replyEmail = document.querySelector('#replyEmail').value;
  let versions = [];
  for (var i = 0; i < 4; i++) {
    var iFrame = document.querySelector('#version' + i + 'Field_ifr');
    var iFrameContent = iFrame.contentDocument || iframe.contentWindow.document;
    var versionTabName = document.getElementById('version' + i + 'Title').innerHTML.trim();
    var versionText = iFrameContent.body.innerHTML.trim();
    versionTextFormatted = format(versionText);
    versions.push([versionTabName.trim(), versionTextFormatted.trim()]);
  }
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
      'vetted': vetted,
      'greeting': greeting,
      'closing': closing,
      'replyEmail': replyEmail,
      'versions': versions
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {
    window.location.reload()
  })
}

function format(body) {
  body = body.replace(/<div><br><\/div>/g, '<br/>');
  body = body.replace(/<br data-mce-bogus="1">/g, '');
  body = body.replace(/<\/div>/g, '');
  body = body.replace(/<div>/g, '<br/>');
  body = body.replace(/ \'body\': '<br\/>/g, '\'body\': \'');
  body = body.replace(/&nbsp;/g, ' ');
  if (body.substring(0, 5) == '<br/>') {
    body = body.substring(5);
  }
  return body;
}


function updateRanking(templateId, eventId) {
  var rankingElement = document.getElementById(templateId).querySelector('#templateRanking');
  var copyFullElement = document.getElementById(templateId).querySelector('#templateCopyFull');
  var copyPortionElement = document.getElementById(templateId).querySelector('#templateCopyPortion');

  if (eventId == 'copyFull' || eventId == 'templateBody' || eventId == 'versions' || eventId == 'reply') {
    newRanking = parseInt(rankingElement.innerHTML) + 1;
    newFull = parseInt(copyFullElement.innerHTML) + 1;
    newPortion = parseInt(copyPortionElement.innerHTML);
  } else if (eventId == 'copyPortion') {
    newRanking = parseInt(rankingElement.innerHTML) + 1;;
    newFull = parseInt(copyFullElement.innerHTML);
    newPortion = parseInt(copyPortionElement.innerHTML) + 1;
  } else if (eventId == 'clearRank') {
    var newRanking = 0;
    var newFull = 0;
    var newPortion = 0;
  }
  rankingElement.innerHTML = newRanking;
  copyFullElement.innerHTML = newFull;
  copyPortionElement.innerHTML = newPortion;
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
 * Sorts all templates in the dataTable in order
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
for (var m = 0; m < objectsArray.length; m++) {
if (typeof quoteArray[objectsArray[m].objectName] != 'undefined') {
quoteObj.body = quoteObj.body.replace(new RegExp("\\b" + objectsArray[m].objectName.toUpperCase() + "\\b"), quoteArray[objectsArray[m].objectName]);
}
}
 *
 */


function resetQuote(currentQuoteTemplateId) {
  quoteArray.countryCode = null;
  quoteArray.subjectQuantity = null;
  quoteArray.subjectQuantityName = null;
  quoteArray.numberLicenses = null;
  quoteArray.spanishCost = null;
  quoteArray.rebateEndDate = null;
  quoteArray.rebateName = null;
  quoteArray.cost = null;
  quoteArray.type = null;
  tempArray = [];
  elementsToClear = ["accountTypes", "countries", "subjects", "licenses"];
  for (var i = 0; i < elementsToClear.length; i++) {
    var element = document.getElementById(currentQuoteTemplateId).querySelector("." + elementsToClear[i]);
    $(element).children().remove();
    element.style.display = 'none';
  }
  buildingQuote = false;
  spanishClicked = false;
  currentQuoteTemplateId = "";
}


function buildQuote(event) {
  // Gets id of template by looking for closest li element with class name `template`
  buildingQuote = true;
  switch (event.target.id) {
    case "quote":
      console.log(event.target.innerHTML);
      break;
    case "type":
      // 2nd Click
      // User clicked on Type (site or bulk) element
      // Eliminate from TEMP array (keep only ones that match site or bulk)
      drillDown(event.target.id, event);
      tempArray = tempArray.sort(function(a, b) {
        return b.countryCode.localeCompare(a.countryCode);
      });
      // Store type choice in quote array
      quoteArray.type = event.target.innerHTML.trim();
      // Hide site or bulk options for user (change display to `none`)
      removeClickedElements("accountTypes", currentQuoteTemplateId);
      // Display only country codes found in temp array
      displayQuoteElements("countryCode", "countries", currentQuoteTemplateId);
      displayInstructions("selectCountry", "countries", currentQuoteTemplateId, "Select the country...");
      // Create array to check for duplicates

      break;
    case "countryCode":
      // 3rd Click
      // User clicked on countryCode (UK, US, FR, JP) element
      // Eliminate from temp array (keep only ones that match countryCode)
      drillDown(event.target.id, event);
      // Store countryCode choice in QUOTE array
      quoteArray.countryCode = event.target.innerHTML.trim();
      // Hide countryCode options for user (change display to `none`)
      removeClickedElements("countries", currentQuoteTemplateId);
      // Display only subjects found in temp array (including spanish `add` option)
      displayQuoteElements("subjectQuantity", "subjects", currentQuoteTemplateId);
      displayInstructions("selectSubjects", "subjects", currentQuoteTemplateId, "Select the number of subjects...");
      if (quoteArray.countryCode == "US") {
        displaySpanishOption("addSpanish", "subjects", currentQuoteTemplateId, "Spanish?");

      }
      break;
    case "subjectQuantity":
      // 4th Click
      // User clicked on subjectQuantity (1,2,3, etc.) element. Might have selected add-on Spanish
      // Eliminate from temp array (keep only ones that match subject quantity)
      drillDown(event.target.id, event);
      // Store subjectQuantity choice in QUOTE array
      quoteArray.subjectQuantity = event.target.innerHTML.trim();
      // Hide subjectQuantity options for user (change display to `none`)
      removeClickedElements("subjects", currentQuoteTemplateId);
      // Display only licenses found in temp array
      displayQuoteElements("numberLicenses", "licenses", currentQuoteTemplateId);
      displayInstructions("selectLicenses", "licenses", currentQuoteTemplateId, "Select the number of licenses...");
      break;
    case "numberLicenses":
      // 5th Click
      // User clicked on number of licenses (25, 30, 40, etc.) element.
      // Eliminate from temp array (keep only ones that match license number)
      drillDown(event.target.id, event);
      // Store subjectQuantity choice in QUOTE array


      quoteArray.subjectQuantityName = tempArray[0].subjectQuantityName;
      if (spanishClicked) {
        var tempCost = parseInt(tempArray[0].cost) + parseInt(tempArray[0].spanishCost);
        tempArray[0].cost = tempCost;
        if (quoteArray.subjectQuantity == "1") {
          quoteArray.subjectQuantityName = "dual-subject";
        } else if (quoteArray.subjectQuantity == "2") {
          quoteArray.subjectQuantityName = "3-subject";
        } else if (quoteArray.subjectQuantity == "3") {
          quoteArray.subjectQuantityName = "4-subject";
        } else if (quoteArray.subjectQuantity == "4") {
          quoteArray.subjectQuantityName = "5-subject";
        } else {
          console.log('nothing');
        }
      }

      quoteArray.numberLicenses = event.target.innerHTML.trim();
      if (tempArray[0].currencySymbol == '$' && tempArray[0].countryCode != "US") {
        //if currency is from a non-US country, then include currency Symbol with cost.
        quoteArray.cost = tempArray[0].currencySymbol + tempArray[0].cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + tempArray[0].currencyCode;

      } else {
        quoteArray.cost = tempArray[0].currencySymbol + tempArray[0].cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
      quoteArray.spanishCost = tempArray[0].spanishCost;
      quoteArray.rebateEndDate = tempArray[0].rebateEndDate;
      quoteArray.rebateName = tempArray[0].rebateName;
      copyQuote(currentQuoteTemplateId);
      // Hide numberLicenses options for user (change display to `none`)
      removeClickedElements("licenses", currentQuoteTemplateId);
      handleClick(event);
      resetQuote(currentQuoteTemplateId);
      break;
    case "addSpanish":
      spanishClicked = true;
      removeClickedElements("subjects", currentQuoteTemplateId);
      // Display only licenses found in temp array
      displayQuoteElements("subjectQuantity", "subjects", currentQuoteTemplateId);
      displayInstructions("selectSubjects", "subjects", currentQuoteTemplateId, "Select the number of additional subjects...");
      break;
    default:
      // First click
      currentQuoteTemplateId = $(event.target).closest(`li[class^='template']`).attr(`id`);
      // Store all site/bulk objects in TEMP array
      convertedArray = JSON.parse(JSON.stringify(licensesArray));
      for (var i = 0; i < Object.keys(convertedArray).length; i++) {
        tempArray.push(convertedArray[i]);
      }
      tempArray = tempArray.sort(function(a, b) {
        return a.type.localeCompare(b.type);
      });
      // Create QUOTE array
      displayQuoteElements("type", "accountTypes", currentQuoteTemplateId);
  }
}

function displayQuoteElements(key, parentNodeClassName, currentQuoteTemplateId) {
  var elementsShowing = [];
  // create and display elements
  for (var j = 0; j < tempArray.length; j++) {
    // Check to see if the element has already been shown
    if (!elementsShowing.includes(tempArray[j][key])) {
      createElement(key, parentNodeClassName, currentQuoteTemplateId, tempArray[j][key]);
      elementsShowing.push(tempArray[j][key]);
    }
  }
}

function drillDown(key, event) {
  var filteredArray = [];
  for (var k = 0; k < tempArray.length; k++) {
    if (tempArray[k][key] == event.target.innerHTML) {
      filteredArray.push(tempArray[k]);
    }
  }
  tempArray = filteredArray;
}

function createElement(elementId, parentNodeClassName, currentQuoteTemplateId, innerHTML) {
  var parentNode = document.getElementById(currentQuoteTemplateId).querySelector("." + parentNodeClassName);
  var div = document.createElement("DIV");
  div.className = elementId;
  div.id = elementId;
  div.innerHTML = innerHTML;
  div.setAttribute('onclick', 'buildQuote(event)');
  parentNode.style.display = 'grid';
  parentNode.appendChild(div);
}

function displayInstructions(elementId, parentNodeClassName, currentQuoteTemplateId, innerHTML) {
  var parentNode = document.getElementById(currentQuoteTemplateId).querySelector("." + parentNodeClassName);
  var span = document.createElement("SPAN");
  span.className = "instructions";
  span.id = elementId;
  span.innerHTML = innerHTML;
  parentNode.appendChild(span);
}

function displaySpanishOption(elementId, parentNodeClassName, currentQuoteTemplateId, innerHTML) {
  var parentNode = document.getElementById(currentQuoteTemplateId).querySelector("." + parentNodeClassName);
  var div = document.createElement("DIV");
  div.className = elementId;
  div.id = elementId;
  div.setAttribute('onclick', 'buildQuote(event)');
  div.innerHTML = innerHTML;
  parentNode.appendChild(div);
}


function removeClickedElements(className, currentQuoteTemplateId) {
  var parentNode = document.getElementById(currentQuoteTemplateId).querySelector("." + className);
  $(parentNode).children().remove();
  parentNode.style.display = "none";
}


function copyQuote(currentQuoteTemplateId) {
  var quoteObj = new Object();
  quoteObj.program = $(`#` + currentQuoteTemplateId + ` #templateProgram`).text().trim();
  quoteObj.greeting = $(`#` + currentQuoteTemplateId).find(`#templateGreeting`).text();
  quoteObj.closing = $(`#` + currentQuoteTemplateId).find(`#templateClosing`).text();
  quoteObj.userTeam = document.getElementById('userTeam').innerHTML.trim();
  quoteObj.body = document.getElementById(currentQuoteTemplateId).querySelector('#templateBody').innerHTML.trim();
  for (var m = 0; m < objectsArray.length; m++) {
    if (typeof quoteArray[objectsArray[m].objectName] != 'undefined') {
      quoteObj.body = quoteObj.body.replace(new RegExp(`\\[${objectsArray[m].objectName.toUpperCase()}\\]`, "gm"), quoteArray[objectsArray[m].objectName]);
    }
  }
  if (((quoteArray.countryCode == "US") && (spanishClicked || quoteArray.subjectQuantity == 1)) || (quoteArray.countryCode != "US")) {
    quoteObj.body = quoteObj.body.replace(new RegExp(`\\[SPANISHNOTE\\]`, "gm"), ``);
    quoteObj.body = quoteObj.body.replace(new RegExp(`\\[SPANISHASTERISK\\]`, "gm"), ``);
  } else {
    quoteObj.body = quoteObj.body.replace(new RegExp(`\\[SPANISHNOTE\\]`, "gm"), `Pricing does not include Spanish. `);
    quoteObj.body = quoteObj.body.replace(new RegExp(`\\[SPANISHASTERISK\\]`, "gm"), `*`);
  }
  copy(buildEmail(quoteObj.body, quoteObj.program, "None", quoteObj.greeting, quoteObj.closing, currentQuoteTemplateId, quoteObj.userTeam.trim(), "None", "copyFull"));
}

function loadLicenseFields(event) {
  licenseId = event.target.id.substring(1);
  databaseId = licenseId;
  $('div', '#' + licenseId).each(function() {
    if (typeof $(this).attr('id') != 'undefined') {
      var elementValue = $(event.target).closest(`#` + licenseId).find(`#${$(this).attr('id')}`).text().trim();
      if ($(this).attr('id') == "cost" || $(this).attr('id') == "rebateCost" || $(this).attr('id') == "spanishCost") {
        var currencySymbol = $(event.target).closest(`#` + licenseId).find(`#currencySymbol`).text().trim();
        elementValue = elementValue.replace(currencySymbol, "").trim();
      }
      var elementField = document.getElementById(`editLicenseFields`).querySelector(`#${$(this).attr('id')}`);
      elementField.value = elementValue;
      elementIds.push($(this).attr('id'));
    }
  });
}


function addLicense(event) {
  $('#addLicense').modal('hide');
  var addLicenseValues = {};
  var addLicenseElementIds = ["type", "countryCode", "subjectQuantity", "numberLicenses", "cost", "rebateId", "rebateCost", "spanishCost"]
  for (var k = 0; k < addLicenseElementIds.length; k++) {
    if (addLicenseElementIds[k] == 'countryCode' || addLicenseElementIds[k] == 'rebateId' || addLicenseElementIds[k] == 'type') {
      var e = document.getElementById(`addLicenseFields`).querySelector('#' + addLicenseElementIds[k]);
      addLicenseValues[addLicenseElementIds[k]] = e.options[e.selectedIndex].text.trim();
    } else {
      addLicenseValues[addLicenseElementIds[k]] = document.getElementById(`addLicenseFields`).querySelector('#' + addLicenseElementIds[k]).value.trim();
    }
  }
  fetch('addLicense', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': 'DEFAULT',
      'cost': addLicenseValues.cost.trim(),
      'countryCode': addLicenseValues.countryCode.trim(),
      'type': addLicenseValues.type.trim(),
      'spanishCost': addLicenseValues.spanishCost.trim(),
      'subjectQuantity': addLicenseValues.subjectQuantity.trim(),
      'numberLicenses': addLicenseValues.numberLicenses.trim(),
      'rebateCost': addLicenseValues.rebateCost.trim(),
      'rebateId': addLicenseValues.rebateId.trim()
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {})
  document.location.reload();
}


function updateLicense(event) {
  $('#manageLicenses').modal('hide');
  for (var k = 0; k < elementIds.length; k++) {
    if (elementIds[k] == 'countryCode' || elementIds[k] == 'rebateId') {
      licenseValuesObject[elementIds[k]] = $("#" + elementIds[k] + " :selected").text().trim();
    } else {
      licenseValuesObject[elementIds[k]] = document.getElementById(`editLicenseFields`).querySelector('#' + elementIds[k]).value.trim();
    }
  }
  document.location.reload();
  fetch('updateLicense', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': databaseId.trim(),
      'cost': licenseValuesObject.cost.trim(),
      'countryCode': licenseValuesObject.countryCode.trim(),
      'type': licenseValuesObject.type.trim(),
      'spanishCost': licenseValuesObject.spanishCost.trim(),
      'subjectQuantity': licenseValuesObject.subjectQuantity.trim(),
      'numberLicenses': licenseValuesObject.numberLicenses.trim(),
      'rebateCost': licenseValuesObject.rebateCost.trim(),
      'rebateId': licenseValuesObject.rebateId.trim()

    })
  }).then(res => {
    if (res.ok) {
      console.log(res.json());

    }
  }).then(data => {})
}

function deleteLicense() {
  $('#manageLicenses').modal('hide');
  document.location.reload();
  fetch('deleteLicense', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id': databaseId
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {})
}

function removeLicenseFromDOM(id) {
  console.log(`[id^="${id}"]`);
  var licenseToRemove = $(`[id^="${id}"]`);
  licenseToRemove.remove();
}

initialize()