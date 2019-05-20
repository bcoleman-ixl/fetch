function initializeTemplates() {
  var date = new Date().toDateInputValue();
  document.getElementById('updatedDate').value = MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  var dataTable = document.querySelector('#data-table');
  dataTable.addEventListener('click', handleClick, false);
  dataTable.addEventListener('drop', handleDrop, false);
}

document.addEventListener('DOMContentLoaded', function() {
  dataTable = document.getElementById('data-table');
  loader = document.getElementById('loader');
  dataTable.style.display = 'flex';
  $('#loader').children().css({
    'display': 'none'
  });
  $('#loader').children().addClass('stopAnimation');
  search();
}, false);

initializeTemplates();