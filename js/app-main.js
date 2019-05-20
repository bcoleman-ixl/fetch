/**
 * Main script for application. Handles clicks, ranking,
 * sorting, and operations for creating, updating,
 * deleting, and copying templates.
 */
// Constants and function for creating the updated date
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const FORM_ELEMENTS = [
  'name',
  'category',
  'closing',
  'greeting',
  'id',
  'program',
  'publicStatus',
  'replyEmail',
  'tags',
  'team',
  'vetted',
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
  document.getElementById('mySidenav').style.width = '300px';
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
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
  This is a comment
  */

  // SIngle line

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
  var userType = document.getElementById('userType').innerHTML.trim();
}

function updateDarkMode() {
  var email = document.getElementById('userEmail').innerHTML.trim();
  var darkModeValue = document.getElementById('userDarkModeValue').innerHTML.trim();
  darkModeValue = darkModeValue == 'true';
  fetch('updateDarkMode', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'email': email,
      'darkModeValue': darkModeValue
    })
  }).then(res => {
    if (res.ok) return res.json()
  }).then(data => {
    window.location.reload(true);
  })
}

var searchByClick = document.getElementsByClassName('searchByClick');

for (var i = 0; i < searchByClick.length; i++) {
  searchByClick[i].addEventListener('click', handleSearchByClick, false);
}

function handleSearchByClick(e) {
  var id = null;
  if (e.target.id == null || e.target.id == '') {
    id = e.target.parentNode.id;
  } else {
    id = e.target.id;
  }
  switch (id) {
    case 'vetted':
      appendSearch('#vetted=yes');
      break;
    case 'notVetted':
      appendSearch('#vetted=no #publicStatus=true');
      break;
    case 'notVettedUser':
      userEmail = document.getElementById('userEmail').innerHTML.trim();
      appendSearch('#user=' + userEmail + ' #publicStatus=false');
      break;
    case 'vettedIcon':
      appendSearch('#vetted=yes');
      break;
    case 'notVettedIcon':
      appendSearch('#vetted=no #publicStatus=true');
      break;
    case 'notVettedUserIcon':
      userEmail = document.getElementById('userEmail').innerHTML.trim();
      appendSearch('#user=' + userEmail + ' #publicStatus=false');
      break;
    case 'templateCategory':
      var target = e.target || e.srcElement;
      appendSearch('#category=' + target.innerHTML.trim().toLowerCase());
      break;
    case 'templateProgram':
      var target = e.target || e.srcElement;
      appendSearch('#program=' + target.innerHTML.trim().toUpperCase());
      break;
    default:
      console.log('default search by click switch');
  }

}

function appendSearch(textToAppend) {
  $('#searchBar').val($('#searchBar').val() + ' ' + textToAppend);
  search();
}

// Scrolls to top, focuses on search box and highlights text
$(document).on('keydown', function(e) {
  var kc = e.which || e.keyCode;
  if (e.ctrlKey && String.fromCharCode(kc).toUpperCase() == 'K') {
    e.preventDefault();
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $('#searchBar').focus();
    $('#searchBar').select();
  }
});

