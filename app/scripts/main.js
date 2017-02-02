'use strict';

angular.module('demoPage', ['ngRoute','demoPage-main','templates'])
  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  });


angular.module('demoPage-main',['ngRoute','ngForce','720kb.datepicker','ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav','ui.grid.pagination'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  })
  .controller('MainCtrl', function ($scope,$injector,vfr,$interval,$q) {

    var queryArray=[];                      //Storing All query variable Which Will Be Used To From Query With Where Clause
    var queryString ='';                    //Store SOQL Query in String Format
    var convertedDate = '';
    var first = '';
    var firstDayOfWeek = '';              
    var lastDayOfWeek = '';
  
    $scope.Users = {};
    $scope.Projects = {};
    $scope.selectedUser='';
    $scope.selectedProject='';
    $scope.date='';
    // $scope.disableButton="true";
    $scope.ResourceBooking = {};             //Object Storing Queried data of Resource_Booking__c

    $scope.GridDisplayData ={};              //This Object Is Holding data to display in a grid  

/*------------------------------------------------Generating column and Row Data for Grid-----------------------------------------------*/
    $scope.ResourceBooking = {
    paginationPageSizes: [5, 10, 75],
    paginationPageSize: 5,
    columnDefs : [
      { name: 'User__c', displayName: 'User'},
      { name: 'Project__c', displayName: 'Project' },
      { name: 'Date__c', displayName: 'Date' , type: 'date', cellFilter: 'date:"dd-MM-yyyy"'},
      { name: 'SundayHours__c', displayName: 'Sunday' , type: 'number', enableCellEdit: false},
      { name: 'MondayHours__c', displayName: 'Monday' , type: 'number'},
      { name: 'TuesdayHours__c', displayName: 'Tuesday' , type: 'number'},
      { name: 'WednesdayHours__c', displayName: 'Wednesday' , type: 'number'},
      { name: 'ThursdayHours__c', displayName: 'Thursday' , type: 'number'},
      { name: 'FridayHours__c', displayName: 'Friday' , type: 'number'},
      { name: 'SaturdayHours__c', displayName: 'Saturday' , type: 'number', enableCellEdit: false}
    ] 
  };

/*--------------------------Function Is Called Implecitely Whenever the Cell Data Is Edited-----------------------------------------------*/  
  $scope.saveRow = function(rowEntity) {
    var updateObj = rowEntity;
    var objId = updateObj.Id;
    delete updateObj.Id;
    delete updateObj.attributes;
    delete updateObj.Name;
    delete updateObj.Project__c;

    // console.log('updateObj.Date__c------',Date(updateObj.Date__c));

    first = new Date(updateObj.Date__c).getDate() - new Date(updateObj.Date__c).getDay();    // First day =day of the month - the day of the week
    updateObj.Date__c = $scope.formatDate(new Date(new Date(updateObj.Date__c).setDate(first)));
    // console.log('updateObj.Date__c----+++--',updateObj.Date__c);
    // console.log('updateObj------',updateObj);
    vfr.update('Resource_Booking__c', objId, angular.toJson(updateObj))
        .then(function(result){
          console.log('result',result);
          $q.resolve();          
        }, function(error){
          console.error('error', error);
        });                                                                        
    $interval( function() {                                // fake a delay of 3 seconds whilst the save occurs.      
    }, 3000, 1);                                           //Wait for 3 seconds before initiating update call
    
    /*var promise = $q.defer();                       
    $scope.gridApi.rowEdit.setSavePromise(rowEntity, promise.promise);
    promise.resolve();*/
    
  };

/*-------------------------------------------------------Set gridApi On Scope-----------------------------------------------------------*/ 
  $scope.ResourceBooking.onRegisterApi = function(gridApi){
    $scope.gridApi = gridApi;                                          
    gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
  };

/*--------------------------------------------Function Queries All Standard Users In The Org--------------------------------------------*/
  $scope.queryUsers=function(){
      queryString = "SELECT Id,Name,UserType FROM User WHERE UserType = 'Standard'";
      vfr.query(queryString)
        .then(function(result){
          //console.log('result',result);
          $scope.Users = result.records;
        }, function(error){
          console.error('error', error);
        });
    }
    $scope.queryUsers();

/*------------------------------Function Queries All Project__c Records In The Org TO Form a DropDown List-------------------------------*/
    $scope.queryProjects=function(){
      queryString = "SELECT Id,Name FROM Project__c";
      vfr.query(queryString)
        .then(function(result){
          //console.log('result',result);
          $scope.Projects = result.records;
        }, function(error){
          console.error('error', error);
        });
    }
    $scope.queryProjects();

/*-------------------------Function Queries All Resource_Booking__c Record For selected Date's Week-----------------------------------------*/
    $scope.queryResouceData=function(){      
      queryString = 'SELECT Date__c,'+
                      ' Id,'+
                      ' Name,'+
                      ' User__c,'+
                      ' Project__c,'+
                      ' SundayHours__c,'+
                      ' MondayHours__c,'+
                      ' TuesdayHours__c,'+
                      ' WednesdayHours__c,'+
                      ' ThursdayHours__c,'+
                      ' FridayHours__c,'+
                      ' SaturdayHours__c'+
                      ' FROM Resource_Booking__c';
            
      if(queryArray.length > 0){
        queryString = queryString +' WHERE ';
        queryString = queryString + queryArray.join(' And ');
      }
      console.log('Query String--',queryString);    
      vfr.query(queryString)
        .then(function(result){
          console.log('result',result);
          console.log('result-------------==',result);
          $scope.ResourceBooking.data = result.records;

          console.log('$scope.ResourceBooking.data---++',$scope.ResourceBooking.data);
          queryArray =[];
        }, function(error){
          console.error('error', error);
          queryArray =[];
        });

        $scope.GridDisplayData = $scope.ResourceBooking.data;
        console.log('$scope.GridDisplayData--',$scope.GridDisplayData);
    }

/*--------------------------------------------------------------------------------------------------------------------------------------*/
    $scope.buildQuery=function(){
      convertedDate = new Date($scope.date);
      console.log('convertedDate',convertedDate);
      first = convertedDate.getDate() - convertedDate.getDay();                           // First day =day of the month - the day of the week
      firstDayOfWeek = new Date(convertedDate.setDate(first));
      lastDayOfWeek = new Date(convertedDate.setDate(first+6));

      var dateOne = $scope.formatDate(firstDayOfWeek);
      var dateTwo = $scope.formatDate(lastDayOfWeek);

      queryArray.push("Date__c >= "+ dateOne);
      queryArray.push("Date__c <= "+ dateTwo);

      if(angular.isDefined($scope.selectedUser) && $scope.selectedUser!=''){
        queryArray.push("User__c = '"+ $scope.selectedUser + "'");
      }
      if(angular.isDefined($scope.selectedProject) && $scope.selectedProject!=''){
      queryArray.push("Project__c = '"+ $scope.selectedProject + "'");
      }
      $scope.queryResouceData();                                                //Call to queryResouceData() after rquiered variable gets data
    }

/*---------------------------------------------------Format Date as requiered in SOQL query------------------------------------------------*/
    $scope.formatDate=function(DayOfWeek){
      var year = new Date(DayOfWeek).getFullYear();
      var month = new Date(DayOfWeek).getMonth()+1;
      var date = new Date(DayOfWeek).getDate();
      var formatedDate = year+'-0' + month + '-'+date; 
      return formatedDate;
    }

/*------------------------------------------------------Watcher To Enable/Disable GetValues Button-----------------------------------------*/
    /*$scope.$watch("date", function (newValue) {
      console.log('watcher RUN-----------');
      $scope.disableButton= "false";
    });*/
/*------------------------------------------------------Add New Row to Grid on ButtonClick-----------------------------------------*/
  $scope.addRow = function(){
    $scope.ResourceBooking.data.push({}); 
  }
  
  });
