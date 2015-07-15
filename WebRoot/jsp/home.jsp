<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/adf/common/jsp/taglibs.jsp" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>市场经营分析辅助工具</title>
    <script>
        $(document).ready(function () {
            document.getElementsByTagName("iframe")[0].height = $(window).height();
        });
    </script>
    <style>
        body, div {
            margin: 0;
            padding: 0;
            border: 0;
        }
    </style>
</head>
<body>
<iframe name="demo" src="${ctxPath}/jsp/main.jsp" scrolling="no" width="100%"/>
</body>
</html>