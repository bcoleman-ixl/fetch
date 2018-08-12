var searchLogArr = new Array();

function filterView(filterElement) {
  if (filterElement.id == 'programFilter') {
    document.getElementById("myDropdown").classList.toggle("show");
    for (k = 0; k < li.length; k++) {
      let item = li[k];
      if (item.querySelector('#templateProgram').innerHTML == filterElement.innerHTML) {
        item.style.display = '';
      }
    }
  } else if(filterElement.id == 'personalFilter'){
    for (k = 0; k < li.length; k++) {
      let item = li[k];
      if (item.querySelector('#templatePublicStatus').innerHTML == 'false') {
        item.style.display = '';
      }
    }
  } else if(filterElement.id == 'resetFilter') {
    for (k = 0; k < li.length; k++) {
      let item = li[k];
      item.style.display = 'none';
    }
  }
}