Date.prototype.toDateInputValue = (function() {
  var local = new Date(this);
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
 * Looks for # in URL and loads value into searchBar
 */
var hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
if (hashParams[0] == '') {} else {
  for (var i = 0; i < hashParams.length; i++) {
    var p = hashParams[i].split('=');
    document.getElementById('searchBar').value = decodeURIComponent(p[0]);;
  }

}

/**
 * Clears search box when x is clicked, search() Function
 * is also fired to resort list.
 */
$('#clearSearch').click(function() {
  /**
  if ($(this).css("transform") == 'none') {
    $(this).css("transform", "rotate(360deg)");
  } else {
    $(this).css("transform", "");
  } */
  document.getElementById('searchBar').value = '';
  reset();
  // Places cursor back in search box
  $('#searchBar').focus();
});

$('#empty').click(function() {});

/* Functions for template modal */

/**
 * When Manage Templates modal is hidden,
 * form fields, method, and action are reset
 */
$('#saveTemplates').on('hidden.bs.modal', function() {
  $('#templatesForm').find('input:text').val('');
  $('#templatesForm').find('select').each(function() {
    this.selectedIndex = 0;
  });
  document.getElementById('saveTemplatesTitle').innerHTML = 'Add new template';
  for (var i = 0; i <= 4; i++) {
    var bodyField = tinymce.get('version' + i + 'Field').getBody();
    var versionTab = document.getElementById('version' + i + 'Title');
    bodyField.innerHTML = '';
    if (i == 0) {
      versionTab.innerHTML = ('Main');
    } else {
      versionTab.innerHTML = ('Version' + i);
    }
  }
  var templateModalBtn = document.getElementById('saveTemplate');
  templateModalBtn.innerHTML = 'Submit';

});

/* Prevents colors from sticking on button operations when clicked */
$('.btn').mouseup(function() {
  $(this).blur();
})

/**
 * Generates a unique alphanumeric ID for each template. Template
 * ID is set when the function completes. setId() function
 * is fired each time user clicks add new template link in the
 * account menu.
 */
function setId() {
  var id = '';
  var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // Number 100 - 999
  for (var k = 0; k < 18; k++) {
    if (k % 2 > 0) {
      id += Math.floor(Math.random() * 9) + 1;

    } else {
      id += digits.charAt(Math.floor((Math.random() * 25)));
    }
  }
  document.getElementById('id').value = id;

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
 * 7. The template greeting ('Thank you for reaching...')
 * 8. The template closing ('Please let me know if you have any questions...')
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
      alertUser('Copied:', document.getElementById(obj.templateId).querySelector('#templateName').innerHTML);
      updateRanking(obj.templateId, obj.eventId);
      /**
       * If copyPortion is clicked, then execute the following:
       * 1. Alert user that the template has been copied.
       * 3. Copy the body of the template using the copy() function.
       * 4. Update the ranking of this template.
       */
    } else if (e.target !== e.currentTarget && obj.eventId == 'reply') {
      copy(buildEmail(obj.body, obj.program, obj.replyEmail, 'Thank you for your reply.', obj.closing, obj.templateId, obj.userTeam, obj.folder, obj.eventId));
      alertUser('Copied:', document.getElementById(obj.templateId).querySelector('#templateName').innerHTML);
      updateRanking(obj.templateId, obj.eventId);

    } else if (e.target !== e.currentTarget && obj.eventId == 'share') {
      copy('http://scruffy.quiacorp.com:3000/home' + '#' + obj.templateId);

    } else if (e.target !== e.currentTarget && obj.eventId == 'copyPortion') {
      copy(obj.body);
      alertUser('Copied:', document.getElementById(obj.templateId).querySelector('#templateName').innerHTML);
      updateRanking(obj.templateId, obj.eventId);

      /* If trash (or remove) button was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'removeConfirm') {
      // Grab elements to load template name and id into these elements
      var confirmRemoveName = document.getElementById('confirmRemoveName');
      var confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
      // Grab name of template to be removed
      var nameToRemove = document.getElementById(obj.templateId).querySelector('#templateName');
      // Set to display name of item to be removed, set btn id to template id
      confirmRemoveName.innerHTML = nameToRemove.innerHTML.trim();
      confirmRemoveBtn.id = obj.templateId;

      // Display the confirmation box
      $('#confirmRemoveDialog').modal('show');

      /* If snippets icon was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'snippets') {
      // Get the template body and the body field element. Display just the template body.
      $('#snippetsView').modal('show');
      loadSnippetsModal(obj);

      // Display the modal
      updateRanking(obj.templateId, 'copyPortion');

      /* If a version was clicked for copying */
    } else if (e.target !== e.currentTarget && versionsRegex.test(obj.eventId)) {
      var versionsBody = document.getElementById(obj.templateId).querySelector('#versionBody' + (obj.eventId).substr(obj.eventId.length - 1));
      copy(buildEmail(versionsBody.innerHTML, obj.program, obj.replyEmail, obj.greeting, obj.closing, obj.templateId, obj.userTeam, obj.folder, obj.eventId));
      alertUser('Copied:', document.getElementById(obj.templateId).querySelector('#templateName').innerHTML);
      updateRanking(obj.templateId, 'copyFull');
      var versionsElementToHide = document.getElementById(obj.templateId).querySelector('.versions');
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
      var versionsElement = document.getElementById(obj.templateId).querySelector('.versions');
      versionsDisplay(versionsElement);
      /* If info button was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'info') {
      var infoElement = document.getElementById(obj.templateId).querySelector('.tooltiptext');
      infoDisplay(infoElement);
      /* If edit button was clicked */
    } else if (e.target !== e.currentTarget && obj.eventId == 'edit') {
      //  Show manage teampltes modal
      $('#saveTemplates').modal('show');
      // Load all elements into the modal
      editTemplate(obj.templateId);
    } else {
      e.stopPropagation();
    }
  }
}

