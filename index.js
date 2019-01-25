var testHeading = document.getElementById("testHeading")
var urlPfx = ""

firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    document.getElementById("user_div").style.display = "block"
    document.getElementById("login_div").style.display = "none"

    var user = firebase.auth().currentUser;
    if(user != null){
      var email_id = user.email
      document.getElementById("user_para").innerHTML = "Logged in as : " + email_id
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
        '<div>' + 
          '<button id = ' + btnId + '>View</button>' + 
        childSnap.key + '</div>'
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
          '<div>' + 
            '<button id = ' + btnId + '>Details</button>' +
          childSnap.key + '</div>'
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
  updateCharts()

  createMap()
  updateMap()

  getDBList()
}

function updateDetailsTable() {
  updateTableRow("/1_User Info/1_Name", "detail_name")
  updateTableRow("/1_User Info/2_Start time", "detail_start_time",
    function(x){return formatDate(x, "yyyy-MM-dd hh:mm:ss")})
  updateTableRow("/1_User Info/3_Time Trained", "detail_duration_trained",
    function(x){return formatDate(x, "mm:ss")})

  updateTableRow("/2_Training Configuration/1_Activity", "detail_activity")
  updateTableRow("/2_Training Configuration/2_Duration", "detail_duration",
    function(x){return formatDate(x, "mm:ss")})
  updateTableRow("/2_Training Configuration/3_Task", "detail_cognitive_task")
  updateTableRow("/2_Training Configuration/4_Difficulty level", "detail_task_difficulty")

  updateTableRow("/3_Cognitive Performance/1_Stimulus", "detail_stimulus")
  updateTableRow("/3_Cognitive Performance/2_Nogo", "detail_nogo")
  updateTableRow("/3_Cognitive Performance/3_Responses", "detail_responses")
  updateTableRow("/3_Cognitive Performance/4_Hits", "detail_hits")
  updateTableRow("/3_Cognitive Performance/5_Lapses", "detail_lapses")
  updateTableRow("/3_Cognitive Performance/6_Accuracy", "detail_accuracy",
    function(x){return x+"%"})
  updateTableRow("/3_Cognitive Performance/7_Average response time", "detail_avg_response_time",
    function(x){return x+"ms"})

  updateTableRow("/4_Physical Performance/1_Distance", "detail_distance",
    function(x){return parseFloat(x).toFixed(3)+"km"})
  updateTableRow("/4_Physical Performance/2_Average speed", "detail_avg_speed",
    function(x){return parseFloat(x).toFixed(3)+"km/h"})
  updateTableRow("/4_Physical Performance/3_Average pace", "detail_avg_pace",
    function(x){return parseFloat(x).toFixed(3)+"min/km"})
}

function updateTableRow(att, id, processFunc) {
  var db = firebase.database()
  db.ref(urlPfx + att).once('value', function(snap) {
    var data = ((typeof processFunc !== "undefined") ? processFunc(snap.val()) : snap.val());
    document.getElementById(id).innerHTML = data;
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
      '<th>Average response time</th>' + 
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
      '<th>Average speed</th>' + 
      '<th>Average pace</th>' + 
    '</tr>' + 

    '<tr>' +
      '<td id = "detail_distance"></td>' +
      '<td id = "detail_avg_speed"></td>' +
      '<td id = "detail_avg_pace"></td>' +
    '</tr>' +

  '</table>' + 

  '<hr>'
  )
}

var speedChart;
var ResponseTimeChart;
function updateCharts(){
  updateChartsValue("/4_Physical Performance/4_Speed list", speedChart)
  updateChartsValue("/5_Stimulus Record/Res Time List", ResponseTimeChart)
}

function updateChartsValue(att, chart){
  var db = firebase.database()
  db.ref(urlPfx + att).once('value', function(snap){
    var dataVal = [];
    var x_axis = [];

    //Get the data from DB.
    snap.forEach(function(childSnap){
      dataVal.push(childSnap.val());
      x_axis.push("");
    })

    //Update the graph.
    chart.data.datasets[0].data = dataVal;
    chart.data.labels = x_axis;
    chart.update();

  })
}

var routeMap;
function createMap(){
  $('#div_users').append(
    '<div id="map" style="width: 800px !important; height: 65% !important;"> </div>'
  )

  routeMap = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 14,
    disableDefaultUI: true
  });

}
function updateMap(){
  updateRoute("6_Location/1_Latitude list", "6_Location/2_Longitude list", "4_Physical Performance/4_Speed list", routeMap);
}

