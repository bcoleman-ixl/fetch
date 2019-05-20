 $('#updateNewUser').click(function(e) {
   var team = camelize(document.getElementsByClassName('filter-option-inner-inner')[0].innerHTML);
   var programs = document.getElementsByClassName('filter-option-inner-inner')[1].innerHTML;
   programs = programs.split(',');
   for (var i = 0; i < programs.length; i++) {
     programs[i] = programs[i].trim();
   }
   if (team == 'nothingSelected' || programs[0] == 'Nothing selected') {
     alert('Please make a selection')
   } else {
     $.ajax({
       global: false,
       type: 'PUT',
       url: '/updateNewUser',
       dataType: 'json',
       data: {
         googleID: googleID,
         programs: programs,
         team: team
       },
       success: function(result) {
         console.log('success');
         location.href = "http://scruffy.quiacorp.com:3000/home"

       },
       error: function(request, status, error) {
         console.log(error);
       }
     });
   }
 });

 $('#userTable').click(function(e) {
   if (e.target.id == 'updateUser') {
     e.preventDefault();
     var jsonObj = null;
     var googleID = null;

     $('.json').each(function() {
       if (($(this).html()).includes(e.target.parentNode.id)) {
         jsonObj = JSON.parse($(this).html());
         googleID = e.target.parentNode.id;
       }
     });
     $.ajax({
       global: false,
       type: 'PUT',
       url: '/updateUser',
       dataType: 'json',
       data: {
         jsonObj: JSON.stringify(jsonObj),
         googleID: googleID
       },
       success: function(result) {
         console.log('success');
       },
       error: function(request, status, error) {
         console.log(error);
       }
     });
   } else if (e.target.id == 'deleteUser') {
     e.preventDefault();
     var jsonObj = null;
     var googleID = null;

     $('.json').each(function() {
       if (($(this).html()).includes(e.target.parentNode.id)) {
         jsonObj = JSON.parse($(this).html());
         googleID = e.target.parentNode.id;
       }
     });
     $.ajax({
       global: false,
       type: 'DELETE',
       url: '/deleteUser',
       dataType: 'json',
       data: {
         googleID: googleID
       },
       success: function(result) {
         console.log('success');
       },
       error: function(request, status, error) {
         console.log(error);
       }
     });
   } else {}
 });

 $('#templateTable').click(function(e) {
   if (e.target.id == 'updateTemplate') {
     e.preventDefault();
     var jsonObj = null;
     var id = null;

     $('.json').each(function() {
       if (($(this).html()).includes(e.target.parentNode.id)) {
         jsonObj = JSON.parse($(this).html());
         id = e.target.parentNode.id;
       }
     });
     $.ajax({
       global: false,
       type: 'PUT',
       url: '/updateTemplateJSON',
       dataType: 'json',
       data: {
         jsonObj: JSON.stringify(jsonObj),
         id: id
       },
       success: function(result) {
         console.log(result);
         console.log('successupdate');
       },
       error: function(request, status, error) {
         console.log(error);
       }
     });
   } else if (e.target.id == 'deleteTemplate') {
     e.preventDefault();
     var jsonObj = null;
     var googleID = null;

     $('.json').each(function() {
       if (($(this).html()).includes(e.target.parentNode.id)) {
         jsonObj = JSON.parse($(this).html());
         id = e.target.parentNode.id;
       }
     });
     $.ajax({
       global: false,
       type: 'DELETE',
       url: '/deleteTemplate',
       dataType: 'json',
       data: {
         id: id
       },
       success: function(result) {
         console.log('success');
       },
       error: function(request, status, error) {
         console.log(error);
       }
     });
   } else {}
 });

 function saveTemplate(e) {
   if (e.target.innerHTML == 'Submit') {
     var templateName = $('#name').val().trim();
     try {
       var versions = getVersions();
       e.preventDefault();
       $.ajax({
         global: false,
         type: 'POST',
         url: '/createTemplate',
         dataType: 'html',
         data: {
           name: $('#name').val().trim(),
           greeting: $('#greeting').val().trim(),
           versions: versions,
           closing: $('#closing').val().trim(),
           category: $('#category').val().trim(),
           program: $('#program').val().trim(),
           id: $('#id').val().trim(),
           updatedDate: $('#updatedDate').val().trim(),
           addedByUser: $('#userEmail').html().trim(),
           lastUpdatedByUser: $('#userEmail').html().trim(),
           ranking: 0,
           copyFull: 0,
           copyPortion: 0,
           team: $('#team').val().trim(),
           publicStatus: $('#publicStatus').val().trim(),
           replyEmail: $('#replyEmail').val().trim(),
           tags: $('#tags').val().trim(),
           vetted: $('#vetted').val().trim()
         },
         success: function(result) {
           $('#saveTemplates').modal('hide');
           alertUser('Added', templateName + '. Please refresh to see the template.');
         },
         error: function(request, status, error) {
           console.log(error);
           console.warn(request.responseText);
           $('#saveTemplates').modal('hide');
         }
       });

     } catch (e) {
       alert('Please fill out all required fields');
       console.log(e);
     }
   } else {
     var currentUserEmail = document.getElementById("userEmail").innerHTML.trim();
     try {
       var versions = getVersions();
       $.ajax({
         global: false,
         type: 'PUT',
         url: '/updateTemplate',
         dataType: 'json',
         data: {
           name: $('#name').val().trim(),
           greeting: $('#greeting').val().trim(),
           versions: versions,
           closing: $('#closing').val().trim(),
           category: $('#category').val().trim(),
           program: $('#program').val().trim(),
           id: $('#id').val().trim(),
           updatedDate: $('#updatedDate').val().trim(),
           lastUpdatedByUser: currentUserEmail,
           team: $('#team').val().trim(),
           publicStatus: $('#publicStatus').val().trim(),
           replyEmail: $('#replyEmail').val().trim(),
           tags: $('#tags').val().trim(),
           vetted: $('#vetted').val().trim()
         },
         success: function(result) {
           updateTemplate($('#id').val().trim());
           $('#saveTemplates').modal('hide');
         },
         error: function(request, status, error) {
           console.log(error);
         }
       });

     } catch (e) {
       alert('Please fill out all required fields');

     }

   }
 }

 function saveArticle(e) {
   if (e.target.innerHTML == 'Submit') {
     var articleName = $('#name').val().trim();
     var body = tinymce.get('version0Field').getBody().innerHTML;
     body = format(body);
     try {
       e.preventDefault();
       $.ajax({
         global: false,
         type: 'POST',
         url: '/createArticle',
         dataType: 'html',
         data: {
           name: $('#name').val().trim(),
           category: $('#category').val().trim(),
           program: $('#program').val().trim(),
           article: body,
           id: $('#id').val().trim(),
           updatedDate: $('#updatedDate').val().trim(),
           addedByUser: $('#userEmail').html().trim(),
           lastUpdatedByUser: $('#userEmail').html().trim(),
           ranking: 0,
           team: $('#team').val().trim(),
           publicStatus: $('#publicStatus').val().trim(),
           tags: $('#tags').val().trim()
         },
         success: function(result) {
           $('#saveArticles').modal('hide');
           alertUser('Added', articleName + '. Please refresh to see the article.');
         },
         error: function(request, status, error) {
           console.log(error);
           console.warn(request.responseText);
           $('#saveArticles').modal('hide');
         }
       });

     } catch (e) {
       alert('Please fill out all required fields');
       console.log(e);
     }
   } else {
     var currentUserEmail = document.getElementById("userEmail").innerHTML.trim();
     try {
       $.ajax({
         global: false,
         type: 'PUT',
         url: '/updateArticle',
         dataType: 'json',
         data: {
           name: $('#name').val().trim(),
           category: $('#category').val().trim(),
           program: $('#program').val().trim(),
           id: $('#id').val().trim(),
           updatedDate: $('#updatedDate').val().trim(),
           lastUpdatedByUser: currentUserEmail,
           team: $('#team').val().trim(),
           publicStatus: $('#publicStatus').val().trim(),
           tags: $('#tags').val().trim()
         },
         success: function(result) {
           updateTemplate($('#id').val().trim());
           $('#saveArticles').modal('hide');
         },
         error: function(request, status, error) {
           console.log(error);
         }
       });

     } catch (e) {
       alert('Please fill out all required fields');

     }

   }
 }

 function getVersions() {
   var versions = [];
   for (var i = 0; i < 5; i++) {
     var body = tinymce.get('version' + i + 'Field').getBody().innerHTML;
     body = format(body);
     var title = $('#version' + i + 'Title').html();
     title = title.replace(/(\r\n|\n|\r)/gm, "").trim();
     body = body.replace(/<br data-mce-bogus="1">/gm, "");
     versions[i] = [title, body.trim()];
   }
   return versions;
 }

 function camelize(str) {
   return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
     return index == 0 ? word.toLowerCase() : word.toUpperCase();
   }).replace(/\s+/g, '');
 }