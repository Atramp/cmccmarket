var branchStore = new Ext.data.DirectStore({
    paramsAsHash: true,
    directFn: PermissionDomain.getBranchByName,
    fields: [{name: 'code'}, {name: 'name'}]
});
var deptStore = new Ext.data.DirectStore({
    paramsAsHash: true,
    directFn: PermissionDomain.getDeptByName,
    fields: [{name: 'code'}, {name: 'name'}]
});
var roleStore = new Ext.data.DirectStore({
    paramsAsHash: true,
    directFn: PermissionDomain.geAllRoleGroup,
    fields: [{name: 'ROLE_ID'}, {name: 'ROLE_NAME'}]
});
var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

var userAddForm = new Ext.form.Panel({
    // renderTo: 'form-ct',
    frame: false,
    border: false,
    width: '100%',
    waitMsgTarget: true,
    fieldDefaults: {
        labelAlign: 'right',
        labelWidth: 85,
        msgTarget: 'side'
    },
    items: [{
        xtype: 'fieldset',
        title: '用户注册',
        defaultType: 'textfield',
        items: [{
            fieldLabel: '姓名',
            afterLabelTextTpl: required,
            allowBlank: false,
            tooltip: '输入真实姓名',
            emptyText: '真实姓名',
            name: 'USER_REAL_NAME'
        }, {
            fieldLabel: '用户名',
            emptyText: '登录用户名',
            afterLabelTextTpl: required,
            allowBlank: false,
            name: 'USER_NAME'
        }, {
            fieldLabel: '密码',
            emptyText: '登录密码',
            afterLabelTextTpl: required,
            allowBlank: false,
            inputType: 'password',
            name: 'userPwd'
        }, {
            xtype: 'combobox',
            forceSelection: true,
            fieldLabel: '省份',
            afterLabelTextTpl: required,
            allowBlank: false,
            name: 'USER_BRANCH_GROUP',
            id: 'USER_BRANCH_GROUP',
            store: branchStore,
            loadingText: '正在加载...',
            valueField: 'name',
            displayField: 'name',
            emptyText: '选择所属省份...',
            hiddenValue: 'code',
            hiddenName: 'code',
            listeners: {
                afterRender: function (combo) {
                    this.setRawValue("集团");
                }
            }
        }, {
            xtype: 'combobox',
            forceSelection: true,
            fieldLabel: '部门',
            afterLabelTextTpl: required,
            allowBlank: false,
            name: 'USER_DEPT_GROUP', id: 'USER_DEPT_GROUP',
            store: deptStore,
            loadingText: '正在加载...',
            valueField: 'name',
            displayField: 'name',
            emptyText: '选择所属部门...',
            listeners: {
                afterRender: function (combo) {
                    this.setRawValue("市场部");
                }
            }
        }

        ]
    }]
});


    