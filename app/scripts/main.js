'use strict';

angular.module('demoPage', ['ngRoute','demoPage-main','templates'])
  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('demoPage-main',['ngRoute','ngForce','720kb.datepicker','ui.bootstrap'])
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
    var queryString ='';              //Store SOQL Query in String Format
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

    $scope.sortingOrder = 'asc';
    $scope.currentSortField = 'User__c';
    $scope.editedRow ='';
    $scope.totalItems = '';
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
      $scope.queryResouceData();                                //Call to queryResouceData() after rquiered variable gets data
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

    $scope.sortColumn = function(col) {
      // console.log('rootscope User', $rootScope.User);
      // console.log('rootscope project', $rootScope.Project__c);
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

    $scope.$watch("date", function (newValue,oldValue) {
      if(newValue != oldValue){
        $scope.disableGetDataButton = false;
      }
    });
    $scope.addRow = function(){
       $scope.ResourceBooking.push({});
       $scope.totalItems = $scope.totalItems +1;
      /*$scope.ResourceBooking.push({'Date__c':'','Project__c':'','SaturdayHours__c':'',
                                    'SundayHours__c':'','MondayHours__c':'','TuesdayHours__c':'',
                                    'WednesdayHours__c':'', 'ThursdayHours__c':'','FridayHours__c':''});*/
    }
    $scope.openDatePicker = function() {
      $scope.popup.opened = true;
    };

    $scope.setDate = function(year, month, day) {
      $scope.date = new Date(year, month, day);
    };


    $scope.saveIt = function(rowEntity) {
      var updateObj = angular.copy(rowEntity);
      var objId = updateObj.Id;      
      delete updateObj.attributes;

      if(angular.isDefined(rowEntity.Id)){
        delete updateObj.User_Name;
        delete updateObj.Project_Name;
        delete updateObj.Id;
        delete updateObj.Name;
        delete updateObj.Project__c;

        first = new Date(updateObj.Date__c).getDate() - new Date(updateObj.Date__c).getDay();    
        updateObj.Date__c = $scope.formatDate(new Date(new Date(updateObj.Date__c).setDate(first)));

        vfr.update('Resource_Booking__c', objId, angular.toJson(updateObj))
          .then(function(result){
            console.log('Record Updated Successfully');
            $q.resolve();          
          }, function(error){
            console.error('error', error);
          }); 
    }else{
      console.log('rowEntity w/o Id',updateObj);

      vfr.create('Resource_Booking__c', angular.toJson(updateObj))
        .then(function(result){
            console.log('Record Created Successfully');
            $q.resolve();          
          }, function(error){
            console.error('error', error);
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
          console.log('$item',$item.Id);
           console.log('$item---2',$item);
          $scope.recName = $label;
          $scope.currData = $model;
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