function updateRoute(latAtt, lngAtt, speedAtt, map){
  var db = firebase.database();
  var latList = [];
  var lngList = [];
  
  //Get latitude, longitude data from DB.
  count = 1;
  var getLatData = function(){
    return new Promise(function(resolve){
      db.ref(urlPfx + latAtt).once('value', function(snap){
        snap.forEach((childSnap)=>{latList.push(parseFloat(childSnap.val()))});
        resolve();
      })});
  }
  var getLngData = function(){
    return new Promise(function(resolve){
      db.ref(urlPfx + lngAtt).once('value', function(snap){
        snap.forEach((childSnap)=>{lngList.push(parseFloat(childSnap.val()))});
        resolve();
      })});
  }

  getLatData()
  .then(()=>{return getLngData()})
  .then(function(){
    //Make route array of 'google.maps.LatLng'
    var routePoint = [];
    for(var i = 0; i < latList.length; i++){
    routePoint.push({lat:latList[i], lng:lngList[i]});
    }

    var startPoint = routePoint[0];
    var startMarker = new google.maps.Marker({
      position: startPoint,
      map: map,
      title: 'START Point',
      label: {text: 'S', color: '#FFFFFF'}
    });
  
    var endPoint = routePoint[routePoint.length-1];
    var endMarker = new google.maps.Marker({
      position: endPoint,
      map: map,
      title: 'END Point',
      label: {text: 'D', color: '#FFFFFF'}
    });
  
    var sectionCnt = 0;
    db.ref(urlPfx + speedAtt).once('value', function(snap){
      snap.forEach((childSnap)=>{
        drawPolyline(map, routePoint[sectionCnt], routePoint[sectionCnt+1], childSnap.val());
        sectionCnt++;
      })
    })
   
    //Adjust the view of the map appropriately.
    bounds  = new google.maps.LatLngBounds();
    bounds.extend(startPoint);
    bounds.extend(endPoint);
    
    map.fitBounds(bounds);      
    map.panToBounds(bounds);    
  })
}

function drawPolyline(map, start, end, speed){

  var color;
  if(speed > 0 && speed <=2){color = '#FFDECC'}
  else if(speed > 2 && speed <=4){color = '#FEC2AF'}
  else if(speed > 4 && speed <=6){color = '#F69E8C'}
  else if(speed > 6 && speed <=8){color = '#F17E6D'}
  else if(speed > 8 && speed <=10){color = '#ED6150'}
  else if(speed > 10 && speed <=12){color = '#D8473B'}
  else if(speed > 12 && speed <=14){color = '#C22D2A'}
  else if(speed > 14 && speed <=16){color = '#A61720'}
  else{color = '#8D031A'}

  var polyline = new google.maps.Polyline({
    path: [start, end],
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 1.0,
    strokeWeight: 3
  });
  polyline.setMap(map);

}

function formatDate(miliseconds, format){
  var date = new Date(miliseconds);
  var yyyy = date.getFullYear();
  var MM = date.getMonth();
  var dd = date.getDate();
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();

  return format.replace("yyyy", yyyy).replace("MM", MM).replace("dd", dd)
    .replace("hh", hh).replace("mm", mm).replace("ss", ss);
}

function createCharts() {
  $('#div_users').append(
    '<canvas id="myChart" style="width: auto !important;height: 400 !important;"></canvas>' +
    '<canvas id="myChart2" style="width: auto !important;height: 400 !important;"></canvas>'

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
            backgroundColor: 'rgb(93, 143, 252)',
            backgroundColor: 'rgb(93, 143, 252)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },

    // Configuration options go here
    options: {
      responsive: false
    }
  });
  speedChart = chart;

  var ctx = document.getElementById('myChart2').getContext('2d');
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
            label: "Response time graph",
            backgroundColor: 'rgb(93, 143, 252)',
            backgroundColor: 'rgb(93, 143, 252)',
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },
    // Configuration options go here
    options: {
      responsive: false
    }
  });
  ResponseTimeChart = chart;
}

function getDBList() {
  var db = firebase.database()
  db.ref(urlPfx + "/5_Stimulus Record/4_Stimulus type list").once('value', function(snap) {
    console.debug(snap.val())
  })
}
