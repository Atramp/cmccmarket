<%@ page contentType="text/html;charset=UTF-8"
         import="com.teradata.permission.bean.PerUsers,com.teradata.permission.util.GlobalConstants" %>
<%
    String USER_ID = "";
    if (session.getAttribute("logout_mode") == null) {
        PerUsers userVO = (PerUsers) session
                .getAttribute(GlobalConstants.USER_INFO_KEY);
        if (userVO != null) {
            USER_ID = userVO.getUSER_ID();
        }
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>个人设置</title>
    <style>
        .user_edit {
            background-image: url(../../images/icons/user_key.png) !important;
        }
    </style>
</head>

<body>
<script language="javascript" type="text/javascript" defer>
    var ROLE_ID = '16';
    Ext.Loader.setPath({
        'Ext.app': '../../js/permission/classes/'
    });

    Ext.require([
        'Ext.Viewport',
        'Ext.data.JsonStore',
        'Ext.tip.QuickTipManager',
        'Ext.tab.Panel',
        'Ext.grid.*', 'Ext.tab.*',
        'Ext.app.GridUser'
    ]);
    Ext.onReady(function () {
        Ext.tip.QuickTipManager.init();
        Ext.create('Ext.Viewport', {
                    style: 'padding:0px;',
                    border: false, frame: false,
                    layout: 'fit',
                    items: [{
                        id: 'tab2', border: false,
                        frame: false,
                        xtype: 'griduser',
                        margin: '10',
                        gridId: 'resetuser',
                        USER_ID: '<%=USER_ID%>',
                        selectUrl: '<%=request.getContextPath()%>/permission/selectByUserId.action',
                        updateUrl: '<%=request.getContextPath()%>/permission/updateUser.action',
                        updatePwdUrl: '<%=request.getContextPath()%>/permission/updateUserPwd.action',
                        height: null
                    }]
                }
        );
    });
</script>
</body>
</html>
 