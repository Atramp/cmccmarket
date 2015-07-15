<%@ page contentType="text/html;charset=UTF-8"%>
<%@ include file="/adf/common/jsp/taglibs.jsp" %>
<%@ taglib uri="http://www.opensymphony.com/sitemesh/decorator" prefix="decorator" %>
<%@ taglib uri="http://www.opensymphony.com/sitemesh/page" prefix="page" %>

<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html;charset=utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<title><decorator:title/></title>
        <%@ include file="/adf/common/jsp/jsBase.jsp"%>
        <%@ include file="/adf/common/jsp/jsFusioncharts.jsp"%>
		<decorator:head />
	</head>
	
	<body
        <decorator:getProperty property="body.onload" writeEntireProperty="true"/>
        <decorator:getProperty property="body.onunload" writeEntireProperty="true"/>
    >
		<decorator:body />
	</body>
</html>
