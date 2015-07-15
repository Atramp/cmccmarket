/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 *
 * Created on 2011-10-8
 */
package com.teradata.market.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.teradata.adf.core.service.CommonService;
import com.teradata.market.ui.chart.CategoryChart;
import com.teradata.market.ui.chart.ChartObject;
import com.teradata.market.ui.chart.ChartUtil;
import com.teradata.market.ui.chart.fusionchart.FCCategoryChartProducer;

import freemarker.template.Configuration;

/**
 * 提供指标数据信息的服务类，对指标数据进行了缓存。
 */
public class KpiDataService extends CommonService {

    /**
     * 缓存指标组的key
     */
    private static final String CACHE_KEY_KPI_GROUP_INFO_MAP = "kpi_group_info_map";

    /**
     * 获取图形的XML字符串。
     *
     * @param kpiData  指标数据
     * @param template 显示图形的XML模板文件
     * @return
     */
    public String getChartXmlForTest(List kpiData, String template) {
        String chartXml = "<chart paletteColors=\"B1D2EC,FF6060\" plotGradientColor=\"\" plotFillAlpha=\"100\" useRoundEdges=\"0\" showShadow=\"0\" rotateLabels=\"1\" slantLabels=\"1\" palette=\"2\" caption=\"月收入及同比增幅\" subCaption=\"\" showValues=\"0\" divLineDecimalPrecision=\"1\" limitsDecimalPrecision=\"1\" PYAxisName=\"月收入\" SYAxisName=\"同比增幅\" numberPrefix=\"￥\" sNumberSuffix=\"%\" showAlternateHGridColor=\"0\" formatNumberScale=\"0\" plotBorderAlpha=\"0\" bgColor=\"FFFFFF\" baseFont =\"微软雅黑\" baseFontSize=\"12\" baseFontColor=\"222222\" canvasBorderAlpha=\"30\" canvasBorderThickness=\"1\" outCnvBaseFont=\"微软雅黑\" outCnvBaseFontSize=\"12\" outCnvBaseFontColor=\"222222\">"
                + "<categories>"
                + "<category label=\"2013-01\" />"
                + "<category label=\"2013-02\" />"
                + "<category label=\"2013-03\" />"
                + "<category label=\"2013-04\" />"
                + "<category label=\"2013-05\" />"
                + "<category label=\"2013-06\" />"
                + "<category label=\"2013-07\" />"
                + "<category label=\"2013-08\" />"
                + "<category label=\"2013-09\" />"
                + "<category label=\"2013-10\" />"
                + "</categories>"
                + ""
                + "<dataset seriesName=\"月收入\">"
                + "<set value=\"5854\" />"
                + "<set value=\"4171\" />"
                + "<set value=\"1375\" />"
                + "<set value=\"1875\" />"
                + "<set value=\"2246\" />"
                + "<set value=\"2696\" />"
                + "<set value=\"1287\" />"
                + "<set value=\"2140\" />"
                + "<set value=\"1603\" />"
                + "<set value=\"1628\" />"
                + "</dataset>"
                + "<dataset lineThickness=\"3\" seriesName=\"同比增幅\" parentYAxis=\"S\">"
                + "<set value=\"17.4\" />"
                + "<set value=\"19.7\" />"
                + "<set value=\"15.5\" />"
                + "<set value=\"15\" />"
                + "<set value=\"6.6\" />"
                + "<set value=\"8.5\" />"
                + "<set value=\"3.7\" />"
                + "<set value=\"10\" />"
                + "<set value=\"4.4\" />"
                + "<set value=\"32.2\" />"
                + "</dataset>"
                + "</chart>";

        return chartXml;
    }

