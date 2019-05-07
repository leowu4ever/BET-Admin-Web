var testHeading = document.getElementById("testHeading")
var urlPfx = ""

firebase.auth().onAuthStateChanged(function(user) {

  if (user) {
    document.getElementById("user_div").style.display = "inline-block"
    document.getElementById("navigation_bar").style.display = "block"
    document.getElementById("login_div").style.display = "none"
    document.getElementById("login_div_logo").style.display = "none"

    var user = firebase.auth().currentUser;
    if(user != null){
      var email_id = user.email
      document.getElementById("nav_user").innerHTML = "Logged in as : " + email_id  
    }

  } else {
    document.getElementById("user_div").style.display = "none"
    document.getElementById("navigation_bar").style.display = "none"
    document.getElementById("login_div").style.display = "block"
    document.getElementById("login_div_logo").style.display = "flex"
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
  firebase.auth().signOut();
  document.getElementById("password_field").value = "";
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
        '<div style="padding-top: 5px">' + 
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
          '<div style="padding-top: 5px">' + 
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
  urlPfx = urlPfx + date;

  //This should be done in this order.
  createDetailsTable()
  createDiv();
  updateDetailsTable()
  //----------------------------------

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
  updateTableRow("/2_Training Configuration/3_Task", "detail_cognitive_task", null,
    function(){updateElement();})
  updateTableRow("/2_Training Configuration/4_Difficulty Level", "detail_task_difficulty")

  updateTableRow("/3_Cognitive Performance/1_Stimulus", "detail_stimulus")
  updateTableRow("/3_Cognitive Performance/2_Nogo", "detail_nogo")
  updateTableRow("/3_Cognitive Performance/3_Responses", "detail_responses")
  updateTableRow("/3_Cognitive Performance/4_Hits", "detail_hits")
  updateTableRow("/3_Cognitive Performance/5_Lapses", "detail_lapses")
  updateTableRow("/3_Cognitive Performance/6_Accuracy", "detail_accuracy",
    function(x){return parseFloat(x).toFixed(1)+"%"})
  updateTableRow("/3_Cognitive Performance/7_Average Response Time", "detail_avg_response_time",
    function(x){return x+"ms"})

  updateTableRow("/4_Physical Performance/1_Distance", "detail_distance",
    function(x){return parseFloat(x).toFixed(3)+"km"})
  updateTableRow("/4_Physical Performance/2_Average Speed", "detail_avg_speed",
    function(x){return parseFloat(x).toFixed(3)+"km/h"})
  updateTableRow("/4_Physical Performance/3_Average Pace", "detail_avg_pace",
    function(x){return parseFloat(x).toFixed(3)+"min/km"})
}

function updateTableRow(att, id, processFunc=null, callback=null) {
  var db = firebase.database()
  db.ref(urlPfx + att).once('value', function(snap) {
    var data = ((processFunc != null) ? processFunc(snap.val()) : snap.val());
    document.getElementById(id).innerHTML = data;
    if(callback != null) { callback(); }
  })
}

function updateElement(){
  var task = (document.getElementById("detail_cognitive_task")).innerHTML;
  if(task != "GO/NO-GO"){
    
    //Hide table cell showing go/no-go count
    document.getElementById("detail_nogo").style.display = "none";
    document.getElementById("no_go_title").style.display = "none";
  }
  if(task == "Visual"){
    document.getElementById("table_physical_performance").style.display = "none";
    document.getElementById("div_training_route").style.display = "none";
    document.getElementById("div_speed_graph").style.display = "none";
  }
}

function createDiv(){

  $('#div_users').append(

    //for speed graph
    '<div id="div_speed_graph">' + 

      '<table id="table_speed_graph" border="1">' +
       '<tr>' + 
         '<th colspan="3" align="center">Speed Graph</th>' +
       '</tr>' + 
      '</table>' +
      
      '<canvas id="myChart" style="width: 100% !important;height: 100% !important;"></canvas>' +  
    
    '</div>' + 
    
    //for response time graph
    '<div id="div_response_graph">' + 

      '<table id="table_response_graph" border="1">' +
       '<tr>' + 
         '<th colspan="3" align="center">Response Time Graph</th>' +
       '</tr>' + 
      '</table>' +
      
      '<canvas id="myChart2" style="width: 100% !important;height: 100% !important;"></canvas>' +  
    
    '</div>' +

    //for training route map
    '<div id="div_training_route">' + 

      '<table id="table_training_route" border="1">' +
       '<tr>' + 
         '<th colspan="3" align="center">Training Route</th>' +
       '</tr>' + 
      '</table>' +
      
      '<div id="map" style="width: 100% !important; height: 100% !important;"> </div>' +  

    '</div>'
  )
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
      '<th>Duration trained(mm:ss)</th>' + 
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
      '<th>Duration(mm:ss)</th>' + 
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
      '<th id="no_go_title">No-go</th>' +
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

  '<table id="table_physical_performance" border="1">' +
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

  '<hr>' +

  '<br><br>'
  )
}

var speedChart;
var responseTimeChart;
function updateCharts(){
  updateChartsValue(speedChart, "/4_Physical Performance/4_Speed List", "/4_Physical Performance/5_Location Update Time List", true)
  updateChartsValue(responseTimeChart, "/5_Stimulus Record/3_Responses Time List", "/5_Stimulus Record/2_Responses Mili List")
}

function updateChartsValue(chart, yAtt, xAtt, isIntervalData=false){
  var db = firebase.database();
  var dataVal = [];
  var x_axis = [];

  //Get data for y-axis from DB. (= Y value)
  var getYAxisData = function(){
    return new Promise(function(resolve){
      db.ref(urlPfx + yAtt).once('value', function(snap){
        
        //Apply to the config of chart.
        snap.forEach((childSnap)=>{
          dataVal.push(parseFloat(childSnap.val()).toFixed(3));
        });
        chart.data.datasets[0].data = dataVal;
        resolve();
      })});
  };

  //Get data for x-axis from DB.
  var getXAxisData = function(){
    return new Promise(function(resolve){
      if(typeof xAtt !== "undefined"){
        db.ref(urlPfx + xAtt).once('value', function(snap){

          //Apply to the config of chart.
          snap.forEach((childSnap)=>{
            x_axis.push(childSnap.val());
          });

          if(isIntervalData && x_axis.length > 0){x_axis.shift();}

          var startTime = x_axis[0];
          x_axis = x_axis.map(x=>x-startTime);

          chart.data.labels = x_axis;
          resolve();
        });
      } else {
        for(let i=0;i<dataVal.length;i++) {
          x_axis.push(i);
          chart.data.labels = x_axis;
        }
        resolve();
      }
    })
  };

  getYAxisData()
  .then(()=>{return getXAxisData()})
  .then(()=>{
    if((typeof xAtt !== "undefined")&&(dataVal.length != x_axis.length)){
      //TO-DO
      console.log("The number of x-data does not match y-data.")
      //console.log("# of" + yAtt + " : " + dataVal.length + "\n# of " + xAtt + " : " + x_axis.length);
    }
    chart.update();
  });

}

var routeMap;
function createMap(){
  routeMap = L.map(document.getElementById('map'), {
    //center: {lat:-34.397, lng:150.644},
    zoom: 13,
    zoomSnap: 2
  });

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZG9uZ2dlb25sZWUiLCJhIjoiY2pzbHl2NTl2MGgxejQ5bmRvb25meGR3ayJ9.TVZQjqtGYHH2AzjasBBe4A'
  }).addTo(routeMap);

}

