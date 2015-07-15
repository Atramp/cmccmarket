/**
 * Copyright 2014 By Teradata China Co.Ltd. All rights reserved
 *
 * Created on 2014-04-08
 */
package com.teradata.market.ui.action;

import com.teradata.adf.core.dataexport.ExcelExporter;
import com.teradata.adf.core.dataexport.ExportException;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.core.util.ConfigUtil;
import com.teradata.adf.core.util.JsonUtil;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.market.service.KpiDataService;
import com.teradata.market.service.KpiSetService;
import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapper;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 为指标展示提供数据。
 */
public class KpiDataAction extends CommonAction {

    private static final long serialVersionUID = 3613718589414596850L;
    private static final String ROOT_BRANCH_ID = ConfigUtil.getConfiguration().getString("branch.root");

    private static final Log logger = LogFactory.getLog(KpiDataAction.class);

    private String kpiSetId = "";

    // ajax json不能返回父类属性，定义一个指向dataInfo
    private Map result;

    /**
     * @return the kpiSetId
     */
    public String getKpiSetId() {
        return kpiSetId;
    }

    /**
     * @param kpiSetId the kpiSetId to set
     */
    public void setKpiSetId(String kpiSetId) {
        this.kpiSetId = kpiSetId;
    }

    /**
     * 根据给定的图形对象组织图形的详细信息，包括XML和SWF。
     *
     * @return
     */
    public String retrieve() {
        KpiDataService kpiDataService = (KpiDataService) ServiceLocatorFactory.getServiceLocator().getService(
                "kpiDataService");
        KpiSetService kpiSetService = (KpiSetService) ServiceLocatorFactory.getServiceLocator().getService(
                "kpiSetService");

        // 获取页面传递的参数
        // 1. 若页面传递了新的参数，将新参数置入session
        // 2. 若未传递，则从session中取出上次保存的参数值
        // 3. 若session中尚未保存该参数，则获取其默认值
        String freq = processParameter("freq", params.get("freq"));
        if(freq == null) processParameter("freq", "month");// 默认设置为月
        String startDate = processParameter("startDate", params.get("startDate"));
        String endDate = processParameter("endDate", params.get("endDate"));
        String branchId = processParameter("branchId", params.get("branchId"));
        // 特殊处理：kpiSetId为action的URL串所带参数，处理方式略有不同，不从params里获取
        kpiSetId = processParameter("kpiSetId", kpiSetId);
        // 特殊处理：指标组ID可能传入，也可能不传入，但不传入时并不能直接从session里取，必须根据指标集ID获取其第一个指标组ID
        String kpiGroupId = params.get("kpiGroupId");
        List kpiGroups = kpiSetService.getKpiGroupByKpiSetId(kpiSetId);
        if (null == kpiGroupId && null != kpiGroups && kpiGroups.size() > 0) {
            kpiGroupId = (String) ((Map) kpiGroups.get(0)).get("KPI_GROUP_ID");
        }
        this.getSession().setAttribute("kpiGroupId", kpiGroupId);

        // 根据参数获取生成图形所需要的数据

        // 创建FreeMarker所需的Configuration
        Configuration cfg = new Configuration();
        cfg.setServletContextForTemplateLoading(this.getServletContext(), "WEB-INF/classes/template/");
        cfg.setObjectWrapper(new DefaultObjectWrapper());

        // 根据指标组的定义确定图形样式和模板
        dataInfo = kpiDataService.getChartDetail(cfg, kpiGroupId, startDate, endDate, branchId);

        // 将当前指标集中的指标组信息返回给前台JSP
        dataInfo.put("kpiGroups", kpiGroups);
        // 前台JSP使用
        dataInfo.put("tableData", (Map) dataInfo.get("tableDataMap"));
        // 前台JS使用
        dataInfo.put("tableDataStr", JsonUtil.toJson(dataInfo.get("tableDataMap")));
        // 注释
        dataInfo.put("tip", kpiSetService.getKpiGroupTip(kpiSetId, kpiGroupId));

        // 缓存数据，用于导出excel
        Map tableData = (Map) this.getSession().getAttribute("tableDataCache");
        if (tableData == null) {
            tableData = new HashMap();
            this.getSession().setAttribute("tableDataCache", tableData);
        }
        tableData.put(kpiGroupId, dataInfo.get("tableData"));

        this.result = super.dataInfo;

        return SUCCESS;
    }

    /**
     * 处理参数：若页面传递了新的参数，将新参数置入session，若未传递，则从session中取出上次保存的参数值。
     *
     * @param parameterName
     * @param parameterValue
     */
    private String processParameter(String parameterName, String parameterValue) {
        // 处理参数
        if (parameterValue != null && !parameterValue.isEmpty()) {
            // 将新参数值置入session中
            this.getSession().setAttribute(parameterName, parameterValue);
            return parameterValue;
        } else {
            // 获取session中保存的参数值
            String value = (String) this.getSession().getAttribute(parameterName);

            // session中也未保存时，则获取默认值，并置入session
            if (value == null) {
                // 对于日期参数，获取当前日期，其他参数，从配置文件里获取默认值
                if ("startDate".equals(parameterName) || "endDate".equals(parameterName)) {

                    int month = Calendar.getInstance().get(Calendar.MONTH) + 1;
                    int year = Calendar.getInstance().get(Calendar.YEAR);

                    // 默认起始日期比结束日期早一年
                    if ("startDate".equals(parameterName))
                        year = year - 1;

                    // 拼接日期字符串
                    if (month < 10)
                        value = year + "0" + month;
                    else
                        value = year + "" + month;
                } else {
                    value = ConfigUtil.getConfiguration().getString("default." + parameterName);
                }
                this.getSession().setAttribute(parameterName, value);
            }

            return value;
        }
    }

    /**
     * 导出EXCEL 从session缓存中读取当前kpigroupid缓存的导出数据
     */
    public void saveExcel() {
        String kpiGroupId = this.getRequest().getParameter("kpiGroupId");
        Map tableDataCache = (Map) this.getSession().getAttribute("tableDataCache");
        if (tableDataCache == null || tableDataCache.get(kpiGroupId) == null) {
            return;
        }
        Map tableData = (Map) tableDataCache.get(kpiGroupId);
        HttpServletResponse response = getResponse();
        OutputStream os = null;
        try {
            String fileName = this.getRequest().getParameter("fileName");

            // fileName = new String(fileName.getBytes("utf-8"));

            os = response.getOutputStream();
            response.setHeader("Content-disposition", "attachment; filename="
                    + new String(fileName.getBytes("GBK"), "ISO8859-1"));

            // 设定输出文件头
            response.setContentType("application/msexcel");// 定义输出类型
            ExcelExporter export = new ExcelExporter();
            export.exportData(os, "sheet1", (String[]) tableData.get("COLUMNS"),
                    (String[]) tableData.get("COLUMNS4EXPORT"), (List) tableData.get("DATA4EXPORT"));
        } catch (IOException e1) {
            e1.printStackTrace();
        } catch (ExportException e) {
            e.printStackTrace();
        } finally {
            try {
                if (os != null) {
                    os.flush();
                    os.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


    /**
     * @return the result
     */
    public Map getResult() {
        return result;
    }

    /**
     * @param result the result to set
     */
    public void setResult(Map result) {
        this.result = result;
    }


}
