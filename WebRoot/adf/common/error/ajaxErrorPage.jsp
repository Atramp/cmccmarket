<%@page language="java" pageEncoding="UTF-8"%>

<%
	Exception e = (Exception)request.getAttribute("exception");
	String className = e.getClass().getName();
	String errorMsg = e.getMessage();
	out.write("{error:"+errorMsg+"}");
	out.flush();
%>