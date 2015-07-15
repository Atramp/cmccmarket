package com.teradata.permission.auth;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;

import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.util.GlobalConstants;

/**
 * 登录超时
 */
public class PerHttpSessionListener implements HttpSessionListener {

    private HttpServletRequest request;

    public void sessionCreated(HttpSessionEvent event) {

    }

    public void sessionDestroyed(HttpSessionEvent event) {
        HttpSession session = event.getSession();

        //非超时退出的情况，即用户主动退出，需要在session中设置“logout_mode”参数
        if (session.getAttribute("logout_mode") == null) {
            PerUsers userVO = (PerUsers) session
                    .getAttribute(GlobalConstants.USER_INFO_KEY);
            if (userVO != null) {
                String USER_NAME = userVO.getUSER_NAME();
                String roleId = userVO.getUSER_ROLE_GROUP();
                String ip = (String) session.getAttribute(GlobalConstants.USER_INFO_IP);
                System.out.println("==========================超时退出:" + USER_NAME);

            }
        } else {
            System.out.println("不是超时退出");
        }

    }
}