function loadSnippetsModal(obj) {
  // Grab snippets fields
  // var bodyField = document.getElementById('version0Snippet');
  // var templateBody = document.getElementById(obj.templateId).querySelector('#templateBody');
  // bodyField.innerHTML = templateBody.innerHTML.trim();
  // Grab version body and insert into snippets modal field


  for (var i = 0; i < 5; i++) {
    // Get modal fields
    var modalVersionTitle = document.getElementById('version' + i + 'SnippetTitle');
    var modalVersionBody = document.getElementById('version' + i + 'Snippet');
    if (i == 0) {
      var thisVersionBody = document.getElementById(obj.templateId).querySelector('#templateBody').innerHTML
      var thisVersionTitle = 'Main';
    } else {
      var thisVersionTitle = document.getElementById(obj.templateId).querySelector('#versionDescription' + i).innerHTML;
      var thisVersionBody = document.getElementById(obj.templateId).querySelector('#versionBody' + i).innerHTML;
    }

    modalVersionTitle.innerHTML = thisVersionTitle.trim();
    modalVersionBody.innerHTML = thisVersionBody.trim();
    if (i == 0 && document.getElementById(obj.templateId).querySelector('#versionDescription1') == null) {
      for (var i = 1; i < 5; i++) {
        // Get modal fields
        var modalVersionTitle = document.getElementById('version' + i + 'SnippetTitle');
        var modalVersionBody = document.getElementById('version' + i + 'Snippet');
        modalVersionTitle.innerHTML = '';
        modalVersionBody.innerHTML = '';
        var tabs = document.querySelector('#snippetTitles').getElementsByTagName('LI');
        console.log(tabs);
        $('#' + obj.templateId + ' #snippetTitles li').each(function(i) {
          console.log($(this)); // This is your rel value
        });

      }
      break;
    }

  }
  // Set all form fields equal to this templates fields

}

function alertUser(message, objectName) {
  var alertObj = document.getElementById('alertUser');

  $(alertObj).html('<b>' + message + ' ' + objectName + '</b>');
  if (message == 'Updated' || message == 'Added') {
    time = 5000;
  } else {
    time = 2000;
  }
  $(alertObj).addClass('animateCopied');
  setTimeout(function() {
      $(alertObj).removeClass('animateCopied');
    },
    time);


}

function handleFilterClick(e) {
  filterView(e.target);
}

function resetStyle(e) {
  e.target.style.backgroundColor = '';
  e.target.style.border = '';
}

function showOptions() {
  document.getElementById('myDropdown').classList.toggle('show');
}

function versionsDisplay(versionsElement) {
  if (versionsElement.style.opacity < 1) {
    versionsElement.style.opacity = 1;
    versionsElement.style.display = 'table-row';

  } else {
    versionsElement.style.opacity = 0;
    versionsElement.style.display = 'none';
  }
}

