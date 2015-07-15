Ext.Loader.setConfig({
    enabled: true
});
Ext.require([
    'Ext.grid.*', 'Ext.data.*', 'Ext.util.*', 'Ext.tree.*', 'Ext.form.*', 'Ext.tip.QuickTipManager',
    'Ext.ux.RowExpander', 'Ext.selection.CheckboxModel', 'Ext.toolbar.Paging',
    'Ext.ux.ProgressBarPager', 'Ext.window.Window', 'Ext.container.Viewport',
    'Ext.layout.container.Border', 'Ext.state.*', 'Ext.grid.column.Action'
]);

Ext.onReady(function () {
    Ext.QuickTips.init();

    var SelctedIds = [];
    var selectDownload = [];

    ////////////////////////////////////////////////////////////////////////////////
    Ext.define('treeMenu', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'text', type: 'string'},
            {name: 'done', type: 'boolean'},
            {name: 'download', type: 'boolean'}
        ], proxy: {
            type: 'ajax',
            reader: 'json'
        }
    });


    Ext.define('Role', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'ROLE_ID'},
            {name: 'ROLE_CODE'},
            {name: 'ROLE_NAME'},
            {name: 'ROLE_SUMMARY'},
            {name: 'ROLE_SEQ'}
        ],
        proxy: {
            type: 'ajax',
            reader: 'json'
        },
        idProperty: 'ROLE_ID'
    });

    var getRemoteStore = function () {
        return Ext.create('Ext.data.Store', {
            pageSize: 20,  //页容量5条数据
            model: 'Role',
            proxy: {
                autoSave: true,
                autoSync: true,
                type: 'ajax', //返回数据类型为json格式
                url: '/cmccmarket/permission/selectAllRoleGroup.action',
                reader: {   //这里的reader为数据存储组织的地方，下面的配置是为json格式的数据，例如：[{"total":50,"rows":[{"a":"3","b":"4"}]}]
                    type: 'json',
                    root: 'roleList',  //数据
                    totalProperty: 'total' //数据总条数
                },
                sortParam: undefined,
                startParam: undefined,
                pageParam: undefined,
                limitParam: undefined
            },
            sorters: [{
                //排序字段。
                property: 'ROLE_SEQ',
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
                roleGrid.down('#removeButton').setDisabled(selections.length == 0);

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


    var roleGrid = Ext.create('Ext.grid.Panel', {
        id: 'button-grid',
        store: getRemoteStore(),
        columns: [
            Ext.create('Ext.grid.RowNumberer'),
            {text: "角色名称", flex: 1, sortable: true, dataIndex: 'ROLE_NAME', editor: {allowBlank: false}},
            {text: "角色描述", flex: 1, sortable: true, dataIndex: 'ROLE_SUMMARY', editor: {allowBlank: false}},
            {
                menuDisabled: true, sortable: false,
                xtype: 'actioncolumn',
                text: "操作", flex: 1,
                items: [{}, {
                    iconCls: 'role_menu',
                    tooltip: '设置角色可访问的菜单',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        setRoleMenu(rec);
                    }

                }, {}, {
                    iconCls: 'role_user',
                    tooltip: '分配角色用户',
                    handler: function (grid, rowIndex, colIndex) {
                        var rec = grid.getStore().getAt(rowIndex);
                        setRoleUser(rec);
                    }

                }]
            }
        ],
        columnLines: true,
        selModel: selModel,
        plugins: [rowEditing],
        // inline buttons
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            layout: {
                pack: 'center'
            }
        }, {
            xtype: 'toolbar',
            items: [
                '-', {
                    text: '添加角色',
                    tooltip: '添加角色',
                    iconCls: 'add',
                    handler: function () {
                        rowEditing.cancelEdit();
                        var r = Ext.create('Role', {
                            ROLE_NAME: '角色名称',
                            ROLE_SUMMARY: '角色描述'
                        });
                        roleGrid.getStore().insert(0, r);
                        rowEditing.startEdit(0, 0);
                    }
                }, '-', {
                    itemId: 'removeButton',
                    text: '删除角色',
                    tooltip: '删除已选 中的角色',
                    iconCls: 'remove',
                    disabled: true,
                    handler: function () {
                        deleteRoles(this, 'all');
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

    //读取工程菜单,且checked某角色的可访问菜单
    function createTreePanel(roleId) {
        var thisPanel = Ext.create('Ext.tree.Panel', {
            id: "treeId",
            width: '100%',
            height: 500,
            columnLines: true,
            useArrows: true,
            rootVisible: false,
            multiSelect: true,
            store: Ext.create('Ext.data.TreeStore', {
                model: 'treeMenu',
                proxy: {
                    type: 'ajax',

                    url: '/cmccmarket/permission/selectAllMenuByRoleId.action',
                    extraParams: {
                        'ROLE_ID': roleId
                    }

                },

                reader: {type: 'json'},
                folderSort: false,
                listeners: {
                    load: function (thisObj, node, records, successful, eOpts) {
                        if (successful) {

                            Ext.Array.each(records, function (record) {

                                if (record.get("done")) {
                                    ExtArrayPush(record.get("id"));
                                }
                                record.eachChild(function (child) {
                                    if (child.get("done")) {
                                        ExtArrayPush(child.get("id"));
                                    }

                                    child.eachChild(function (child0) {
                                        if (child0.get("done")) {
                                            ExtArrayPush(child0.get("id"));
                                        }

                                    });

                                });
                            });

                            Ext.Array.each(records, function (record) {
                                if (record.get("download")) {
                                    ExtArrayDownPush(record.get("id"));
                                }
                                record.eachChild(function (child) {
                                    if (child.get("download")) {
                                        ExtArrayDownPush(child.get("id"));
                                    }
                                    child.eachChild(function (child0) {
                                        if (child0.get("download")) {
                                            ExtArrayDownPush(child0.get("id"));
                                        }
                                    });

                                });
                            });

                        }
                    }
                }
            }),
            columns: [
                {xtype: 'treecolumn', text: '菜单模块', width: 200, sortable: false, dataIndex: 'text', locked: true}
                , {
                    xtype: 'checkcolumn',
                    header: '访问',
                    width: 100,
                    sortable: false,
                    dataIndex: 'done',
                    stopSelection: false,
                    listeners: {
                        checkchange: function (column, rowIndex, checked) {
                            var view = thisPanel.getView(),
                                record = view.getRecord(view.getNode(rowIndex));

                            if (checked) {
                                ExtArrayPush(record.get("id"));
                            } else {
                                Ext.Array.remove(SelctedIds, record.get("id"));
                            }


                            //取消选中时，清空父节点的选中
                            if (!checked) {
                                if (record.parentNode) {
                                    record.parentNode.set('done', checked);
                                    Ext.Array.remove(SelctedIds, record.parentNode.get("id"));
                                    if (record.parentNode.parentNode) {
                                        record.parentNode.parentNode.set('done', checked);
                                        Ext.Array.remove(SelctedIds, record.parentNode.parentNode.get("id"));
                                    }
                                }
                            }

                            //父节点时
                            if (!record.get("leaf")) {
                                record.eachChild(function (child) {
                                    if (!child.get('leaf')) {
                                        child.eachChild(function (child0) {
                                            child0.set('done', checked);
                                            if (checked) {
                                                ExtArrayPush(child0.get("id"));
                                            } else {
                                                Ext.Array.remove(SelctedIds, child0.get("id"));
                                            }

                                            child0.fireEvent('checkchange', child0, checked);
                                        });
                                    }
                                    child.set('done', checked);
                                    if (checked) {
                                        ExtArrayPush(child.get("id"));
                                    } else {
                                        Ext.Array.remove(SelctedIds, child.get("id"));
                                    }
                                    child.fireEvent('checkchange', child, checked);
                                });
                            }
                        }

                    }
                }, {
                    xtype: 'checkcolumn',
                    header: '下载',
                    width: 100,
                    sortable: false,
                    dataIndex: 'download',
                    stopSelection: false
                    ,
                    listeners: {
                        checkchange: function (column, rowIndex, checked) {
                            var view = thisPanel.getView(),
                                record = view.getRecord(view.getNode(rowIndex));

                            if (checked) {
                                ExtArrayDownPush(record.get("id"));
                            } else {
                                Ext.Array.remove(selectDownload, record.get("id"));
                            }


                            //取消选中时，清空父节点的选中
                            if (!checked) {
                                if (record.parentNode) {
                                    record.parentNode.set('download', checked);
                                    Ext.Array.remove(selectDownload, record.parentNode.get("id"));
                                    if (record.parentNode.parentNode) {
                                        record.parentNode.parentNode.set('download', checked);
                                        Ext.Array.remove(selectDownload, record.parentNode.parentNode.get("id"));
                                    }
                                }
                            }

                            //父节点时
                            if (!record.get("leaf")) {
                                record.eachChild(function (child) {
                                    if (!child.get('leaf')) {
                                        child.eachChild(function (child0) {
                                            child0.set('download', checked);
                                            if (checked) {
                                                ExtArrayDownPush(child0.get("id"));
                                            } else {
                                                Ext.Array.remove(selectDownload, child0.get("id"));
                                            }

                                            child0.fireEvent('checkchange', child0, checked);
                                        });
                                    }
                                    child.set('download', checked);
                                    if (checked) {
                                        ExtArrayDownPush(child.get("id"));
                                    } else {
                                        Ext.Array.remove(selectDownload, child.get("id"));
                                    }
                                    child.fireEvent('checkchange', child, checked);
                                });
                            }
                        }

                    }

                }],  //columns  end
            viewConfig: {
                getRowClass: function (record) {
                    return record.get('children') == null ? 'customCss' : '';
                }
            }
        });
        return thisPanel;
    }


    //修改角色的属性
    roleGrid.on('edit', function (editor, record) {
        var sendUrl = '/cmccmarket/permission/updateRoleGroup.action';
        var msg = "修改角色";
        if (record.record.data.ROLE_ID) {
            sendUrl = '/cmccmarket/permission/updateRoleGroup.action';
            msg = "修改角色";
        } else {
            sendUrl = '/cmccmarket/permission/addRoleGroup.action';
            msg = "添加角色";
        }
        Ext.Ajax.request({
            url: sendUrl,
            params: record.record.data,
            method: 'POST',
            success: function (response, opts) {
                var message = Ext.JSON.decode(response.responseText);
                if (message.message) {
                    Ext.MessageBox.show({
                        title: "提示",
                        msg: msg + "失败!" + message.message,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                } else {
                    Ext.MessageBox.show({
                        title: "提示",
                        msg: msg + "成功!",
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                }

                roleGrid.store.reload();
                roleGrid.getSelectionModel().deselectAll();
            },
            failure: function () {
                Ext.MessageBox.show({
                    title: "提示",
                    msg: "修改失败!",
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        });


    });


    //设置某角色的访问菜单
    function setRoleMenu(obj) {
        if (Ext.getCmp("setPerWin") != null) {
            var treePaelObj = Ext.getCmp("treeId");
            var proxys = treePaelObj.store.proxy;
            proxys.extraParams.ROLE_ID = obj.data.ROLE_ID;
            treePaelObj.store.load();
            Ext.getCmp("setPerWin").show();
            return;
        }
        var treePanel = createTreePanel(obj.data.ROLE_ID);
        var set_win = Ext.create('Ext.window.Window', {
            id: 'setPerWin',
            width: 460,
            height: 600,
            title: '设置某角色的访问菜单 ',
            modal: true,
            maximizable: true,
            stateful: true,
            bodyPadding: 5,
            autoShow: true,
            layout: 'fit',
            xtype: "window",
            bodyStyle: 'background: #EFEFEF;',
            closeAction: 'hide',
            items: [treePanel],
            buttons: [{
                text: '重置',
                handler: function () {
                    var view = treePanel.getView();
                    for (var re = 0; re < 100; re++) {
                        record = view.getRecord(view.getNode(re));
                        if (record == null) continue;
                        record.eachChild(function (child) {
                            child.set('done', false);
                            child.set('download', false);
                            child.eachChild(function (child0) {
                                child0.set('done', false);
                                child0.set('download', false);
                            });

                        });
                        record.set('done', false);
                        record.set('download', false);
                    }

                    SelctedIds = [];
                    selectDownload = [];
                }
            }, {
                text: '提交',
                handler: function () {
                    if (SelctedIds.length == 0 && selectDownload.length == 0) {
                        Ext.MessageBox.show({
                            title: "提示",
                            msg: "请选择!",
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                        return;
                    }

                    Ext.Ajax.request({
                        url: '/cmccmarket/permission/addRoleMenuByRoleId.action',
                        params: {
                            MENU_SHOW: SelctedIds.join(','),
                            MENU_DOWNLOAD: selectDownload.join(','),
                            ROLE_ID: obj.data.ROLE_ID
                        },
                        method: 'POST',
                        success: function (response, opts) {
                            Ext.MessageBox.show({
                                title: "提示",
                                msg: "权限设置成功!" + SelctedIds.join(','),
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.INFO
                            });
                            window.location.reload();
                        },
                        failure: function () {
                            Ext.MessageBox.show({
                                title: "提示",
                                msg: "权限设置失败!",
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.ERROR
                            });
                            window.location.reload();
                        }
                    });
                    SelctedIds = [];
                    selectDownload = [];
                }
            }],
            listeners: {
                destroy: function () {
                    set_win.close();
                },
                close: function () {

                }

            }
        });
        set_win.show();

    }

    //对用户分配角色
    function setRoleUser(obj) {
        new Ext.Window({
            title: '设置用户角色：【' + obj.data.ROLE_NAME + "】",
            height: 400,
            width: 600,
            items: [{
                xtype: 'component',
                id: 'iframe-win',
                height: '100%',
                width: '100%',
                autoEl: {
                    tag: "iframe",
                    src: "roleUserList.jsp?roleId=" + obj.data.ROLE_ID
                }
            }]
        }).show();
    }

    //删除角色
    function deleteRoles(obj, text) {
        var data = roleGrid.getSelectionModel().getSelection();
        if (text == "single") {
            data = obj;
        }
        Ext.MessageBox.confirm({
            title: "删除角色",
            msg: "确定要删除角色？",
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
                            var roleId = record.get('ROLE_ID');
                            if (roleId) {
                                ids.push(roleId);
                            }
                        });
                        Ext.Ajax.request({
                            url: '/cmccmarket/permission/deleteRoleGroup.action',
                            params: {ROLE_ID: ids.join(',')},
                            method: 'POST',
                            success: function (response, opts) {
                                Ext.MessageBox.show({
                                    title: "提示",
                                    msg: "数据删除成功!",
                                    buttons: Ext.MessageBox.OK,
                                    icon: Ext.MessageBox.INFO
                                });
                                roleGrid.store.reload();

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

    function ExtArrayPush(val) {
        if (!Ext.Array.contains(SelctedIds, val)) {
            SelctedIds.push(val);
        }

    }

    function ExtArrayDownPush(val) {
        if (!Ext.Array.contains(selectDownload, val)) {
            selectDownload.push(val);
        }

    }


});