function updateMap(){
  updateRoute("6_Location/1_Latitude List", "6_Location/2_Longitude List", "4_Physical Performance/4_Speed List", routeMap);
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
    //Make route array of 'LatLng'
    var routePoint = [];
    for(var i = 0; i < latList.length; i++){
      routePoint.push({lat:latList[i], lng:lngList[i]});
    }
    if(routePoint.length < 1) { return; }
    
    var startPoint = routePoint[0];
    var startIcon = L.divIcon({
      className: 'my-div-icon',
      html:"START"});
    var startMarker = L.marker(startPoint, {
      title: 'START Point',
      icon: startIcon
      //label: {text: 'S', color: '#FFFFFF'}
    });
    startMarker.addTo(map);
  
    var endPoint = routePoint[routePoint.length-1];
    
    var endIcon = L.divIcon({
      className: 'my-div-icon',
      html:"END"
    });
    var endMarker = L.marker(endPoint, {
      title: 'END Point',
      icon: endIcon
      //label: {text: 'D', color: '#FFFFFF'}
    });
    endMarker.addTo(map);
  
    var sectionCnt = 0;
    db.ref(urlPfx + speedAtt).once('value', function(snap){
      snap.forEach((childSnap)=>{
        drawPolyline(map, routePoint[sectionCnt], routePoint[sectionCnt+1], childSnap.val());
        sectionCnt++;
      })
    })

    //Adjust the view of the map appropriately.
    bounds = L.latLngBounds();
    routePoint.forEach((point)=>{bounds.extend(point)})
    map.fitBounds(bounds);      
    map.panInsideBounds(bounds);    
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

  var polyline = L.polyline([start, end], {
    color: color,
    opacity: 1.0,
    weight: 3
  });
  polyline.addTo(map);

}

