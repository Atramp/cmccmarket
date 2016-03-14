<%@ page language="java" import="org.apache.commons.lang.StringUtils" pageEncoding="UTF-8" %>
<%@ page import="java.util.Map" %>
<%
    Map dataInfo = (Map) request.getAttribute("dataInfo");
    String minDate = (String) dataInfo.get("MIN_DATE");
    String maxDate = (String) dataInfo.get("MAX_DATE");
    String year = (String) dataInfo.get("YEAR");
%>

<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <style>
        .monthPicker {
            display: block;
            float: left;
            width: 20%;
            height: 100px;
            line-height: 100px;
            margin: 5px;
            font-size: 24px;
            text-align: center;
            cursor: pointer;
            color: #307d63;
            border: 1px solid #cccccc;
            box-shadow: 1px 1px 1px #cccccc;
        }

    </style>
    <script language="javascript" type="text/javascript">
        function saveExcel(date, year) {
            location.href = "<%=request.getContextPath()%>/market/marketing-abd/saveExcel.action?date=" + date + "&year=" + year;
        }
    </script>
</head>
<body style="width: 100%;">
<div style="width: 90%;margin-left: 5%;margin-top: 50px;">
    <%
        if (StringUtils.isEmpty(minDate) || StringUtils.isEmpty(maxDate)) {
    %>
    <span class="monthPicker" style="border: 0;box-shadow:0;font-size: 16px;">数据为空!</span>
    <%
    } else {
        int minMonth = Integer.valueOf(minDate.substring(4, 6));
        int maxMonth = Integer.valueOf(maxDate.substring(4, 6));
        for (int j = minMonth; j <= maxMonth; j++) {
            String curDate = year + (j < 10 ? "0" + j : String.valueOf(j));
    %>
            <span class="monthPicker"
                  onclick="saveExcel('<%=curDate%>','<%=year%>')"><%=j%>月</span>
    <%
            }
        }
    %>
</div>
</body>
</html>