function infoDisplay(infoElement) {
  if (infoElement.style.opacity < 1) {
    infoElement.style.opacity = 1;
    infoElement.style.display = 'inline';
    infoElement.style.zIndex = 1;

  } else {
    infoElement.style.opacity = 0;
    infoElement.style.zIndex = 0;
    infoElement.style.display = 'none';
  }
}

function buildObj(e) {
  var obj = new Object();
  var templateId = $(e.target).closest(`li[class^='template']`).attr('id');
  obj.templateId = templateId;
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
  var container = document.createElement('div');
  container.innerHTML = html;
  container.style.opacity = 100;
  var activeSheets = Array.prototype.slice.call(document.styleSheets)
    .filter(function(sheet) {
      return !sheet.disabled;
    });
  document.body.appendChild(container);
  window.getSelection().removeAllRanges();
  var range = document.createRange();
  range.selectNode(container);
  window.getSelection().addRange(range);
  document.execCommand('copy');
  document.body.removeChild(container)
}

function trimElement(element) {
  if (typeof element != 'undefined') {
    return element.trim();
  }
  return '';
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
    return getProgramSignature(program, replyEmail, userTeam, folder, templateId);

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
  var signature = getProgramSignature(program, replyEmail, userTeam, folder, templateId);
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
function getProgramSignature(program, replyEmail, userTeam, folder, templateId) {
  program = program.trim();
  replyEmail = replyEmail.trim();
  userTeam = userTeam.trim();
  folder = folder.trim();
  var user = document.getElementById('userFirstName').innerHTML.trim();
  var userEmail = document.getElementById('userEmail').innerHTML.trim();
  if (

    ((userTeam == 'techSupport' || userTeam == 'customerSupportEngineer') &&
      (program == 'IXL' || program == 'IXLT')) || (userEmail == 'kgrant@ixl.com' && program == 'IXL')

  ) {
    var valediction = ``;
    var name = `<b>${user}</b></br>`;
    var department = 'IXL Support</br></br>';
    var email = `E-mail: ${replyEmail}</br>`;
    var phone = 'Phone: 855.255.6676</br>';
    var website = 'Website: www.ixl.com</br>';
    var logoLocation = `'https://c.na57.content.force.com/servlet/servlet.ImageServer?id=0150b0000027zq8&oid=00D300000001FBU&lastMod=1495736864000'`
    var logo = `<img src= ${logoLocation} alt='ixl-logo'>`;
    templateIdWhite = `<br><p hidden> ${templateId} </p>`;
    return `${valediction} ${name} ${department} ${email} ${phone} ${website} ${logo} ${templateIdWhite}`;

  } else if ((userTeam == 'techSupport' || userTeam == 'customerSupportEngineer') && (program == 'QW' || program == 'QB' || program == 'QBT')) {
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

  } else if (userTeam == 'customerSupportEngineer') {
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
    var template = $(e.target).closest(`li[class^='template']`);
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
        obj.body = obj.body.replace('www.ixl.com/signin/CUSTOM', `www.ixl.com/signin`);
        obj.body = obj.body.replace('http://books.quia.com', '<b>http://books.quia.com</b>');
        obj.body = obj.body.replace('http://www.quia.com/web', '<b>http://www.quia.com/web</b>');
        obj.body = obj.body.replace('http://hlc.quia.com', '<b>http://hlc.quia.com</b>');
      }
    }
    copy(buildEmail(obj.body, obj.program, obj.replyEmail, obj.greeting, obj.closing, obj.templateId, obj.userTeam, obj.folder));
    updateRanking(obj.templateId, 'copyFull');

    alertUser('Copied:', document.getElementById(obj.templateId).querySelector('#templateName').innerHTML);
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
function deleteTemplate(e) {
  fetch('deleteTemplate', {
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
  var formElements = FORM_ELEMENTS;
  for (var i = 0; i < formElements.length; i++) {
    var formField = document.getElementById(formElements[i]);
    var valueToInsert = document.getElementById(templateId).querySelector('#template' + formElements[i].charAt(0).toUpperCase() + formElements[i].slice(1));
    formField.value = valueToInsert.textContent.trim();
  }

  var mainBody = document.getElementById(templateId).querySelector('#templateBody');
  var bodyField = tinymce.get('version0Field').getBody();
  bodyField.innerHTML = mainBody.innerHTML;

  if (document.getElementById(templateId).querySelector('#versionDescription1') != null) {
    for (var i = 1; i < 5; i++) {
      // Grab elements on the page and insert data in to those elements.
      var versionTitle = document.getElementById('version' + i + 'Title');
      var bodyField = tinymce.get('version' + i + 'Field').getBody();
      // Grab the data
      var versionBodyElement = document.getElementById(templateId).querySelector('#versionBody' + i);
      var versionDescription = document.getElementById(templateId).querySelector('#versionDescription' + i);
      bodyField.innerHTML = versionBodyElement.innerHTML.trim();
      versionTitle.innerHTML = versionDescription.innerHTML.trim();
    }
  }

  var today = new Date().toDateInputValue();

  // Change title of template to 'Edit template'
  document.getElementById('saveTemplatesTitle').innerHTML = 'Edit template';
  var templateModalBtn = document.getElementById('saveTemplate');
  templateModalBtn.innerHTML = 'Update';

}

// Updates user view with new updates to a template
function updateTemplate(templateId) {
  var currentCategory = document.getElementById(templateId).querySelector('#templateCategory').innerHTML.trim().toLowerCase();
  var formElements = FORM_ELEMENTS;
  for (var i = 0; i < formElements.length; i++) {
    var formFieldValue = document.getElementById(formElements[i]).value;
    formFieldValue = format(formFieldValue);
    var templateField = document.getElementById(templateId).querySelector('#template' + formElements[i].charAt(0).toUpperCase() + formElements[i].slice(1));
    if (document.getElementById(templateId).querySelector('#' + formElements[i] + 'HashtagSearch') != null) {
      var hashtagSearchElement = document.getElementById(templateId).querySelector('#' + formElements[i] + 'HashtagSearch');
      hashtagSearchElement.innerHTML = '#' + formElements[i] + '=' + document.getElementById(formElements[i]).value;
    }
    if (formElements[i] == 'program') {
      hiddenProgramSearch = document.getElementById(templateId).querySelector('#templateProgramWithHash');
      hiddenProgramSearch.innerHTML = '#' + formFieldValue.trim();
      templateField.innerHTML = formFieldValue.trim() + ' ';
    } else {
      templateField.innerHTML = formFieldValue.trim();
    }
  }
  var mainBody = document.getElementById(templateId).querySelector('#templateBody');
  var bodyField = tinymce.get('version0Field').getBody();
  mainBody.innerHTML = bodyField.innerHTML;
  for (var i = 1; i < 5; i++) {
    // get version title and content
    var versionTitle = document.getElementById('version' + i + 'Title').innerHTML;
    var bodyField = tinymce.get('version' + i + 'Field').getBody();
    var versionBodyElement = document.getElementById(templateId).querySelector('#versionBody' + i);
    var versionDescription = document.getElementById(templateId).querySelector('#versionDescription' + i);
    if (versionDescription != null && versionBodyElement != null) {
      versionDescription.innerHTML = versionTitle;
      versionBodyElement.innerHTML = bodyField.innerHTML;
    }
  }




  // Update class name for category element
  var newCategory = document.getElementById(templateId).querySelector('#templateCategory').innerHTML.trim();
  var element = document.getElementById(templateId).querySelector('#templateCategory');
  element.classList.remove(currentCategory.substr(0, 5).toLowerCase().trim());
  element.classList.add(newCategory.substr(0, 5).toLowerCase().trim());




  // Update Vetted icon
  // Build out alert icon
  alertUser('Updated', document.getElementById('name').value);
}

function format(body) {
  body = body.replace(/<div><br><\/div>/g, '<br/>');
  body = body.replace(/<br data-mce-bogus='1'>/g, '');
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
  var list = document.getElementById('data-table');
  var li = null;
  var shouldSwitch = false;
  var switching = true;
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