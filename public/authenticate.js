function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  authenticate(profile);
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function() {
    console.log('User signed out.');
  });
}

function authenticate(profile) {
  // check user against database
  // If exists, sign in, authenticate-step-2 and create new
  if (profile.getId != null) {

    checkUser(profile.getId());
  }

}

function checkUser(userId) {
  console.log(userId);
  window.location = 'items';
}
