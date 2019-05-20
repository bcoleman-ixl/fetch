/**
 * Functions for informal quote generator for Teacher Membership team
 * buildQuote()
 * displayQuoteElements()
 * drillDown()
 * createElement()
 * displayInstructions()
 * displaySpanishOption()
 * removeClickedElements()
 * copyQuote()
 * loadLicenseFields()
 * addLicense()
 * updateLicense()
 * deleteLicense()
 * removeLicenseFromDOM()
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
      alertUser('Copied', ' Quote');
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
  fetch('createLicense', {
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
      console.console.log();
      (res.json());

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