Ext.define('Ext.app.GridUser', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.griduser',
    uses: [
        'Ext.data.ArrayStore'
    ],
    height: 300,
    initComponent: function () {
        var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false,
            saveBtnText: '保存修改',
            cancelBtnText: "取消",
            autoCancel: false
        });

        var store = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'USER_ID'}, {name: 'USER_REAL_NAME'}, {name: 'USER_NAME'},
                {name: 'USER_BRANCH_GROUP'}, {name: 'USER_ROLE_GROUP'}, {name: 'USER_BRANCH_GROUP'},
                {name: 'USER_DEPT_GROUP'}, {name: 'USER_STATUS'}
            ],
            proxy: {
                type: 'ajax',
                url: this.selectUrl,
                sortParam: undefined,
                startParam: undefined,
                pageParam: undefined,
                limitParam: undefined,
                extraParams: {
                    'USER_ID': this.USER_ID
                },
                reader: {
                    type: 'json',
                    root: 'user'
                }
            },
            autoLoad: true  //即时加载数据
        });

        var resetGrid = this.gridId;
        var updatePwd_url = this.updatePwdUrl;
        var update_url = this.updateUrl;
        Ext.apply(this, {
            height: this.height,
            id: resetGrid,
            store: store,
            stripeRows: true,
            columnLines: true,
            plugins: [rowEditing],
            columns: [{
                text: '真实姓名',
                flex: 1,
                sortable: true,
                dataIndex: 'USER_REAL_NAME', editor: {allowBlank: false}
            }, {
                text: '用户名',
                width: 100,
                sortable: true,
                dataIndex: 'USER_NAME', editor: {allowBlank: false}
            }, {
                text: '所属省份',
                width: 75,
                sortable: true,
                dataIndex: 'USER_BRANCH_GROUP'
            }, {
                text: '角色',
                width: 150,
                sortable: true,
                dataIndex: 'USER_ROLE_GROUP'
            }, {
                menuDisabled: true, sortable: false,
                xtype: 'actioncolumn',
                text: "操作", flex: 1,
                items: [{}, {
                    iconCls: 'user_edit',
                    tooltip: '修改用户密码',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        updateUserPwd(rec, 'single');
                    }
                }, {}]
            }]
        });

        this.callParent(arguments);

        //修改用户各对象
        this.on('edit', function (editor, record) {
            Ext.Ajax.request({
                url: update_url,
                params: record.record.data,
                method: 'POST',
                success: function (response, opts) {
                    var message = Ext.JSON.decode(response.responseText);
                    if (message.message) {
                        Ext.MessageBox.show({
                            title: "提示",
                            msg: "修改失败!" + message.message,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    } else {
                        Ext.MessageBox.show({
                            title: "提示",
                            msg: "修改成功!",
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                    Ext.getCmp(resetGrid).store.reload();
                },
                failure: function () {
                    Ext.MessageBox.show({
                        title: "提示",
                        msg: "修改失败,用户名已存在!",
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            });


        });

        //修改用户密码
        function updateUserPwd(obj, text) {
            var myMsgBox = new Ext.window.MessageBox();
            myMsgBox.textField.inputType = 'password';
            myMsgBox.textField.allowBlank = false;
            myMsgBox.textField.afterLabelTextTpl = 'required';
            myMsgBox.prompt('修改密码', '用户:【<b style=\"color:red\">' + obj.data.USER_NAME + '</b>】 修改密码', function (btn, result, cfg) {
                if(btn == 'cancel') return;
                if (Ext.isEmpty(result)) {
                    var newMsg = '<b style="color:red">请输入用户【' + obj.data.USER_NAME + '】密码</b>';
                    Ext.Msg.show(Ext.apply({}, {msg: newMsg}, cfg));
                    return;
                } else {
                    if (result != null && result != '') {
                        Ext.Ajax.request({
                            url: updatePwd_url,
                            params: {USER_ID: obj.data.USER_ID, USER_PWD: result},
                            method: 'POST',
                            success: function (response, opts) {

                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "密码修改成功!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.INFO
                                });
                                Ext.getCmp(resetGrid).store.reload();

                            },
                            failure: function () {
                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "密码修改失败!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.ERROR
                                });
                            }
                        });
                    }
                }
            });

        };


    }
});
