Ext.define('Ext.app.RoleSetUser', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.rolesetuser',
    uses: [
        'Ext.data.ArrayStore'
    ],
    height: 300,
    initComponent: function () {
        var store = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'USER_ID'}, {name: 'USER_REAL_NAME'}, {name: 'USER_NAME'},
                {name: 'USER_BRANCH_GROUP_NAME'}, {name: 'USER_ROLE_GROUP'}, {name: 'USER_BRANCH_GROUP'},
                {name: 'USER_DEPT_GROUP'}, {name: 'USER_STATUS'}
            ],
            proxy: {
                type: 'ajax',
                url: '/cmccmarket/permission/selectHasRoleUsers.action',
                sortParam: undefined,
                startParam: undefined,
                pageParam: undefined,
                limitParam: undefined,
                extraParams: {
                    'ROLE_ID': this.ROLE_ID,
                    'message': this.message
                },
                reader: {
                    type: 'json',
                    root: 'roleUserList',
                    totalProperty: 'total'
                }
            },
            autoLoad: true  //即时加载数据
        });
        var submit_urls = this.submitUrls;
        var submit_Text = this.submitText;
        var resetGrid = this.gridId;
        var selModel = Ext.create('Ext.selection.CheckboxModel', {
            listeners: {
                selectionchange: function (sm, selections) {
                    Ext.getCmp(resetGrid).down('#editButton').setDisabled(selections.length == 0);
                }
            }
        });

        Ext.apply(this, {
            height: this.height,
            id: resetGrid,
            store: store,
            stripeRows: true,
            columnLines: true,
            selModel: selModel,
            dockedItems: [{
                xtype: 'toolbar',
                items: ['-', {
                    itemId: 'editButton',
                    text: '【' + submit_Text + '】用户角色',
                    tooltip: '【' + submit_Text + '】用户角色',
                    iconCls: 'option',
                    disabled: true,
                    handler: function () {
                        updateUsersRole(this, 'all');

                    }
                }, '-', {
                    xtype: 'displayfield',
                    value: '<span style="color:blue;font-size:12px">' + this.listTip + '</span>'
                }]
            }],
            columns: [{
                text: '真实姓名',
                flex: 1,
                sortable: true,
                dataIndex: 'USER_REAL_NAME'
            }, {
                text: '用户名',
                width: 100,
                sortable: true,
                dataIndex: 'USER_NAME'
            }, {
                text: '所属省份',
                width: 75,
                sortable: true,
                dataIndex: 'USER_BRANCH_GROUP_NAME'
            }]
        });

        this.callParent(arguments);

        //用户角色【添加/删除】
        function updateUsersRole(obj, text) {
            var data = Ext.getCmp(resetGrid).getSelectionModel().getSelection();

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

                Ext.MessageBox.show({
                    title: "提示",
                    msg: "请确认: 【" + submit_Text + "】用户所属的角色",
                    buttons: Ext.MessageBox.OKCANCEL,
                    width: 300,
                    promptConfig: false,
                    icon: Ext.MessageBox.WARNING,
                    fn: function (btn, text) {
                        if (btn == 'ok') {
                            Ext.Ajax.request({
                                url: submit_urls,
                                params: {USER_ID: ids.join(','), ROLE_ID: ROLE_ID},
                                method: 'POST',
                                success: function (response, opts) {
                                    Ext.MessageBox.show({
                                        title: "提示",
                                        msg: "用户所属角色" + submit_Text + "成功!",
                                        buttons: Ext.MessageBox.OK,
                                        icon: Ext.MessageBox.INFO
                                    });
                                    Ext.getCmp(resetGrid).store.reload();
                                    Ext.getCmp(resetGrid).getSelectionModel().deselectAll();
                                },
                                failure: function () {
                                    Ext.MessageBox.show({
                                        title: "提示",
                                        msg: "用户所属角色" + submit_Text + "失败!",
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


    }
});
