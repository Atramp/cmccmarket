package com.teradata.market.ui.chart.fusionchart;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapper;

/**
 * 初始化FreeMarker的配置对象的servlet，需要配置成随系统一起启动
 */
public class FCChartInitServlet extends HttpServlet {

    public void destroy() {
    }

    public void init() throws ServletException {
        Configuration cfg = new Configuration();
        try {
            cfg.setServletContextForTemplateLoading(getServletContext(), "commonchart/template/");
            //cfg.setTemplateExceptionHandler(TemplateExceptionHandler.IGNORE_HANDLER);
            cfg.setObjectWrapper(new DefaultObjectWrapper());
            getServletContext().setAttribute("GlobalConstants.SESSION_KEY_FREEMARKER_CFG", cfg);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
