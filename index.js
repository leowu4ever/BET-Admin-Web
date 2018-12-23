var testHeading = document.getElementById("testHeading")
var urlPfx = ""

firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    document.getElementById("user_div").style.display = "block"
    document.getElementById("login_div").style.display = "none"

    var user = firebase.auth().currentUser;
    if(user != null){
      var email_id = user.email
      document.getElementById("user_para").innerHTML = "You are logged in as : " + email_id
    }

  } else {
    document.getElementById("user_div").style.display = "none"
    document.getElementById("login_div").style.display = "block"
  }
});

function login(){
  var userEmail = document.getElementById("email_field").value
  var userPass = document.getElementById("password_field").value

  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    var errorCode = error.code
    var errorMessage = error.message
    window.alert("Error : " + errorMessage)
  })
}
 
function logout(){
  firebase.auth().signOut()
}

function getUsers() {
  $('#div_users').empty()
  var db = firebase.database()
  var count = 0
  db.ref().once('value', function(snap) {
    snap.forEach(function(childSnap) {
      count = count + 1
      var btnId = "btn_view" + count.toString()
      $('#div_users').append(
        '<div>' + childSnap.key + 
        '<button id = ' + btnId + '>View</button>' + 
        '</div>'
        )
      $('#' + btnId).click(getRecords)
    })
  })
}

function getRecords() {
  $('#div_users').empty()
  var user = ($(this).parent().text().replace("View", "")) + "/"
  urlPfx = ""
  urlPfx = user

  console.debug(urlPfx)

  var count = 0
  var db = firebase.database()
  db.ref("/" + user).once('value', function(snap) {
    snap.forEach(function(childSnap) {
      count = count + 1
      var btnId = "btn_detail" + count.toString()
      if(childSnap.key != "storageRef"){ 
        $('#div_users').append(
          '<div>' + childSnap.key + 
          '<button id = ' + btnId + '>Details</button>' + 
          '</div>'
          )
        $('#' + btnId).click(showDetails)
      }
    })
  })
}

function showDetails() {

  var date = ($(this).parent().text().replace("Details", "")) + "/"
  urlPfx = urlPfx + date
  console.debug(urlPfx)

  $('#div_users').empty()
  $('#div_users').append(
  '<table border="1">' +
    '<tr>' + 
      '<th colspan="3" align="center">General info</th>' +
    '</tr>' + 
      
    '<tr>' + 
      '<th>User</th>' +
      '<th>Start time</th>' + 
      '<th>Duration trained</th>' + 
    '</tr>' + 

    '<tr>' +
      '<td>' + getDetailOf("/1_User Info/1_Name") + '</td>' +
      '<td>' + getDetailOf("/1_User Info/2_Start time") + '</td>' +
      '<td>' + getDetailOf("/1_User Info/3_Time Trained") + '</td>' +
    '</tr>' +

  '</table border="1">' +

  '<table border="1">' +
    '<tr>' + 
      '<th colspan="4" align="center">Training configuration</th>' +
    '</tr>' + 

    '<tr>' + 
      '<th>Activity</th>' +
      '<th>Duration</th>' + 
      '<th>Cognitive task</th>' + 
      '<th>Task difficulty</th>' + 
    '</tr>' + 

    '<tr>' +
      '<td>Jill</td>' +
      '<td>Smith</td>' +
      '<td>50</td>' +
      '<td>50</td>' +
    '</tr>' +

  '</table>' +

  '<table border="1">' +
    '<tr>' + 
      '<th colspan="6" align="center">Cognitive performance</th>' +
    '</tr>' + 

    '<tr>' + 
      '<th>Stimulus</th>' +
      '<th>No-go</th>' + 
      '<th>Hits</th>' + 
      '<th>Lapses</th>' + 
      '<th>Accuracy</th>' + 
      '<th>Avg response time</th>' + 
    '</tr>' + 

    '<tr>' +
      '<td>Jill</td>' +
      '<td>Smith</td>' +
      '<td>50</td>' +
      '<td>50</td>' +
      '<td>50</td>' +
      '<td>50</td>' +
    '</tr>' +

  '</table>' +

  '<table border="1">' +
    '<tr>' + 
      '<th colspan="3" align="center">Physical performance</th>' +
    '</tr>' + 
    '<tr>' + 
      '<th>Distance</th>' +
      '<th>Avg speed</th>' + 
      '<th>Avg pace</th>' + 
    '</tr>' + 

    '<tr>' +
      '<td>Jill</td>' +
      '<td>Smith</td>' +
      '<td>50</td>' +
    '</tr>' +

  '</table>' 
  )
}

function getDetailOf(att) {
  var db = firebase.database()
  db.ref(urlPfx + att).once('value', function(snap) {
    console.debug(snap.val())
    return snap.val()
  })
}