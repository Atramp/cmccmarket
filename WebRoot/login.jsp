<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>登录</title>
    <link rel="stylesheet" href="<%=request.getContextPath()%>/css/reset.css">
    <link rel="stylesheet" href="<%=request.getContextPath()%>/css/login.css" media="screen"
          type="text/css"/>
    <style>
        .x-body {
            width:100%;
            text-align: center;
            background-color: #1C7DC1;
        }

        #container {
            margin: 0;
            width: 100%;
            height: 960px;
            background-image: url('<%=request.getContextPath()%>/images/login-bg.jpg');
            background-repeat: no-repeat;
            background-size: 80%;
            background-position: center top;
        }

        #login_div {
            position: absolute;
            right: 20%;
            top: 40%;
            width: 300px;
            text-align: center;
        }

        #sszy {
            width: 200px;
            height: 38px;
            background: #fff url(<%=request.getContextPath()%>/images/login-submit.png) no-repeat;
            background-size: cover;
            border: 0px;
            cursor: pointer;
        }
    </style>
</head>
<%
    HashMap loginMap = (HashMap) request.getSession().getAttribute("com.teradata.permission.loginError");
    if (loginMap == null)
        loginMap = new HashMap();
    String loginError = (String) loginMap.get("loginError"); //登录失败,用户名或密码错误
    String forbidden = (String) loginMap.get("forbidden");  //用户被禁用，登录失败，转向登录页
    String userIsNull = (String) loginMap.get("UserIsNull");//登录失败


    //账户被禁用
    if (loginError != null && loginError.equalsIgnoreCase("true")) {
%>
<script language="javascript">alert('登录失败,用户名或密码错误');</script>
<%
} else if (forbidden != null && forbidden.equalsIgnoreCase("true")) {
%>
<script language="javascript">alert('登录失败,用户被禁用');</script>
<%
    }

    request.getSession().setAttribute("logout_mode", "1");
    request.getSession().invalidate();
    request.getSession().removeAttribute("USER_NAME");
%>

<body>
<form id="loginForm" name="loginForm" action="<%=request.getContextPath()%>/servlet/LoginServlet" method="post">
    <div id="container">
        <div id="login_div">
            <table border="1" style="margin:auto; width:80%; background-color: #1C7DC1;" align="left" cellpadding="0"
                   cellspacing="0">
                <tr>
                    <td>
                        <div style="position:relative; height:38px; width:200px; background-image:url(<%=request.getContextPath()%>/images/login-username.png)  ;
                                background-size:cover;">
                            <div style="position:absolute; margin-left:2px; right:5px; bottom:7px;">
                                <input type="text" name="USER_NAME" id="USER_NAME" placeholder="用户名" required
                                       style="width:140px;">
                            </div>
                        </div>

                    </td>
                </tr>
                <tr>
                    <td>
                        <div style="position:relative; height:38px; width:200px; background-image:url(<%=request.getContextPath()%>/images/login-password.png)  ;
                                background-size:cover;">
                            <div style="position:absolute; margin-left:2px; right:5px; bottom:7px;">
                                <input type="password" name="USER_PWD" id="USER_PWD" placeholder="密码" required
                                       style="width:140px;">
                            </div>
                        </div>

                    </td>
                </tr>
                <tr>
                    <td align="left">
                        <input type="submit" id="sszy" value=" " onclick="return submit()"/>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</form>

<script type="text/javascript">
    function submit() {
        document.getElementById("loginForm").submit();
    }
</script>
</body>

</html>