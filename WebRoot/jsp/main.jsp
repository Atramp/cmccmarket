﻿
<%@ page contentType="text/html;charset=UTF-8"
         import="com.teradata.permission.util.GlobalConstants,com.teradata.permission.bean.PerUsers" %>
<%
    PerUsers session_user = (PerUsers) request.getSession().getAttribute(GlobalConstants.USER_INFO_KEY);
    String loginUserName = "", loginUserId = "";
    if (session_user != null) {
        loginUserName = session_user.getUSER_NAME();
        loginUserId = session_user.getUSER_ID();
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>主页面</title>
    <script>
        var loginUserName = "<%=loginUserName%>";
        var loginUserId = "<%=loginUserId%>";
    </script>
    <script type="text/javascript" src="<%=request.getContextPath()%>/js/main.js"></script>
</head>
<body>

<input type="hidden" id="multiTabs" value="true"/>
</body>
</html>
