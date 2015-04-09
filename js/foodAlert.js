Menus = new Mongo.Collection("Menus");
Records = new Mongo.Collection("Records");



if (Meteor.isClient) {
  Router.route('/response/:someValue', function () {
  console.log(params.someValue);
  },
  {where: 'server'});

	Schemas = {};
	Template.registerHelper("Schemas", Schemas);

	var Collections = {};
	Template.registerHelper("Collections", Collections);

	PendingRequests = Collections.PendingRequests = new Mongo.Collection("PendingRequests");
	ConfirmedRequests = Collections.ConfirmedRequests = new Mongo.Collection("ConfirmedRequests");

	Meteor.subscribe("ConfirmedRequests");
	Meteor.subscribe("PendingRequests");
	Meteor.subscribe("Menus");
	Meteor.subscribe("Records");

	Schemas.PendingRequest = new SimpleSchema({
		number : {
			type: String,
			label: "Phone Number",
			min: 10,
			max: 10
		},
		request: {
			type: Object
		},
		'request.food': {
			type: String,
			label: "Food",
			max: 40 
		},
		'request.location': {
			type: String,
			label: "Dining Hall",
			allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox'],
			autoform: {
				options: [
				{label: "Center for Jewish Life", value: "Center for Jewish Life"},
				{label: "Forbes", value: "Forbes"},
				{label: "Rocky/Mathey", value: "Rocky/Mathey"},
				{label: "Whitman", value: "Whitman"},
				{label: "Wu/Wilcox", value: "Wu/Wilcox"}
				]
			}
		} 
	});

	Schemas.ConfirmedRequest = new SimpleSchema({
		number: {
			type: String,
			label: "Phone Number",
			min: 10,
			max: 10
		},
		requests: {
			type: Array,
			optional: true
		},
		'requests.$': {
			type: Object
		},
		'requests.$.food': {
			type: String,
			label: "Food",
			max: 40 
		},
		'requests.$.location': {
			type: String,
			label: "Dining Hall",
			allowedValues:['Center for Jewish Life', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox'],
			autoform: {
				options: [
				{label: "Center for Jewish Life", value: "Center for Jewish Life"},
				{label: "Forbes", value: "Forbes"},
				{label: "Rocky/Mathey", value: "Rocky/Mathey"},
				{label: "Whitman", value: "Whitman"},
				{label: "Wu/Wilcox", value: "Wu/Wilcox"}
				]
			}
		}
	});

	PendingRequests.attachSchema(Schemas.PendingRequest);
	ConfirmedRequests.attachSchema(Schemas.ConfirmedRequest);

	// Meteor.publish("Collections.PendingRequests", function () {
	// 	return PendingRequests.find();
	// });

	// Requests.allow({
	// 	update: function () {
	// 		return true;
	// 	}
	// });


	// Meteor.publish("Collections.ConfirmedRequests", function () {
	// 	return Requests.find();
	// });

	// ConfirmedRequests.allow({
	// 	update: function () {
	// 		return true;
	// 	}
	// });

	// Template.body.events({

	// 	"click .sendPin": function () {
	// 		var pin = Math.round(Math.random() * 1000);
	// 		Meteor.call("sendSMS", pin);
 //    	}
	// )};

	Template.body.events({
		"click .test": function () {
			console.log("yup");
			Meteor.call("testMenus");
		}
	});

	Template.body.helpers({
		users: function () {
			return Requests.find({}, {sort: {createdAt: -1}});
		},
		exampleDoc: function () {
			return Requests.findOne();
		}
	});

	Template.form.events({
		'submit ' : function () {
			console.log("hello");
			var number = AutoForm.getFieldValue("number", "form");
			var food = AutoForm.getFieldValue("request.food", "form");
			var location = AutoForm.getFieldValue("request.location", "form");
			console.log(number);
			console.log(food);
			console.log(location);
			Meteor.call("sendSMS", number, food, location);
		}
	});
}



if (Meteor.isServer) {
  Router.route('/response/:someValue', function () {
  console.log(params.someValue);
  },
  {where: 'server'});

	/********** UPDATING MENUS DAILY *******/
	var getMenus = function () {
		Meteor.http.get('https://api.parse.com/1/classes/Menu', {
			headers: {'content-type': 'application/json',
			'X-Parse-Application-Id': 'PtiTO2iCbTqWljw2NBSFfsypu4ZxR8gJexnHPoea',
			'X-Parse-REST-API-Key': '4k9UZsWoBklkdRK8JXntG1XP3TjFvU4CwTbIDIhS',
		}
	}, function(error, result){
		var json = JSON.parse(result.content)["results"];
		updateMenus(json);
		updateHistory(json);
	});
	};

	var updateMenus = function (json) {
		Menus.remove({});
		json.forEach(function(hall) {
			var location = hall['location'];
			var menu = hall['menu'];
			var items = menu.split(':');
			items.forEach(function(item) {
				Menus.insert({
					'food': item,
					'location': location,
          			 // 'meal': meal,
          			});
			});
		});
	};

	var updateHistory = function (json) {
		json.forEach(function(hall) {
			var loc = hall['location'];
			var menu = hall['menu'];
			var items = menu.split(':');
			items.forEach(function(item) {
				if (Records.findOne({'food': item})) {
					var record = {};
					record[loc] = true;
					Records.update({'food': item}, {$set: record});
				} else {
					var record = {};
					record['food'] = item;
					record[loc] = true;
					Records.insert(record);
				}


			});
		});
	};

	var cronUpdateMenus = new Meteor.Cron({
		events: {
			"0 6 * * *" : getMenus,
		}
	});
	/*************************************/



	/******* SENDING OUT REQUESTS *********/
	var sendRequests = function(phone, results) {
		// concatenate string using results array, then send to phone


	};

	var validateRequests = function () {
		ConfirmedRequests.find().forEach(function(request) {
			var phone = request['number'];
			var results = [];

			request['request'].forEach(function(entry) {
				var food = entry['food'];
				var loc = entry['location'];

				if (loc == 'All') {
					if (Menus.findOne({'food': food})) {
						// success!
						results.push({
							'food': food,
							'location': loc,
						});
					}
				} else {
					var item = Menus.findOne({'food': food});
					if (item) {
						if (item[loc]) {
							// success!
							results.push({
								'food': food,
								'location': loc,
							});
						}
					}

				}
			});

			sendRequests(phone, results);
		});
	};

	var cronSendMessages = new Meteor.Cron({
		events: {
			"0 12 * * *" : validateRequests,
		}
	});
	/***************************/



	Meteor.methods({
		sendSMS: function (number, food, location) {
			Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/AC22ef9acc63bf954b3e9fdff5762f0bfc/SMS/Messages.json',
			{
				params:{From:'+16098794415', To: number, Body: 'Food: ' + food + 'Location: ' + location},
				auth: 'AC22ef9acc63bf954b3e9fdff5762f0bfc:5eca12596eaa0ccb2e73d1aa6aa419c0',
				headers: {'content-type':'application/x-www-form-urlencoded'}
			}, function () {
				console.log(arguments)
			});
		},


	});
}
