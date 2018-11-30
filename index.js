var testHeading = document.getElementById("testHeading");

firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    var user = firebase.auth().currentUser;
    if(user != null){
      var email_id = user.email;
      document.getElementById("user_para").innerHTML = "Logged in as : " + email_id;
    }

  } else {
    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";
  }
});

function login(){
  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    window.alert("Error : " + errorMessage);
  });
}
 
function logout(){
  firebase.auth().signOut();
}

function test() {
  var firebaseRef = firebase.database().ref();
  firebaseRef.child("lwu@kentacuk/1540846018412/stiTime").on('value', function(datasnapshot){
    testHeading.innerText = datasnapshot.val();
  });
}

function getUsers() {
  var db = firebase.database();
  db.ref().once('value', function(snap) {
    snap.forEach(function(childSnap) {
      console.log(childSnap.key);

      $('#div_users').append(
        '<div>' + 
        '<p>' + childSnap.key + '</p>' + 
        '<button> test </button>'
        + '</div>'
        );
    });
  });
}

function getRecords() {
  var db = firebase.database();
  db.ref("/" + "lwu@kentacuk").once('value', function(snap) {
    snap.forEach(function(childSnap) {
      console.log(childSnap.key);
    });
  });
}

function getRecordDatails() {

}

function addDisplayUi() {



}