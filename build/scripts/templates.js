angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("views/main.html","<div class=\"rootDiv\">\r\n	<div>\r\n		<h4>Date:</h4> \r\n		<div style=\"width: 30%\">\r\n		  	<datepicker date-format=\"fullDate\">\r\n			  <input ng-model=\"date\" type=\"text\"/>\r\n			</datepicker>\r\n		</div>\r\n		<h4>Users:</h4> \r\n				<select ng-model=\"selectedUser\">\r\n					<option value=\"\">--None--</option>\r\n	        		<option ng-repeat=\"User in Users\" value=\"{{User.Id}}\">{{User.Name}}</option>\r\n	    		</select>\r\n\r\n    	<h4 style=\"margin-left: 5em\">Projects:</h4> \r\n    			<select ng-model=\"selectedProject\">\r\n			 		<option value=\"\">--None--</option>\r\n        			<option ng-repeat=\"Project in Projects\" value=\"{{Project.Id}}\">{{Project.Name}}</option>\r\n    			</select>\r\n \r\n    	<input type=\"button\" value=\"Get Data\" ng-click=\"buildQuery()\" style=\"margin-left: 5em\">\r\n	</div>\r\n\r\n\r\n	<div>\r\n		<div ui-grid=\"ResourceBooking\" ui-grid-edit ui-grid-row-edit ui-grid-cellNav class=\"grid\"></div>\r\n	</div>\r\n\r\n</div>");}]);