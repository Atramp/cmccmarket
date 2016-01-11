package com.teradata.permission.auth;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.service.PerUsersService;
import com.teradata.permission.util.GlobalConstants;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;

public class LoginServlet extends HttpServlet {

    private String loginPage = "";
    private String mainPage = "";
    private HashMap returnMap = null;
    private String errorKey = "com.teradata.permission.loginError";

    /**
     * Constructor of the object.
     */
    public LoginServlet() {
        super();
    }

    /**
     * Destruction of the servlet. <br>
     */
    public void destroy() {
        super.destroy(); // Just puts "destroy" string in log
        // Put your code here
    }

    /**
     * The doGet method of the servlet. <br>
     * <p/>
     * This method is called when a form has its tag value method equals to get.
     *
     * @param request  the request send by the client to the server
     * @param response the response send by the server to the client
     * @throws ServletException if an error occurred
     * @throws IOException      if an error occurred
     */
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        doPost(request, response);
    }

    /**
     * The doPost method of the servlet. <br>
     * <p/>
     * This method is called when a form has its tag value method equals to post.
     *
     * @param request  the request send by the client to the server
     * @param response the response send by the server to the client
     * @throws ServletException if an error occurred
     * @throws IOException      if an error occurred
     */
    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        mainPage = this.getInitParameter("mainPage");

        request.getSession().setAttribute(GlobalConstants.USER_INFO_IP, request.getRemoteAddr());
        String USER_NAME = request.getParameter("USER_NAME");
        String USER_PWD = request.getParameter("USER_PWD");


        PerUsers userVO = (PerUsers) ((HttpServletRequest) request).getSession().getAttribute(GlobalConstants.USER_INFO_KEY);


        if (userVO != null) {
            if (userVO.getUSER_NAME().equals(USER_NAME)) {

                request.getRequestDispatcher(mainPage).forward(request, response);
                return;
            } else {

                ((HttpServletRequest) request).getSession().removeAttribute(GlobalConstants.USER_INFO_KEY);
            }
        }


        checkLoginUser(USER_NAME, USER_PWD, request, response);


        userVO = (PerUsers) ((HttpServletRequest) request).getSession().getAttribute(GlobalConstants.USER_INFO_KEY);

        if (request.getSession().getAttribute(errorKey) != null) {
            HashMap loginMap = (HashMap) request.getSession().getAttribute(errorKey);
            String loginError = (String) loginMap.get("loginError");
            String userIsNull = (String) loginMap.get("UserIsNull");
            String forbidden = (String) loginMap.get("forbidden");
            //request.getRequestDispatcher(loginPage).forward(request,response);
            response.sendRedirect(request.getContextPath() + loginPage);
        } else {
            // request.getRequestDispatcher(mainPage).forward(request,response);
            response.sendRedirect(request.getContextPath() + mainPage);
        }


    }

    public void checkLoginUser(String USER_NAME, String USER_PWD, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {


        if (returnMap == null)
            returnMap = new HashMap();


        if (USER_NAME == null || USER_NAME.trim().length() == 0) {
            returnMap.put("UserIsNull", "true");
            request.getSession().setAttribute(errorKey, returnMap);
            return;
        }
        if (USER_PWD == null || USER_PWD.trim().length() == 0) {
            returnMap.put("UserIsNull", "true");
            request.getSession().setAttribute(errorKey, returnMap);
            return;
        }

        request.getSession().removeAttribute(errorKey);

        PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
        PerUsers user = perUsersService.selectUserByLogin(USER_NAME, USER_PWD);

        if (!user.getUSER_PWD().equals(USER_PWD)) {
            returnMap.put("loginError", "true");
            request.getSession().setAttribute(errorKey, returnMap);
            return;
        }


        if (user.getUSER_STATUS().equals("禁用")) {
            returnMap.put("forbidden", "true");
            request.getSession().setAttribute(errorKey, returnMap);
            return;
        }


        if (user != null) {
            request.getSession().setAttribute(GlobalConstants.USER_INFO_KEY, user);
        }

    }

    /**
     * Initialization of the servlet. <br>
     *
     * @throws ServletException if an error occurs
     */
    public void init() throws ServletException {
        loginPage = this.getInitParameter("loginPage");
        mainPage = this.getInitParameter("mainPage");
    }

}