function formatDate(miliseconds, format){
  var date = new Date(miliseconds);
  var yyyy = date.getFullYear();
  var MM = date.getMonth()+1;
  var dd = date.getDate();
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();

  return format.replace("yyyy", yyyy).replace("MM", MM).replace("dd", dd)
    .replace("hh", hh).replace("mm", mm).replace("ss", ss);
}

function createCharts() {
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
            borderColor:'rgb(93, 143, 252)',
            fill:false,
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },

    // Configuration options go here
    options: {
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            callback: function(value, index, values){
              return formatDate(value, "mm:ss");
            }
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            callback: function(value, index, values){
              return parseFloat(value).toFixed(3)
            }
          }
        }]
      },
      legend: {
        display: false
      }
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
            borderColor:'rgb(93, 143, 252)',
            fill:false,
            data: [0, 10, 5, 2, 20, 30, 45],
        }]
    },
    // Configuration options go here
    options: {
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            callback: function(value, index, values){
              return formatDate(value, "mm:ss");
            }
          }
        }],
        yAxes: [{
          ticks: {
            beginAtZero: true,
            //callback: function(value, index, values){ return value + "ms"}
          }
        }]
      },
      legend: {
        display: false
      }
    }
  });
  responseTimeChart = chart;
}

function getDBList() {
  var db = firebase.database()
  db.ref(urlPfx + "/5_Stimulus Record/4_Stimulus Type List").once('value', function(snap) {
    console.debug(snap.val())
  })
}

function showRankingForm() {

  $('#div_users').empty()
  $('#div_users').append(
    '<div style="padding-top: 5px">' +
      '<span style="padding-right: 5px">From</span>' +
      '<input type="date" id="ranking_from_date" value="2018-01-01" min="2018-01-01" max="2020-12-31">' +
      
      '<span style="padding-right: 5px; padding-left: 10px">To</span>' +
      '<input type="date" id="ranking_to_date" value="2019-04-02" min="2018-01-01" max="2020-12-31">' +

      '<div style="display: inline-block; padding-left: 10px">' +
        '<form >' +
          '<select id="task_dropdown" name = "dropdown">' +
            '<option >A-PVT</option>' +
            '<option >GO/NO-GO</option>' + 
            '<option >Visual</option>' +
          '</select>' + 
        '</form>' +
      '</div>' + 
      
      '<div style="display: inline-block; padding-left: 10px"><button onclick="rankUsers()">Rank</button></div>' +
    '</div>'+

    '<div id=ranking_users_div></div>' +
    '<hr>' +

    '<div id=ranking_table></div>'
  )

  var db = firebase.database()
  db.ref().once('value', function(snap) {
    snap.forEach(function(childSnap) {
      $('#ranking_users_div').append('<input type="checkbox" name="' + childSnap.key+ '">' +
        '   ' + childSnap.key + '<br>')
    })
  })
}

function rankUsers() {
  userSelected = getUserSelected()
  startDateSelected = getStartDateSelected()
  endDateSelected = getEndDateSelected()
  taskSelected = getTaskSelected()

  var refsOfUserAndDate = []
  var db = firebase.database()

  for (let i = 0; i<userSelected.length; i++) {
    var ref = db.ref(userSelected[i])
    ref.once('value', function(snap) {
      snap.forEach(function(childSnap) {
        if(childSnap.key !== "storageRef") {
          refsOfUserAndDate.push('/' + snap.key + '/' + childSnap.key)
        }
      })
      if(i == userSelected.length-1) {
        var filteredRefs = filterRefs(refsOfUserAndDate, startDateSelected, endDateSelected, taskSelected)
      }
    })
  }
}

function filterRefs(refsOfUserAndDate, startDateSelected, endDateSelected, taskSelected ) {
  var refsFilteredWithTask = []
  var refsFilteredWithDate = []

  var startDateMili = new Date(startDateSelected).getTime()
  var endDateMili = new Date(endDateSelected).getTime()

  var db = firebase.database()
  for (let i = 0; i<refsOfUserAndDate.length; i++) {

    var ref = db.ref(refsOfUserAndDate[i]).child('/2_Training Configuration/3_Task')
    ref.once('value', function(snap) {
      if(snap.val() == taskSelected) {
        refsFilteredWithTask.push(refsOfUserAndDate[i])
      }

      if(i == refsOfUserAndDate.length-1) {
        for(let j = 0; j<refsFilteredWithTask.length; j++) {
          
          var ref = db.ref(refsFilteredWithTask[j]).child('/1_User Info/2_Start time')
          ref.once('value', function(snap) {
            
            if(snap.val() >= startDateMili && snap.val() <= endDateMili) {
              refsFilteredWithDate.push(refsFilteredWithTask[j])
            }

            if(j == refsFilteredWithTask.length-1) {
              console.log(refsFilteredWithDate)
              updateRankingForm(refsFilteredWithDate)
            }
          })  
        }
      }
    })
  }
}