    /**
     * 根据指标组获得图形的模板和FLASH以生成图形相关数据。
     *
     * @param cfg
     * @param kpiGroupId
     * @param startDate
     * @param endDate
     * @param branchId
     * @return
     */
    public Map getChartDetail(Configuration cfg, String kpiGroupId, String startDate, String endDate, String branchId) {
        //根据指定条件获取指标数据
        List dataList = retrieveChartDataByDate(kpiGroupId, startDate, endDate, branchId);

        //TODO
        //根据指标的定义，格式化指标数据
        //需要从缓存中获取指标的定义信息（第一次没有缓存所有指标信息时，先从库中取出进行缓存，
        //注意需要关联图形类型表，同时获得图形代码，如BAR、LINE等）
        //根据指标定义，对指标数据的精度和显示单位进行格式化


        Map groupInfo = retrieveKpiGroupInfo(kpiGroupId);
        int chartStyle = 1;
        String template = "";
        String flashFile = "";

        if (null != groupInfo) {
            chartStyle = (Integer) groupInfo.get("CHART_STYLE_ID");
            template = (String) groupInfo.get("XML_TEMPLATE");
            flashFile = (String) groupInfo.get("FLASH_FILE");
        }

        //根据指标数据生成图形对象
        CategoryChart chartObject = ChartUtil.genCatChart(chartStyle, template, flashFile, dataList, "KPI_NAME", "DATA_DATE", "KPI_VALUE");
        // 无值折线图
        if(chartStyle == 102){
            chartObject.setShowValues(ChartObject.SWITCH.FALSE.value());
        }
        //TODO
        //根据指标组中的指标组织轴的类型和图形展示的类型
        //根据指标组ID获取指标组中的指标，再获取指标的定义（都从缓存取）
        //根据指标定义中的axis和对应的图形组织以下所需的轴类型和图形类型数据
        //注意保持顺序的一致性
        //这里暂时为测试数据

        //根据图形对象获取producer
        FCCategoryChartProducer producer = new FCCategoryChartProducer(cfg, chartObject, template);

        String chartXML = producer.getChartXML();
        chartXML = chartXML.replace("\r\n", "");
        String chartSWF = producer.getChartFilePath("");

        HashMap chartInfo = new HashMap();
        chartInfo.put("chartXML", chartXML);
        chartInfo.put("chartSWF", chartSWF);
        chartInfo.put("tableDataMap", (Map) dataList.get(dataList.size() - 1));
        chartInfo.put("chartTemplate", template);

        return chartInfo;
    }

    /**
     * 根据指定的起止日期获取指标数据。
     *
     * @param kpiId
     * @param startDate
     * @param endDate
     * @param branchId
     * @return
     */
    public List retrieveChartDataByDate(String kpiGroupId, String startDate, String endDate, String branchId) {
        //生成测试数据
        //List dataList = generateTestData();

        //组织参数为Map
        HashMap parameterMap = new HashMap();
        parameterMap.put("kpiGroupId", kpiGroupId);
        parameterMap.put("startDate", startDate);
        parameterMap.put("endDate", endDate);
        parameterMap.put("branchId", branchId);
        List dataList = queryData("KPI_DATA.getKpiGroupData", parameterMap);


        return dataList;
    }

    /**
     * 获取指标组的相关信息。
     *
     * @param kpiGroupId
     * @return
     */
    public Map retrieveKpiGroupInfo(String kpiGroupId) {
        //每次根据指标组ID获取指标组信息时，先判断缓存中有没有指标组信息（以
        //Map形式存在），如果没有则从数据库中获取指标组信息放入缓存，
        //再从缓存的Map中根据kpiGroupId获取对应的指标组信息

        Map groupInfoMap = (Map) this.getCacheManager().getData(CACHE_KEY_KPI_GROUP_INFO_MAP);

        if (null == groupInfoMap || groupInfoMap.isEmpty()) {
            List groups = queryData("KPI_DATA.getKpiGroupInfo", null);

            //将列表转换为Map
            if (null != groups) {
                groupInfoMap = new HashMap();
                for (int i = 0; i < groups.size(); i++) {
                    Map groupInfo = (Map) groups.get(i);
                    String key = (String) groupInfo.get("KPI_GROUP_ID");
                    groupInfoMap.put(key, groupInfo);
                }
            }
            this.getCacheManager().putData(CACHE_KEY_KPI_GROUP_INFO_MAP, groupInfoMap);
        }

        if (null != groupInfoMap)
            return (Map) groupInfoMap.get(kpiGroupId);
        else
            return null;
    }

