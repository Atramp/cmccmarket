<%@ page contentType="text/html;charset=UTF-8" %>
<%
    String roleId = request.getParameter("roleId");
%>

<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>向角色添加用户</title>
    <style>
        .add {
            background-image: url(../../images/icons/user_add.png) !important;
        }

        .remove {
            background-image: url(../../images/icons/user_delete.png) !important;
        }

        .option {
            background-image: url(../../images/icons/plugin.gif) !important;
        }

        .x-grid-row-over .x-grid-cell-inner {
            font-weight: bold;
        }

        .user_delete {
            background-image: url(../../images/icons/user_delete.png) !important;
        }

        .user_edit {
            background-image: url(../../images/icons/user_key.png) !important;
        }

    </style>
</head>

<body>
<script language="javascript" type="text/javascript" defer>
    var ROLE_ID = '<%=roleId%>';
    Ext.Loader.setPath({
        'Ext.app': '../../js/permission/classes/'
    });

    Ext.require([
        'Ext.Viewport',
        'Ext.data.JsonStore',
        'Ext.tip.QuickTipManager',
        'Ext.tab.Panel',
        'Ext.grid.*', 'Ext.tab.*',
        'Ext.app.RoleSetUser'
    ]);
    Ext.onReady(function () {
        Ext.tip.QuickTipManager.init();

        Ext.create('Ext.Viewport',
                {
                    title: 'Subscriptions',
                    iconCls: 'x-icon-subscriptions',
                    tabTip: 'Subscriptions tabtip',
                    style: 'padding: 10px;',
                    border: false,
                    layout: 'fit',
                    items: [{
                        xtype: 'tabpanel',
                        activeTab: 0,
                        items: [{
                            id: 'tab2',
                            title: '注销',
                            iconCls: 'x-icon-tickets',
                            tabTip: 'Tickets tabtip',
                            xtype: 'rolesetuser',
                            margin: '10',
                            gridId: 'resetGrid',
                            ROLE_ID: ROLE_ID,
                            message: 'hasRole',
                            submitUrls: '<%=request.getContextPath()%>/permission/deleteRoleUsers.action',
                            submitText: '注销',
                            listTip: '说明:	拥有该角色的用户列表',
                            height: null
                        }, {
                            id: 'app-header',
                            title: '添加',
                            iconCls: 'x-icon-tickets',
                            tabTip: 'Tickets tabtip',
                            xtype: 'rolesetuser',
                            margin: '10',
                            gridId: 'regGrid',
                            ROLE_ID: ROLE_ID,
                            message: 'noHasRole',
                            submitUrls: '<%=request.getContextPath()%>/permission/addRoleUser.action',
                            submitText: '添加',
                            listTip: '说明:	未拥有该角色的用户列表',
                            height: null
                        }]
                    }]
                }
        );
    });
</script>
</body>
</html>
