Ext.Loader.setConfig({
    enabled: true
});
Ext.require([
    'Ext.grid.*', 'Ext.data.*', 'Ext.util.*', 'Ext.tip.QuickTipManager',
    'Ext.ux.RowExpander', 'Ext.selection.CheckboxModel', 'Ext.toolbar.Paging',
    'Ext.ux.ProgressBarPager', 'Ext.window.Window', 'Ext.container.Viewport',
    'Ext.layout.container.Border', 'Ext.state.*', 'Ext.grid.column.Action',
    'Ext.ux.CheckColumn'
]);

Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.define('User', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'USER_ID'},
            {name: 'USER_REAL_NAME'},
            {name: 'USER_NAME'},
            {name: 'USER_ROLE_GROUP'},
            {name: 'USER_BRANCH_GROUP'},
            {name: 'USER_DEPT_GROUP'},
            {name: 'USER_STATUS'},
            {name: 'USER_MID_DATE'}, {name: 'USER_SEQ', type: 'float'}
        ],
        proxy: {
            type: 'ajax',
            reader: 'json'
        },
        idProperty: 'USER_ID'
    });

    var getRemoteStore = function () {
        return Ext.create('Ext.data.Store', {
            pageSize: 20,  //页容量5条数据
            model: 'User',
            proxy: {
                autoSave: true,
                autoSync: true,
                type: 'ajax', //返回数据类型为json格式
                api: {
                    read: '/cmccmarket/permission/selectAllUsers.action',
                    update: '/cmccmarket/permission/updateUser.action?update=true'
                },
                sortParam: undefined,
                startParam: undefined,
                pageParam: undefined,
                limitParam: undefined,
                reader: {   //这里的reader为数据存储组织的地方，下面的配置是为json格式的数据，例如：[{"total":50,"rows":[{"a":"3","b":"4"}]}]
                    type: 'json',
                    root: 'users',  //数据
                    totalProperty: 'total'//数据总条数
                }
            },
            sorters: [{
                //排序字段。
                property: 'USER_MID_DATE',
                //排序类型，默认为 ASC
                direction: 'desc'
            }],
            autoLoad: true  //即时加载数据
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////
    // Grid 4
    ////////////////////////////////////////////////////////////////////////////////////////
    var selModel = Ext.create('Ext.selection.CheckboxModel', {
        listeners: {
            selectionchange: function (sm, selections) {
                userGrid.down('#removeButton').setDisabled(selections.length == 0);
                userGrid.down('#editButton').setDisabled(selections.length == 0);
            }
        }
    });

    var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToMoveEditor: 1,
        autoCancel: false,
        saveBtnText: '保存修改',
        cancelBtnText: "取消",
        autoCancel: false
    });


    var userGrid = Ext.create('Ext.grid.Panel', {
        id: 'button-grid',
        store: getRemoteStore(),
        columns: [
            Ext.create('Ext.grid.RowNumberer'),
            {text: "真实姓名", flex: 1, sortable: true, dataIndex: 'USER_REAL_NAME', editor: {allowBlank: false}},
            {text: "用户名", flex: 1, sortable: true, dataIndex: 'USER_NAME', editor: {allowBlank: false}},
            {text: "用户角色", flex: 1, sortable: true, dataIndex: 'USER_ROLE_GROUP'},
            {
                text: "所属省份", width: 75, sortable: true, dataIndex: 'USER_BRANCH_GROUP', editor: {
                xtype: 'combobox',
                displayField: 'name',
                valueField: 'name',
                store: branchStore,
                allowBlank: true
            }
            },
            {
                text: "所属部门", width: 75, sortable: true, dataIndex: 'USER_DEPT_GROUP', editor: {
                xtype: 'combobox',
                displayField: 'name',
                valueField: 'name',
                store: deptStore,
                allowBlank: true
            }
            },
            {
                text: "状态", width: 55, sortable: true, dataIndex: 'USER_STATUS', editor: {
                xtype: 'combobox',
                displayField: 'name',
                valueField: 'name',
                store: [['禁用', '禁用'], ['启用', '启用']],
                allowBlank: true
            },
                renderer: function (val) {
                    if (val == '启用') {
                        return '<span style="color:' + '#73b51e' + '">' + val + '</span>';
                    } else {
                        return '<span style="color:' + '#cf4c35' + ';">' + val + '</span>';
                    }
                    return val;
                }
            },
            {
                menuDisabled: true, sortable: false,
                xtype: 'actioncolumn',
                text: "操作", flex: 1,
                items: [{}, {
                    iconCls: 'option',
                    tooltip: '启用/禁用 用户',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        updateUsersStatus(rec, 'single');
                    }

                }, {}, {
                    iconCls: 'user_edit',
                    tooltip: '修改用户密码',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        updateUserPwd(rec, 'single');
                    }
                }, {}, {
                    iconCls: 'user_delete',
                    tooltip: '删除用户',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        deleteUsers(rec, 'single');
                    }
                }]
            }

        ],
        columnLines: true,
        selModel: selModel,
        plugins: [rowEditing],

        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            layout: {
                pack: 'center'
            }
        }, {
            xtype: 'toolbar',
            items: [{
                text: '添加用户',
                tooltip: '添加新用户',
                iconCls: 'add',
                handler: function (btn) {
                    if (Ext.getCmp("addUserWin") != null) {
                        Ext.getCmp("addUserWin").show();
                        return;
                    }
                    var add_win = Ext.create('Ext.window.Window', {
                        id: 'addUserWin',
                        width: 300,
                        height: 300,
                        title: '添加用户 ',
                        modal: true,
                        maximizable: true,
                        stateId: 'stateWindowExample',
                        stateful: true,
                        bodyPadding: 5,
                        autoShow: true,
                        layout: 'fit',
                        xtype: "window",
                        bodyStyle: 'background: #EFEFEF;',
                        closeAction: 'hide',
                        items: [userAddForm],
                        buttons: [{
                            text: '重置',
                            handler: function () {
                                userAddForm.getForm().reset();
                            }
                        }, {
                            text: '提交',
                            handler: function () {
                                if (userAddForm.getForm().isValid()) {
                                    userAddForm.getForm().submit({
                                        url: '/cmccmarket/permission/addUser.action',
                                        submitEmptyText: false,
                                        waitMsg: '正在保存数据...',
                                        method: 'POST',
                                        success: function () {
                                            Ext.MessageBox.show({
                                                title: "用户添加成功",
                                                msg: "用户添加成功！",
                                                buttons: Ext.MessageBox.OK,
                                                fn: function (btn, text) {
                                                    if (btn == 'ok') {
                                                        add_win.close();
                                                        userGrid.store.reload();
                                                        userGrid.getSelectionModel().deselectAll();
                                                    }
                                                },
                                                icon: Ext.MessageBox.INFO
                                            });
                                        },
                                        failure: function (form, action) {
                                            if (action.failureType == 'server') {
                                                Ext.MessageBox.show({
                                                    title: '用户添加失败',
                                                    msg: '用户添加失败,' + action.result.message,
                                                    buttons: Ext.MessageBox.OK,
                                                    icon: Ext.MessageBox.ERROR
                                                })
                                            } else {
                                                Ext.MessageBox.show({
                                                    title: '用户添加失败',
                                                    msg: '用户添加失败!',
                                                    buttons: Ext.MessageBox.OK,
                                                    icon: Ext.MessageBox.ERROR
                                                })
                                            }

                                        }


                                    });
                                }

                            }
                        }],
                        listeners: {
                            destroy: function () {
                                //    btn.enable();
                                add_win.close();
                            },
                            close: function () {
                                userAddForm.getForm().reset();
                                if (Ext.getCmp("USER_BRANCH_GROUP") != null) {
                                    Ext.getCmp("USER_BRANCH_GROUP").setRawValue("集团");
                                }
                                if (Ext.getCmp("USER_DEPT_GROUP") != null) {
                                    Ext.getCmp("USER_DEPT_GROUP").setRawValue("市场部");
                                }
                            }
                        }
                    });
                    add_win.show();

                }
            }, '-', {
                itemId: 'editButton',
                text: '停用/启用',
                tooltip: '修改已选中用户的状态',
                iconCls: 'option',
                disabled: true,
                handler: function () {
                    updateUsersStatus(this, 'all');
                }
            }, '-', {
                itemId: 'removeButton',
                text: '删除用户',
                tooltip: '删除已选 中的用户',
                iconCls: 'remove',
                disabled: true,
                handler: function () {
                    deleteUsers(this, 'all');
                }
            }]
        }],
        width: '100%',
        height: 600,
        viewConfig: {
            stripeRows: true,
            enableTextSelection: true

        },
        renderTo: Ext.getBody()
    });


    //删除用户
    function deleteUsers(obj, text) {
        var data = userGrid.getSelectionModel().getSelection();
        if (text == "single") {
            data = obj;
        }
        Ext.MessageBox.confirm({
            title: "删除用户",
            msg: "确定要删除用户？",
            buttons: Ext.MessageBox.YESNO,
            promptConfig: false,
            icon: Ext.MessageBox.WARNING,
            fn: function (btn, text) {
                if (btn == 'yes') {
                    if (data.length == 0) {
                        Ext.MessageBox.show({
                            title: "提示",
                            msg: "请先选择您要操作的行!",
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                        return;
                    } else {
                        var ids = [];
                        Ext.Array.each(data, function (record) {
                            var userId = record.get('USER_ID');
                            if (userId) {
                                ids.push(userId);
                            }
                        });
                        Ext.Ajax.request({
                            url: '/cmccmarket/permission/deleteUsers.action',
                            params: {userIds: ids.join(',')},
                            method: 'POST',
                            success: function (response, opts) {
                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "数据删除成功!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.INFO
                                });
                                userGrid.store.reload();

                            },
                            failure: function () {
                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "数据删除失败!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.ERROR
                                });
                            }
                        });
                    }
                }
                if (btn == 'no') {
                }
            }

        });

    }

    //更新用户状态
    function updateUsersStatus(obj, text) {
        var data = userGrid.getSelectionModel().getSelection();
        if (text == "single") {
            data = obj;
        }
        if (data.length == 0) {
            Ext.MessageBox.show({
                title: "提示",
                msg: "请先选择您要操作的行!",
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.WARNING
            });
            return;
        } else {
            var ids = [];
            Ext.Array.each(data, function (record) {
                var userId = record.get('USER_ID');
                if (userId) {
                    ids.push(userId);
                }
            });
            var status = "0", status_str = "启用";
            Ext.MessageBox.show({
                title: "提示",
                msg: "请确认是启用还是禁用用户",
                buttons: Ext.MessageBox.YESNOCANCEL,
                buttonText: {yes: '启用', no: '禁用', cancel: '取消'},
                width: 300,
                promptConfig: false,
                icon: Ext.MessageBox.WARNING,
                fn: function (btn, text) {
                    if (btn == 'yes') {
                        status = "0";
                        status_str = "启用";
                    } else {
                        status = "1";
                        status_str = "禁用";
                    }
                    if (btn == 'yes' || btn == 'no') {
                        Ext.Ajax.request({
                            url: '/cmccmarket/permission/updateUsersStatus.action',
                            params: {userIds: ids.join(','), USER_STATUS: status},
                            method: 'POST',
                            success: function (response, opts) {
                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "用户" + status_str + "成功!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.INFO
                                });
                                userGrid.store.reload();
                                userGrid.getSelectionModel().deselectAll();
                            },
                            failure: function () {
                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "用户" + status_str + "失败!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.ERROR
                                });
                            }
                        });
                    }
                }
            });

        }

    }

    //修改用户各对象
    userGrid.on('edit', function (editor, record) {
        Ext.Ajax.request({
            url: '/cmccmarket/permission/updateUser.action',
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
                userGrid.store.reload();
                userGrid.getSelectionModel().deselectAll();
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
            if (btn == 'ok' && Ext.isEmpty(result)) {
                var newMsg = '<b style="color:red">请输入用户【' + obj.data.USER_NAME + '】密码</b>';
                Ext.Msg.show(Ext.apply({}, {msg: newMsg}, cfg));
                return;
            } else {
                if (result != null && result != '') {
                    Ext.Ajax.request({
                        url: '/cmccmarket/permission/updateUserPwd.action',
                        params: {USER_ID: obj.data.USER_ID, USER_PWD: result},
                        method: 'POST',
                        success: function (response, opts) {
                            Ext.MessageBox.show({
                                title: "提示",
                                msg: "密码修改成功!",
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.INFO
                            });
                            userGrid.store.reload();
                            userGrid.getSelectionModel().deselectAll();
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

    }

});



