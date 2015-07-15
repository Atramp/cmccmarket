<%@page language="java" pageEncoding="UTF-8" isErrorPage="true"%>

<%@taglib prefix="s" uri="/struts-tags"%>

<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="content-type" content="text/html;charset=utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
	<style type="text/css">
	.error-dlg {
		display: block;
		position: fixed;
		left: 150px;
		top: 100px; 
		right: 300px;
		bottom: 200px;
	}
	.error-table {
		border-top: #7799aa 1px solid;
		border-left: #7799aa 1px solid;
		border-right: #7799aa 1px solid;
		border-bottom: #7799aa 1px solid;
	}
	</style>
</head>

<body>
	<%
		Exception e = (Exception)request.getAttribute("exception");
		String className = e.getClass().getName();
		String errorMsg = e.getMessage();
		pageContext.setAttribute("className", "error."+className);
		pageContext.setAttribute("errorMsg", errorMsg);
	%>
	<div class="error-dlg">
	<table width="100%" cellpadding="3" cellspacing="1" class="error-table">
		<tr>
			<td align="center" colspan="2"><b><s:text name="%{getText(#attr.className,getText('error.java.lang.Exception'))}"/></b></td>
		</tr>
		<tr>
			<td width="60px" align="center"><s:text name="error.label.message"/></td>
			<td align="left"><s:property value="#attr.errorMsg"/></td>
		</tr>
	</table>
	</div>
	
</body>
</html>