function updateRankingForm(filterRefs) {
  //get data
  GetAttrWithRef(filterRefs)
  .then((aryUnsortedAttr)=>{
    aryFilteredWithInvalidScore = aryUnsortedAttr.filter((attr)=>(attr.score !== "invalid"))
    arySortedAttr = SortAttr(aryFilteredWithInvalidScore)

    htmlTableAttrRow = ""
    for(let i=0; i<arySortedAttr.length; i++){
      htmlTableAttrRow = htmlTableAttrRow + 
      '<tr>' +
        '<td>' + (i+1) +'</td>' +
        '<td id =' + (arySortedAttr[i].ref + 'userName') + '></td>' +
        '<td id =' + (arySortedAttr[i].ref + 'score') + '></td>' +
        '<td id =' + (arySortedAttr[i].ref + 'accuracy') + '></td>' +
        '<td id =' + (arySortedAttr[i].ref + 'resTime') + '></td>' +
        '</tr>'
    }

    //create ranking table
    $('#ranking_table').empty()
    $('#ranking_table').append(
    '<table border="1">' +
      '<tr>' + 
        '<th colspan="8" align="center">Ranking of performance</th>' +
      '</tr>' + 
      
      '<tr>' + 
        '<th>Rank</th>' +
        '<th>User</th>' +
        '<th>Score</th>' + 
        '<th>Accuracy</th>' + 
        '<th>Avg RT</th>' +
      '</tr>' +

      htmlTableAttrRow + 

      '</table>'
    )

    //fill the ranking table
    for(let i=0; i<arySortedAttr.length; i++){
      document.getElementById(arySortedAttr[i].ref + 'userName').innerHTML = arySortedAttr[i].userName;
      document.getElementById(arySortedAttr[i].ref + 'score').innerHTML = arySortedAttr[i].score;
      document.getElementById(arySortedAttr[i].ref + 'accuracy').innerHTML = arySortedAttr[i].accuracy;
      document.getElementById(arySortedAttr[i].ref + 'resTime').innerHTML = arySortedAttr[i].resTime;
    }
    });
}

function SortAttr(unsortedAttr){
  return unsortedAttr.sort(function(a,b){
    return b.score - a.score;
  });
}

function GetAttrWithRef(prefixs){
  return new Promise(function(resolve){
    var aryUnsortedAttr = []
    var db = firebase.database()
    var getAttrSync = function(prefix, attr, processFunc){
    return new Promise(function(resolve){
      var ref = db.ref(prefix).child(attr)
      ref.once('value', function(snap) {
        attr = ((processFunc != null) ? processFunc(snap.val()) : snap.val());
        resolve(attr)
      })
    })
    };

    finishCnt = 0;
    for (let i = 0; i<prefixs.length; i++) {
      aryUnsortedAttr.push({ref:prefixs[i]})
      getAttrSync(prefixs[i], '/1_User Info/1_Name')
      .then((attr)=>{
        aryUnsortedAttr[i].userName = attr;
        return getAttrSync(prefixs[i], '/3_Cognitive Performance/6_Accuracy', function(x){return parseFloat(x).toFixed(1)+'%'});
      })
      .then((attr)=>{
        aryUnsortedAttr[i].accuracy = attr;
        return getAttrSync(prefixs[i], '/3_Cognitive Performance/7_Average Response Time', function(x){return x+'ms'});
      })
      .then(function(attr) {
        aryUnsortedAttr[i].resTime = attr;

        if(parseInt(aryUnsortedAttr[i].resTime) == 0) {
          aryUnsortedAttr[i].score = "invalid"
        } else {
          aryUnsortedAttr[i].score = parseInt(parseInt(aryUnsortedAttr[i].accuracy) * 1000 / parseInt(aryUnsortedAttr[i].resTime))
        }

        if(++finishCnt>=prefixs.length){
          resolve(aryUnsortedAttr);
        }
      })
    }
  });
}

function getUserSelected() {
  userSelected = []
  userCount = document.getElementById("ranking_users_div").children.length

  for (var i = 0; i<userCount; i++) {
    var name = document.getElementById("ranking_users_div").children[i].name
    if(name !== undefined) {
      if(document.getElementById("ranking_users_div").children[i].checked) {
        userSelected.push("/" + name)
      }
    }
  }
  return userSelected
}

function getStartDateSelected() {
  return document.getElementById("ranking_from_date").value
}

function getEndDateSelected() {
  return document.getElementById("ranking_to_date").value
}

function getTaskSelected() {
  indexSelected = document.getElementById("task_dropdown").selectedIndex
  taskSelected = document.getElementById("task_dropdown").options[indexSelected].value
  return taskSelected
}