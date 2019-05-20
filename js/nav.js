// NOTE: Side navbar
function initializeNav() {
  var updateDarkModeToggle = document.querySelector('#updateDarkMode');
  updateDarkModeToggle.addEventListener('click', updateDarkMode, false);
}
/* Set the width of the side navigation to 250px */
function openNav() {
  document.getElementById('mySidenav').style.width = '300px';
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
}

initializeNav();