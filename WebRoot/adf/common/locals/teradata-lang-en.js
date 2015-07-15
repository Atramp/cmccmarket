if (Teradata.widget.TextField) {
	Teradata.apply(Teradata.widget.TextField.prototype, {
		minLengthText : "The minimum length for this field is {0}",
		maxLengthText : "The maximum length for this field is {0}",
		requiredText : "This field is required",
		regexText : "Regular expression validation error",
		emptyText : null
	});
}

if (Teradata.widget.EmailField) {
	Teradata.apply(Teradata.widget.EmailField.prototype, {
		regexText : "Invalid email address format(Example: example@domain.com)"
	});
}

if (Teradata.widget.NumberField) {
	Teradata.apply(Teradata.widget.NumberField.prototype, {
		regexText : "This field can only enter a number",
		minValueText: "The minimum value for this field is {0}",
		maxValueText: "The maximum value for this field is {0}",
		precisionText: "The precision for this field is {0}",
		integerText: 'The field can only enter a integer'
	});
}

if (Teradata.widget.Combo) {
	Teradata.apply(Teradata.widget.Combo.prototype, {
		requiredText : "Please select an option"
	});
}

if (Teradata.widget.CheckboxGroup) {
	Teradata.apply(Teradata.widget.CheckboxGroup.prototype, {
		requiredText : "Please check at least one option"
	});
}

if (Teradata.widget.RadioGroup) {
	Teradata.apply(Teradata.widget.RadioGroup.prototype, {
		requiredText : "Please check an option"
	});
}

if (Teradata.widget.DatePicker) {
	Teradata.apply(Teradata.widget.DatePicker.prototype, {
		yearMonthText: '{1} {0}',
		mousewheelTip: 'Sliding the mouse wheel to adjust'
	});
}

if (Teradata.widget.DateField) {
	Teradata.apply(Teradata.widget.DateField.prototype, {
		selectButtonText: 'OK',
		todayButtonText: 'Today',
		minDateText: 'The date must be after {0}',
		maxDateText: 'The date must be before {0}',
		betweenDateText: 'The date must be between {0} to {1}'
	});
}

if (Teradata.widget.layout.FormLayout) {
	Teradata.apply(Teradata.widget.layout.FormLayout.prototype, {
		separator : ':'
	});
}

if (Teradata.widget.GridPanel) {
	Teradata.apply(Teradata.widget.GridPanel.prototype, {
		loadingText : 'Loading ...'
	});
}

Date.monthNames = [
   	"Jan",
   	"Feb",
   	"Mar",
   	"Apr",
   	"May",
   	"Jun",
   	"Jul",
   	"Aug",
   	"Sept",
   	"Oct",
   	"Nov",
   	"Dec"
];

Date.dayNames = [
    'Sun',
    'Mon',
    'Tues',
    'Wed',
    'Thurs',
    'Fri',
    'Sat'
];