Meteor.subscribe("ConfirmedRequests");
// Meteor.subscribe("PendingRequests");
// Meteor.subscribe("Menus");
Meteor.subscribe("Records");
Meteor.subscribe("PendingDeletion");
// Meteor.subscribe("NoRequests");
// Meteor.subscribe("PendingDeletion");

PendingRequest = new SimpleSchema({
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
		allowedValues:['Center for Jewish Life', 'Graduate College', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox', "All"],
		autoform: {
			options: [
			{label: "Center for Jewish Life", value: "Center for Jewish Life"},
			{label: "Graduate College", value: "Graduate College"},
			{label: "Forbes", value: "Forbes"},
			{label: "Rocky/Mathey", value: "Rocky/Mathey"},
			{label: "Whitman", value: "Whitman"},
			{label: "Wu/Wilcox", value: "Wu/Wilcox"},
			{label: "All", value: "All"},
			]
		}
	} 
});

PartialRequest = new SimpleSchema({
	number : {
		type: String,
		label: "Phone number",
		min: 10,
		max: 14
	},
	location: {
		type: String,
		label: 'Dining hall',
		allowedValues:['Center for Jewish Life', 'Graduate College', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox', "All"],
		autoform: {
			options: [
			{label: "Center for Jewish Life", value: "Center for Jewish Life"},
			{label: "Graduate College", value: "Graduate College"},
			{label: "Forbes", value: "Forbes"},
			{label: "Rocky/Mathey", value: "Rocky/Mathey"},
			{label: "Whitman", value: "Whitman"},
			{label: "Wu/Wilcox", value: "Wu/Wilcox"},
			{label: "All", value: "All"}
			]
		}
	}
	
});

Record = new SimpleSchema({
	food: {
		type: String,
		label: "Food"
	}
});

ConfirmedRequest = new SimpleSchema({
	number: {
		type: String,
		label: "Phone Number",
		min: 10,
		max: 12
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
		allowedValues:['Center for Jewish Life', 'Graduate College', 'Forbes', 'Rocky/Mathey', 'Whitman', 'Wu/Wilcox', 'All']
	}
});

PendingRequests.attachSchema(PendingRequest);
ConfirmedRequests.attachSchema(ConfirmedRequest);
Records.attachSchema(Record);
PartialRequests.attachSchema(PartialRequest);
NoRequests.attachSchema(ConfirmedRequest);
PendingDeletion.attachSchema(ConfirmedRequest);

PendingRequests.allow({
	insert: function () {
		return true;
	}
});

// Records.allow({
// 	update: function () {
// 		return true;
// 	},
// 	insert: function () {
// 		return true;
// 	}
// });

// PartialRequests.allow({
// 	update: function () {
// 		return true;
// 	},
// 	insert: function () {
// 		return true;
// 	}
// });

ConfirmedRequests.allow({
	update: function () {
		return true;
	},
	remove: function () {
		return true;
	}
});

PendingDeletion.allow({
	insert: function () {
		return true;
	},
	remove: function () {
		return true;
	}
})

Template.body.events({
	"click .validate": function () {
		Meteor.call("testValidate");
	},
	"click .clearPending": function () {
		Meteor.call("clearPendingRequests");
	},
	"click .clearConfirmed": function () {
		Meteor.call("clearConfirmedRequests");
	},
	"click .getMenus": function () {
		Meteor.call("getMenus");
	},
	"click .clearMenus": function () {
		Meteor.call("clearMenus");
	},
	"click .faq": function () {
		bootbox.dialog({
			message:
			"<p><b>The dining hall did not actually have my requested food. What gives?</b></p> \
			<p>Sorry! Sometimes the dining halls deviate from posted menus. We're currently talking with them to try and fix the issue!</p><br> \
			<p><b>The food search doesn't have the food I want! You guys need to step up your game.</b></p> \
			<p>First of all, that's not a question. We're currently in the process of building our database and everything will be in soon! Please send an email to princetonmealscout@gmail.com with your requested dining hall, menu itmem, and phone number, and we'll enter it for you once our database is finished.</p><br> \
			<p><b>I love MealScout! How can I contact you/send you gifts?</b></p> \
			<p>Contact us at princetonmealscout@gmail.com for questions, comments, and suggestions!</p><br>",
			title: "Frequently Asked Questions",
		});
	},
	"click .seeRequests": function () {
		bootbox.prompt("Enter your phone number", function (result) {
			if (result == null) {
				return true;
			}
			var number = result.replace(/[^a-zA-Z0-9]/g, '');
			number = "+1".concat(number);
			if (ConfirmedRequests.find({number: number}).count() === 0) {
				bootbox.alert({
					size: 'medium',
					message: "No records found.",
					callback: function() {}
				
				})
			} else {
				Blaze.renderWithData(Template.sort, number, document.body);
			}
		})
	}
});

// Template.body.helpers({
// 	users: function () {
// 		return Requests.find({}, {sort: {createdAt: -1}});
// 	},
// 	exampleDoc: function () {
// 		return Requests.findOne();
// 	}
// });

Template.form.events({
	'submit ' : function () {
		event.preventDefault();
		var food = $('#food').val();

		if (Records.find({food: food}).count() === 0) {
			bootbox.alert({ 
    			size: 'medium',
    			message: "You didn't enter a valid food! Make sure you spell it exactly the way it shows up in the search.", 
    			callback: function(){ /* your callback code */ }
			})
		}

		else {
		var location = AutoForm.getFieldValue("location", "requestForm");
		var result = AutoForm.getFieldValue("number", "requestForm");
		var number = result.replace(/[^a-zA-Z0-9]/g, '');
		var numberAdded = "+1".concat(number);
		var food = $('#food').val();

		$('#food').val('');
		$('#location').val('');

		if (ConfirmedRequests.find({number: numberAdded}).count() === 0) {
			Meteor.call("newUser", numberAdded);
		}

		bootbox.alert("A confirmation message has been sent to your number. Please reply 'yes' to confirm this request.");
		Meteor.call("addPendingRequest", numberAdded, food, location);
	}
	}
});

Template.form.helpers({
  settings: function() {
    return {
      position: "bottom",
      limit: 5,
      rules: 
      [
      {
          collection: Records,
          field: 'food',
          matchAll: true,
          template: Template.foodFill,
          selector: function (match) {
          	regex = new RegExp(match, 'i');
          	var location = AutoForm.getFieldValue("location", "requestForm");
          	if (location === "Forbes") {
          		return {$and: [{'food': regex}, {'Forbes': true}]}
          	}
          	else if (location === "Graduate College") {
          		return {$and: [{'food': regex}, {'Graduate College': true}]}
          	}
          	else if (location === "Center for Jewish Life") {
          		return {$and: [{'food': regex}, {'Center for Jewish Life': true}]}
          	}
          	else if (location === "Rocky/Mathey") {
          		return {$and: [{'food': regex}, {'Rocky/Mathey': true}]}
          	}
          	else if (location === "Whitman") {
          		return {$and: [{'food': regex}, {'Whitman': true}]}
          	}
          	else if (location === "Wu/Wilcox") {
          		return {$and: [{'food': regex}, {'Wu/Wilcox': true}]}
          	}
          	else {
          		return {'food': regex}
          	}
          }
        }
        ] 
    };
  },
  records: function() {
  	return Records.find().fetch();
  }
});


Template.update.helpers({
	updateDoc: function(number) {
		return ConfirmedRequests.findOne({number: number});
	}
});

Template.sort.helpers({
	RequestsToSort: function() {
		var number = Blaze.getData();
			return ConfirmedRequests.findOne({number: number})['requests'];
	},
	getNumber: function() {
		var number = Blaze.getData();
		Session.set('savedNumber', number);
		return number;
	}
});

Template.sortable.events({
  'click .close': function (event, template) {
    // `this` is the data context set by the enclosing block helper (#each, here)
    // NEED TO MAKE THIS INTO A REVERSE TRANSFER
    var number = Session.get('savedNumber');
    var food = this['food'];

    Meteor.call("reverseTransferRequest", number, food);
    bootbox.alert("A confirmation message has been sent to your number. Please reply 'delete' to confirm this deletion or 'save' to cancel deletion.");
    // Meteor.call("removeConfirmedRequest", food);
    //template.collection.remove(this._id);
    // // custom code, working on a specific collection
    // if (Attributes.find().count() === 0) {
    //   Meteor.setTimeout(function () {
    //     Attributes.insert({
    //       name: 'Not nice to delete the entire list! Add some attributes instead.',
    //       type: 'String',
    //       order: 0
    //     })
    //   }, 1000);
    // }
  }
});




