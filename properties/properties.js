define([

	'jquery',
	'qlik',
	'ng!$q',
	'ng!$http'

], function ($, qlik, $q, $http) {
	'use strict';

	var app = qlik.currApp();

	// var dimensions = {
	// 	uses: "dimensions",
	// 	min: 0,
	// 	max: 0
	// };

	// var sortingSection = {
	// 	uses: "sorting"
	// };

	var measures = {
		uses: "measures",
		min: 1,
		max: 2,
	};

	var toggleIcon = {
		type: "boolean",
		label: "Toggle Icon",
		ref: "toggleIcon",
		defaultValue: false
	}

	var appearanceSection = {
		uses: "settings",
		items: {
		}
	};

	var popupText = {
			ref: "popupText",
			label: "Popup Text",
			type: "string",
			defaultValue: ""
	}

	return {
		type: "items",
		component: "accordion",
		items: {
			// dimensions: dimensions,
			// sorting: sortingSection,
			measures: measures,
			appearance: appearanceSection,

			kpiSettings: {
				type: "items",
				label: "KPI Settings",
				items: {
					toggleIcon: toggleIcon,
					popupText: popupText
				}
			},
		}
	};



});
