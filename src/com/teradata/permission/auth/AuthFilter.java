package com.teradata.permission.auth;

import java.io.IOException;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.util.GlobalConstants;
import com.teradata.permission.util.StringUtil;


//用户过滤 
public class AuthFilter implements Filter {

    private FilterConfig filterConfig;

    private String loginPage;
    private String excludeUrls;

    public void setFilterConfig(FilterConfig config) {
        this.filterConfig = config;
    }

    public FilterConfig getFilterConfig() {
        return filterConfig;
    }

    public void destroy() {
        // TODO Auto-generated method stub
        this.filterConfig = null;
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        // TODO Auto-generated method stub
        String path = ((HttpServletRequest) request).getServletPath();
        boolean checkFlag = true;
        if (excludeUrls != null && excludeUrls.length() > 0) {
            List<String> excludesUrls = StringUtil.parsetStringByDelimiter(this.excludeUrls, ",");
            for (String excludeUrl : excludesUrls) {
                if (excludeUrl.endsWith(".jsp") || excludeUrl.endsWith(".do")) {
                    if (excludeUrl.equals(path)) {
                        checkFlag = false;
                        break;
                    }
                } else {
                    if (path.contains(excludeUrl)) {
                        checkFlag = false;
                        break;
                    }
                }
            }
        }
        if (checkFlag) {
            PerUsers userVO = (PerUsers) ((HttpServletRequest) request)
                    .getSession().getAttribute(GlobalConstants.USER_INFO_KEY);

            if (userVO == null) {
                response.getWriter().write("<script>window.top.location.href='/cmccmarket/login.jsp';</script>");
            } else
                chain.doFilter(request, response);
        } else {
            chain.doFilter(request, response);
        }
    }

    public void init(FilterConfig arg0) throws ServletException {
        // TODO Auto-generated method stub
        this.filterConfig = arg0;
        this.loginPage = this.filterConfig.getInitParameter("LoginPage");
        this.excludeUrls = this.filterConfig.getInitParameter("excludeUrls");
    }

}
