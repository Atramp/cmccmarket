package com.teradata.market.ui.action;

import com.google.gson.Gson;
import com.teradata.adf.core.dataexport.ExcelExporter;
import com.teradata.adf.core.dataexport.ExportException;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.market.service.MarketingResourceService;
import com.teradata.market.ui.chart.CategoryChart;
import com.teradata.market.ui.chart.ChartObject;
import com.teradata.market.ui.chart.ChartUtil;
import com.teradata.market.ui.chart.fusionchart.FCCategoryChartProducer;
import freemarker.template.Configuration;
import org.apache.commons.collections.map.LinkedMap;
import org.apache.commons.collections.map.MultiKeyMap;
import org.apache.commons.collections.map.MultiValueMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.*;

/**
 * Created by alex on 15-3-18.
 */
public class MarketingFeeAction extends CommonAction {
    private static final Log logger = LogFactory.getLog(KpiDataAction.class);
    private String rp_id;

    public String retrieve() {
        String rp_id = this.getRequest().getParameter("rp_id");
        if(rp_id == null) rp_id = "1";
        this.getRequest().setAttribute("rp_id", rp_id);

        MarketingResourceService marketingResourceService = (MarketingResourceService) ServiceLocatorFactory.getServiceLocator().getService(
                "marketingResourceService");
        List data = marketingResourceService.getMarketingResourceByRPID(rp_id);
        // 按照指标分组
        MultiValueMap nameAsKey = MultiValueMap.decorate(new LinkedMap());
        for (Map temp : (List<Map>) data) {
            nameAsKey.put(temp.get("ID"), temp);
        }
        List<Map> data4export = new ArrayList<Map>();
        Set columns = new LinkedHashSet();
        columns.add("");
        // 将每个指标按时间生成Array
        List list = new ArrayList();
        for (String id : (Set<String>) nameAsKey.keySet()) {
            List row = new ArrayList();// 用于页面，ext的arrayStore
            Map row4export = new HashMap();// 用于导出
            StringBuilder kpiName = new StringBuilder();
            for (Map temp : (List<Map>) nameAsKey.get(id)) {
                String column = temp.get("DATA_DATE") + "年";
                String value = temp.get("KPI_VALUE").toString();
                // 对值进行处理
                // 值为零的显示“-”；百分比的后跟“%”
                if (Double.parseDouble(value) == 0) {
                    value = "-";
                } else {
                    value = ChartUtil.numberFormat(temp.get("KPI_VALUE") == null ? "" : temp.get("KPI_VALUE").toString(),
                            temp.get("UNIT_MULTIPLE").toString(), temp.get("PRECISIONS_FORMAT").toString());
                    if ("%".equals(temp.get("UNIT_NAME")))
                        value = new StringBuilder().append(value).append("%").toString();
                }
                // 对指标名称进行处理
                // 百分比、倍率的指标不显示单位；其他的显示在标题
                if (kpiName.length() == 0) {
                    String unitName = (String) temp.get("UNIT_NAME");
                    if ("%".equals(unitName) || "倍".equals(unitName)) {
                        kpiName.append(temp.get("KPI_NAME"));
                    } else {
                        kpiName.append((String) temp.get("KPI_NAME")).append("(").append((String) temp.get("UNIT_NAME")).append(")").toString();
                    }
                    row.add(kpiName.toString());
                    row4export.put("", kpiName.toString());
                }
                columns.add(column);
                row.add(value);
                row4export.put(column, value);
            }
            list.add(row);
            data4export.add(row4export);
        }

        this.getRequest().getSession().setAttribute("columns", columns);
        this.getRequest().getSession().setAttribute("data4export", data4export);

        Gson gson = new Gson();
        this.datas.add(gson.toJson(columns));
        this.datas.add(gson.toJson(list));
        return SUCCESS;
    }

    public String retrieveChart() {
        String rp_id = this.getRequest().getParameter("rp_id");
        if(rp_id == null) rp_id = "1";
        this.getRequest().setAttribute("rp_id", rp_id);
        MarketingResourceService marketingResourceService = (MarketingResourceService) ServiceLocatorFactory.getServiceLocator().getService(
                "marketingResourceService");
        List data = marketingResourceService.getMarketingResourceChartByRPID(rp_id);
        Set serieNames = new LinkedHashSet();
        Set categoryNames = new LinkedHashSet();
        MultiKeyMap multiKeyMap = new MultiKeyMap();
        if (data != null) {
            for (Map map : (List<Map>) data) {
                String year = map.get("DATA_DATE").toString();
                String kpiName = map.get("KPI_NAME").toString();
                categoryNames.add(year);
                serieNames.add(kpiName);
                String value = ChartUtil.numberFormat(map.get("KPI_VALUE").toString(),  map.get("UNIT_MULTIPLE").toString(), map.get("PRECISIONS_FORMAT").toString());
                multiKeyMap.put(year, kpiName, value);
            }
        }
        String[][] datas = new String[serieNames.size()][categoryNames.size()];
        int index = 0;
        for (String serial : (Set<String>) serieNames) {
            String[] temp = new String[categoryNames.size()];
            int _index = 0;
            for (String category : (Set<String>) categoryNames)
                temp[_index++] = (String) multiKeyMap.get(category, serial);
            datas[index++] = temp;
        }

        CategoryChart chartObject = new CategoryChart(ChartObject.CHART_STYLE_BAR_2D_DOTLINE);
        chartObject.setCaption("");
        chartObject.setAxisNameX("");
        chartObject.setAxisNameY("");
        chartObject.setNumberSuffix("%");
        chartObject.setCategoryNames((String[]) categoryNames.toArray(new String[0]));
        chartObject.setSerieNames((String[]) serieNames.toArray(new String[0]));
        chartObject.setDatas(datas);
        chartObject.setShowValues(ChartObject.SWITCH.FALSE.value());
        Configuration cfg = new Configuration();
        cfg.setServletContextForTemplateLoading(this.getServletContext(), "WEB-INF/classes/template/");
        FCCategoryChartProducer producer = new FCCategoryChartProducer(cfg, chartObject, "template_dotline.ftl");
        String chartXML = producer.getChartXML();
        chartXML = chartXML.replace("\r\n", "");
        this.dataInfo.put("chartXML", chartXML);
        return SUCCESS;
    }

    public void saveExcel() {
        String rp_id = this.getRequest().getParameter("rp_id");
        if(rp_id == null || rp_id.isEmpty()) rp_id = "1";
        // session失效后点击导出处理
        if (getRequest().getSession().isNew()) {
            retrieve();
        }
        Object[] temp = ((Set) getRequest().getSession().getAttribute("columns")).toArray();
        String[] columns = new String[temp.length];
        for (int i = 0, length = columns.length; i < length; i++)
            columns[i] = (String) temp[i];
        HttpServletResponse response = getResponse();
        OutputStream os = null;
        try {
            os = response.getOutputStream();
            response.setHeader("Content-disposition", "attachment; filename="
                    + new String("营销资源-营销费用.xls".getBytes("GBK"), "ISO8859-1"));
            // 设定输出文件头
            response.setContentType("application/msexcel");// 定义输出类型
            ExcelExporter export = new ExcelExporter();
            export.exportData(os, "sheet1", columns, columns, (List<Map>) getRequest().getSession().getAttribute("data4export"));
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

    public String getRp_id() {
        return rp_id;
    }

    public void setRp_id(String rp_id) {
        this.rp_id = rp_id;
    }
}
