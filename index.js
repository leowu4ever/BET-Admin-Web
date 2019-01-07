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
  //console.debug(urlPfx)
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
  createDetailsTable()
  updateDetailsTable()

  createCharts()
  getDBList()
}

function updateDetailsTable() {
  updateTableRow("/1_User Info/1_Name", "detail_name")
  updateTableRow("/1_User Info/2_Start time", "detail_start_time")
  updateTableRow("/1_User Info/3_Time Trained", "detail_duration_trained")

  updateTableRow("/2_Training Configuration/1_Activity", "detail_activity")
  updateTableRow("/2_Training Configuration/2_Duration", "detail_duration")
  updateTableRow("/2_Training Configuration/3_Task", "detail_cognitive_task")
  updateTableRow("/2_Training Configuration/4_Difficulty level", "detail_task_difficulty")

  updateTableRow("/3_Cognitive Performance/1_Stimulus", "detail_stimulus")
  updateTableRow("/3_Cognitive Performance/2_Nogo", "detail_nogo")
  updateTableRow("/3_Cognitive Performance/3_Responses", "detail_responses")
  updateTableRow("/3_Cognitive Performance/4_Hits", "detail_hits")
  updateTableRow("/3_Cognitive Performance/5_Lapses", "detail_lapses")
  updateTableRow("/3_Cognitive Performance/6_Accuracy", "detail_accuracy")
  updateTableRow("/3_Cognitive Performance/7_Average response time", "detail_avg_response_time")

  updateTableRow("/4_Physical Performance/1_Distance", "detail_distance")
  updateTableRow("/4_Physical Performance/2_Average speed", "detail_avg_speed")
  updateTableRow("/4_Physical Performance/3_Average pace", "detail_avg_pace")
}

function updateTableRow(att, id) {
  var db = firebase.database()
  db.ref(urlPfx + att).once('value', function(snap) {
    document.getElementById(id).innerHTML = snap.val()
  })
}

function createDetailsTable () {
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
      '<td id = "detail_name"></td>' +
      '<td id = "detail_start_time"></td>' +
      '<td id = "detail_duration_trained"></td>' +
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
      '<td id = "detail_activity"></td>' +
      '<td id = "detail_duration"></td>' +
      '<td id = "detail_cognitive_task"></td>' +
      '<td id = "detail_task_difficulty"></td>' +
    '</tr>' +

  '</table>' +

  '<table border="1">' +
    '<tr>' + 
      '<th colspan="7" align="center">Cognitive performance</th>' +
    '</tr>' + 

    '<tr>' + 
      '<th>Stimulus</th>' +
      '<th>No-go</th>' +
      '<th>Responses</th>' + 
      '<th>Hits</th>' + 
      '<th>Lapses</th>' + 
      '<th>Accuracy</th>' + 
      '<th>Avg response time</th>' + 
    '</tr>' + 

    '<tr>' +
      '<td id = "detail_stimulus"></td>' +
      '<td id = "detail_nogo"></td>' +
      '<td id = "detail_responses"></td>' +
      '<td id = "detail_hits"></td>' +
      '<td id = "detail_lapses"></td>' +
      '<td id = "detail_accuracy"></td>' +
      '<td id = "detail_avg_response_time"></td>' +
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
      '<td id = "detail_distance"></td>' +
      '<td id = "detail_avg_speed"></td>' +
      '<td id = "detail_avg_pace"></td>' +
    '</tr>' +

  '</table>' 
  )
}

function createCharts() {
  $('#div_users').append(
    '<canvas id="myChart" width="400" height="400"></canvas>' +
    '<canvas id="myChart2" width="400" height="400"></canvas>'

  )

  var ctx = document.getElementById('myChart').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "Speed graph",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },

    // Configuration options go here
    options: {
      responsive: false
    }
  });

  var ctx = document.getElementById('myChart2').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "Response time graph",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },
    // Configuration options go here
    options: {
      responsive: false
    }
  });
}

function getDBList() {
  var db = firebase.database()
  db.ref(urlPfx + "/5_Stimulus Record/4_Stimulus type list").once('value', function(snap) {
    console.debug(snap.val())
  })
}
