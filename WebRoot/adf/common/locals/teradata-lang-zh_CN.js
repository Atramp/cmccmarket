if (Teradata.widget.TextField) {
	Teradata.apply(Teradata.widget.TextField.prototype, {
		minLengthText : "该输入项的最小长度是 {0} 个字符",
		maxLengthText : "该输入项的最大长度是 {0} 个字符",
		requiredText : "该输入项必需填写",
		regexText : "正则表达式校验错误",
		emptyText : null
	});
}

if (Teradata.widget.EmailField) {
	Teradata.apply(Teradata.widget.EmailField.prototype, {
		regexText : "不是正确的E-Mail地址格式（例如：example@domain.com）"
	});
}

if (Teradata.widget.NumberField) {
	Teradata.apply(Teradata.widget.NumberField.prototype, {
		regexText : "只能输入数字",
		minValueText: "该输入项的值不能小于{0}",
		maxValueText: "该输入项的值不能大于{0}",
		precisionText: "该输入项的值只能精确到小数点后 {0} 位",
		integerText: '该输入项的值只能为整数'
	});
}

if (Teradata.widget.Combo) {
	Teradata.apply(Teradata.widget.Combo.prototype, {
		requiredText : "请选择一个选项"
	});
}

if (Teradata.widget.CheckboxGroup) {
	Teradata.apply(Teradata.widget.CheckboxGroup.prototype, {
		requiredText : "请至少勾选一个选项"
	});
}

if (Teradata.widget.RadioGroup) {
	Teradata.apply(Teradata.widget.RadioGroup.prototype, {
		requiredText : "请勾选一个选项"
	});
}

if (Teradata.widget.DatePicker) {
	Teradata.apply(Teradata.widget.DatePicker.prototype, {
		yearMonthText: '{0}年 &nbsp;&nbsp;{1}',
		mousewheelTip: '滚动鼠标滚轮可调整'
	});
}

if (Teradata.widget.DateField) {
	Teradata.apply(Teradata.widget.DateField.prototype, {
		selectButtonText: '确定',
		todayButtonText: '今天',
		minDateText: '该日期必须在 {0} 之后',
		maxDateText: '该日期必须在 {0} 之前',
		betweenDateText: '该日期必须在  {0} 到 {1} 之间'
	});
}

if (Teradata.widget.layout.FormLayout) {
	Teradata.apply(Teradata.widget.layout.FormLayout.prototype, {
		separator : '：'
	});
}

if (Teradata.widget.GridPanel) {
	Teradata.apply(Teradata.widget.GridPanel.prototype, {
		loadingText : '正在加载 ...'
	});
}

Date.monthNames = [
	"一月",
	"二月",
	"三月",
	"四月",
	"五月",
	"六月",
	"七月",
	"八月",
	"九月",
	"十月",
	"十一月",
	"十二月"
];

Date.dayNames = [
    '日',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六'
];
