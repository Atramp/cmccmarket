<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<%
    String chartXML = (String)((Map)request.getAttribute("dataInfo")).get("chartXML");
%>
<html>
<head>
    <title>营销费用图表</title>
</head>
<body>
    <div id="chartDiv" style="width: 100%;"></div>
    <script type="text/javascript">
        FusionCharts.setCurrentRenderer("javascript");
        var chart = new FusionCharts("MSLINE", "ChartId", "100%", $(window).height(), "0", "0");
        chart.setDataXML('<%= chartXML %>');
        chart.render("chartDiv");
    </script>
</body>
</html>
