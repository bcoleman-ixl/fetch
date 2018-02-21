tinymce.init({
  selector: "#editor",
  plugins: "lists, advlist, textcolor, colorpicker",
  // TODO: Need to organize toolbar
  toolbar: [
    'undo redo | styleselect | bold italic | link image | alignleft | aligncenter | alignright | forecolor | backcolor'
  ]
});

var update = document.getElementById('update');

update.addEventListener('click', function() {
  fetch('template-update', {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'name': 'Updated Name',
    })
  })
});