    /**
     * 生成测试数据。
     *
     * @return
     */
    private List generateTestData() {
        //测试数据------------begin
        ArrayList list = new ArrayList();

        Random random = new Random();

        HashMap rowMap11 = new HashMap();
        rowMap11.put("SERIES", "北京");
        rowMap11.put("CATEGORY", "1月");

        HashMap rowMap12 = new HashMap();
        rowMap12.put("SERIES", "北京");
        rowMap12.put("CATEGORY", "2月");

        HashMap rowMap13 = new HashMap();
        rowMap13.put("SERIES", "北京");
        rowMap13.put("CATEGORY", "3月");

        HashMap rowMap14 = new HashMap();
        rowMap14.put("SERIES", "北京");
        rowMap14.put("CATEGORY", "4月");

        HashMap rowMap15 = new HashMap();
        rowMap15.put("SERIES", "北京");
        rowMap15.put("CATEGORY", "5月");

        HashMap rowMap16 = new HashMap();
        rowMap16.put("SERIES", "北京");
        rowMap16.put("CATEGORY", "6月");

        list.add(rowMap11);
        list.add(rowMap12);
        list.add(rowMap13);
        list.add(rowMap14);
        list.add(rowMap15);
        list.add(rowMap16);

        HashMap rowMap21 = new HashMap();
        rowMap21.put("SERIES", "天津");
        rowMap21.put("CATEGORY", "1月");

        HashMap rowMap22 = new HashMap();
        rowMap22.put("SERIES", "天津");
        rowMap22.put("CATEGORY", "2月");

        HashMap rowMap23 = new HashMap();
        rowMap23.put("SERIES", "天津");
        rowMap23.put("CATEGORY", "3月");

        HashMap rowMap24 = new HashMap();
        rowMap24.put("SERIES", "天津");
        rowMap24.put("CATEGORY", "4月");

        HashMap rowMap25 = new HashMap();
        rowMap25.put("SERIES", "天津");
        rowMap25.put("CATEGORY", "5月");

        HashMap rowMap26 = new HashMap();
        rowMap26.put("SERIES", "天津");
        rowMap26.put("CATEGORY", "6月");


        list.add(rowMap21);
        list.add(rowMap22);
        list.add(rowMap23);
        list.add(rowMap24);
        list.add(rowMap25);
        list.add(rowMap26);

        HashMap rowMap31 = new HashMap();
        rowMap31.put("SERIES", "上海");
        rowMap31.put("CATEGORY", "1月");

        HashMap rowMap32 = new HashMap();
        rowMap32.put("SERIES", "上海");
        rowMap32.put("CATEGORY", "2月");

        HashMap rowMap33 = new HashMap();
        rowMap33.put("SERIES", "上海");
        rowMap33.put("CATEGORY", "3月");

        HashMap rowMap34 = new HashMap();
        rowMap34.put("SERIES", "上海");
        rowMap34.put("CATEGORY", "4月");

        HashMap rowMap35 = new HashMap();
        rowMap35.put("SERIES", "上海");
        rowMap35.put("CATEGORY", "5月");

        HashMap rowMap36 = new HashMap();
        rowMap36.put("SERIES", "上海");
        rowMap36.put("CATEGORY", "6月");


        list.add(rowMap31);
        list.add(rowMap32);
        list.add(rowMap33);
        list.add(rowMap34);
        list.add(rowMap35);
        list.add(rowMap36);

        int size = list.size();
        for (int i = 0; i < size; i++) {
            ((HashMap) list.get(i)).put("VALUE", String.valueOf(random.nextInt(200)));
        }

        return list;

        //测试数据--------------------------------------------------end

    }

    /**
     * 根据指定的机构获取所有子机构的指标数据，并根据指定的包含标识确定是否包含当前机构本身的数据。
     *
     * @param kpiId       指标
     * @param dataDate    数据日期
     * @param branchId    机构Id
     * @param includeFlag 是否包含当前机构本身的数据
     * @return
     */
    public List retrieveChartDataByBranch(String kpiGroupId, String dataDate, String branchId, boolean includeFlag) {
        Map params = new HashMap();
        params.put("KPI_GROUP_ID", kpiGroupId);
        params.put("BRANCH_ID", branchId);
        params.put("DATA_DATE", dataDate);
        params.put("INCLUDEFLAG", includeFlag);
        List list = queryData("KPI_DATA.getKpiDataByKpiIdBranchIdDate", params);
        return list;
    }

    /**
     * 获取指定日期市场调研数据的指标数据
     *
     * @param data
     * @return
     */
    public List getAllKpis(String data) {
        Map params = new HashMap();
        params.put("DATA_DATE", data);
        List list = queryData("KPI_DATA.getAllKpis", params);
        return list;
    }
    public List getAllKpis(String start_date, String end_date, String branchId, String kpiId)
    {
      Map params = new HashMap();
      params.put("START_DATE", start_date);
      params.put("END_DATE", end_date);
      params.put("BRANCH_ID", branchId);
      params.put("KPI_ID", kpiId);
      List list = queryData("KPI_DATA.getAllKpis2", params);
      return list;
    }
    public List getMarketingResourceByRPID(String rp_id) {
        Map params = new HashMap();
        params.put("RP_ID", rp_id);
        List list = queryData("KPI_DATA.getMarketingResourceByRPID", params);
        return list;
    }
}
