'use strict';

angular.module('demoPage', ['ngRoute','demoPage-main','templates'])
  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('demoPage-main',['ngRoute','ngForce','ui.bootstrap'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  })
  .controller('MainCtrl', function ($scope,$injector,vfr,$interval,$q, $rootScope) {
    var queryArray=[];             //Array of query variable Which Will Be Used To From Query With Where Clause
    var first = '';
    var queryString ='';          //Store SOQL Query in String Format
    var convertedDate = '';
    var firstDayOfWeek = '';              
    var lastDayOfWeek = '';
  
    $scope.date = '';
    $scope.selectedUser = '';
    $scope.noRecordsMsg = '';
    $scope.tableHide = true;
    $scope.disableGetDataButton = true;
    $scope.disableAddRowButton = true;
    $scope.Users = [];
    $scope.Projects = [];
    $scope.ArrayToSort = [];
    $scope.ResourceBooking = {};             //Object Storing Queried data of Resource_Booking__c
    $scope.DisplayResourceBooking = [];
    $scope.totalItems = '';
    
    $scope.sortingOrder = 'asc';
    $scope.currentSortField = 'User__c';
    $scope.editedRow ='';      
    $scope.currentPage = 2;
    $scope.itemsPerPage = 4;

    $scope.popup = {
      opened: false
    };

    $scope.queryUsers=function(){
      queryString = "SELECT Id,Name,UserType FROM User WHERE UserType = 'Standard'";
      vfr.query(queryString)
        .then(function(result){
          $scope.Users = result.records;
        }, function(error){
          console.error('error', error);
        });
    }
    $scope.queryUsers();

    $scope.queryProjects=function(){
      queryString = "SELECT Id,Name FROM Project__c";
      vfr.query(queryString)
        .then(function(result){
          $scope.Projects = result.records;
        }, function(error){
          console.error('error', error);
        });
    }
    $scope.queryProjects();

    $scope.queryResouceData=function(){      
      queryString = 'SELECT'+
                      ' Id,'+
                      ' Name,'+
                      ' User__c,'+
                      ' Date__c,'+
                      ' Project__c,'+
                      ' SundayHours__c,'+
                      ' MondayHours__c,'+
                      ' FridayHours__c,'+
                      ' SaturdayHours__c,'+
                      ' TuesdayHours__c,'+
                      ' ThursdayHours__c,'+
                      ' WednesdayHours__c'+
                      ' FROM Resource_Booking__c';
            
      if(queryArray.length > 0){
        queryString = queryString +' WHERE ';
        queryString = queryString + queryArray.join(' And ');
      }    
      vfr.query(queryString)
        .then(function(result){

          if(result.records.length>0){
            queryArray =[];
            $scope.noRecordsMsg='';
            $scope.ResourceBooking = result.records;
            $scope.totalItems = $scope.ResourceBooking.length;
          
          }else{
            queryArray =[];
            $scope.noRecordsMsg='No Records For Selected Date.';
          }
        }, function(error){
          queryArray =[];
          console.error('error', error);
        });
    }

    $scope.buildQuery=function(){
      convertedDate = new Date($scope.date);
      first = convertedDate.getDate() - convertedDate.getDay();      // First day =day of the month - the day of the week
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
      $scope.queryResouceData();                 //Call to queryResouceData() after rquiered variable gets data
      $scope.tableHide = false;
      $scope.disableAddRowButton = false;
    }

    $scope.formatDate=function(DayOfWeek){
      var date = new Date(DayOfWeek).getDate();
      var month = new Date(DayOfWeek).getMonth()+1;
      var year = new Date(DayOfWeek).getFullYear();
      if(date<10){
        date = '0'+date;
      }
      if(month<10){
        month = '0'+month;
      }
      var formatedDate = year+'-'+month+'-'+date; 
      return formatedDate;
    }

    $scope.$watch("date", function (newValue,oldValue) {
      if(newValue != oldValue){
        $scope.disableGetDataButton = false;
      }
    }); 

    $scope.sortColumn = function(col) {
        if($scope.currentSortField != col) {
          $scope.currentSortField = col;
          $scope.sortingOrder = 'asc';
        } else {
          if($scope.sortingOrder == 'asc') {
            $scope.sortingOrder = 'desc';
          } else {
            $scope.sortingOrder = 'asc';
          }
        }
        sorter();
      }
   
      function sorter(){
        var sortingField = angular.copy($scope.currentSortField);
        var sortingFieldUser = angular.copy($scope.currentSortField);
        var sortingOrder = angular.copy($scope.sortingOrder);
        $scope.ResourceBooking.sort(function(a, b){
          var sortingVarA = '';
          var sortingVarB = '';
          if(sortingField == 'Project__c' || sortingField == 'User__c'){
            
            if(sortingField == 'User__c'){
              sortingField = 'User';
              sortingFieldUser = 'User__c';
            }

            sortingVarA = $rootScope[sortingField][a[sortingFieldUser]];
            sortingVarB = $rootScope[sortingField][b[sortingFieldUser]];
            if(sortingOrder == 'asc') {
              return sortingVarA < sortingVarB;
            } else {
                return sortingVarA > sortingVarB;
            }
          } else {
            var dateA = new Date(a[sortingField]);
            var dateB = new Date(b[sortingField]);
            if(sortingOrder == 'asc') {
              return dateA > dateB;
            } else {
              return dateA < dateB ;
            }
          }        
        });
      }    

    $scope.openDatePicker = function() {
      $scope.popup.opened = true;
    };
    $scope.setDate = function(year, month, day) {
      $scope.date = new Date(year, month, day);
    };

    $scope.addRow = function(){
      $scope.ResourceBooking.push({});
      $scope.totalItems = $scope.totalItems +1;
    } 

    $scope.saveIt = function() {
      console.log('ResourceBooking saveIt---',$scope.ResourceBooking);
      var updateObj = angular.copy($scope.ResourceBooking);
      for(var k = 0; k < updateObj.length; k++){
        delete updateObj[k].attributes;
      first = new Date(updateObj[k].Date__c).getDate() - new Date(updateObj[k].Date__c).getDay();    
      updateObj[k].Date__c = $scope.formatDate(new Date(new Date(updateObj[k].Date__c).setDate(first)));
      }           
      console.log('updateOBJ -->>>',updateObj);
       console.log('updateOBJ JSON -->>>', angular.toJson(updateObj));

      vfr.bulkUpdate('Resource_Booking__c',angular.toJson(updateObj))
        .then(function(result){
          console.log('Record Inserted/Updated Successfully');
          $q.resolve();          
        }, function(error){
          console.error('error', error);
        });
    };

  //vfRemote.send = vfRemote.send('ngResourceBookingController.upsert2', standardOptions, true);
})
.directive("dayDirective",function(){
  return{
    scope: {
      displayObj: '=',
      day: '='
    },
    templateUrl:"views/dayDirective.html",
    controller: function($scope, $rootScope, vfr) {     

      $scope.$watch("day", function (newValue,oldValue) {
        if(newValue != oldValue){
          console.log('new displayObj value->>',$scope.displayObj);
          console.log('new dirtyCheck value->>',$scope.day);
        }
      });
    }
  };
})
.directive("typeaheadDirective",function(){
    return{
      scope: {
        type: '@',
        currData: '='
      },
      templateUrl: "views/typeaheadDirective.html",
      controller: function($scope, $rootScope, vfr) {
        if(!$rootScope[$scope.type]) {
          $rootScope[$scope.type] = {};
        }
        vfr.query("Select Id, Name from " + $scope.type + " where Id='" + $scope.currData + "'")
            .then(function(res){
              $scope.recName = (angular.isDefined(res.records[0])) ? res.records[0].Name : '';
              $rootScope[$scope.type][res.records[0].Id] = res.records[0].Name;
            });
        
        $scope.fetchRecordFromSobject = function(item) {
          var successFunction = function(result) {
            var records = [];
            angular.forEach(result.records, function(record, index){
              records.push({
                Name: record.Name,
                Id: record.Id
              });
            });
            return records;
          } 
          var failureFunction = function(error) {
            console.error('error', error);
          }
          return vfr.query('Select Id, Name from ' + $scope.type).then(successFunction, failureFunction);
        }

        $scope.onSelect = function($item, $model, $label, $event){
          console.log('$item Id onSelect->>',$item.Id);
          console.log('$item onSelect->>',$item);
          console.log('$label onSelect->>',$label);
          console.log('$model onSelect->>',$model);
          $scope.recName = $label;
          $scope.currData = $item.Id;
        }

        $scope.onNgChange = function() {
          if($scope.recName || $scope.recName == '') {
            $scope.currData = '';
          }
        }
      }
    };
})
.directive("dateDirective",function(){
  return{
    scope: {
      tblDate: '=',
      dateFormat: '@'
    },
    templateUrl:"views/dateDirective.html",
    controller: function($scope, $rootScope, vfr) {
      $scope.tblDate = new Date($scope.tblDate);
      
      $scope.open1 = function() {
        $scope.popup1.opened = true;
      };        
      $scope.popup1 = {
        opened: false
      };
    }
  };
});
