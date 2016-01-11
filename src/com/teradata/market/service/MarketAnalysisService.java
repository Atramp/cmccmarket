/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * <p/>
 * Created on 2011-10-8
 */
package com.teradata.market.service;

import com.teradata.adf.core.service.CommonService;
import com.teradata.market.ui.chart.CategoryChart;
import com.teradata.market.ui.chart.ChartUtil;
import com.teradata.market.ui.chart.fusionchart.FCCategoryChartProducer;
import com.teradata.market.util.MarketUtil;
import freemarker.template.Configuration;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ArrayUtils;

import java.lang.reflect.Array;
import java.util.*;

/**
 * 提供指标数据信息的服务类，对指标数据进行了缓存。
 */
public class MarketAnalysisService extends CommonService {
    public List<Map> getMarketAnalysisKpiSet() {
        return queryData("ANALYSIS.getMarketAnalysisKpiSet", null);
    }


    public List getMarketAnalysisKpiGroupBySet(Map kpiSet) {
        return queryData("ANALYSIS.getMarketAnalysisKpiGroupBySet", kpiSet);
    }

    public List getMarkeyAnalysisKpisByGroup(Map kpiGroup) {
        return queryData("ANALYSIS.getMarkeyAnalysisKpisByGroup", kpiGroup);
    }

    public Map getMarketAnalysisKpiValueByBranchMonth(String kpi_id, String branchId, String month) {
        Map param = new HashMap();
        param.put("KPI_ID", kpi_id);
        param.put("BRANCH_ID", branchId);
        param.put("DATA_DATE", month);
        List<Map> list = queryData("ANALYSIS.getMarketAnalysisKpiValueByBranchMonth", param);
        return list != null && !list.isEmpty() ? list.get(0) : null;
    }


    public List<Map> getChartData_1(String kpiGroupId, String branchId, String[] month) {
        Map param = new HashMap();
        param.put("KPI_GROUP_ID", kpiGroupId);
        param.put("BRANCH_ID", MarketUtil.arrayJoinForSQL(new String[]{branchId, "13500"}));
        param.put("DATA_DATE", MarketUtil.arrayJoinForSQL(month));
        return queryData("ANALYSIS.getChartData_1", param);
    }

    public List<Map> getChartData_2(String kpiGroupId, String date, String[] branches) {
        Map param = new HashMap();
        param.put("KPI_GROUP_ID", kpiGroupId);
        param.put("BRANCH_ID", MarketUtil.arrayJoinForSQL(branches));
        param.put("DATA_DATE", date);
        return queryData("ANALYSIS.getChartData_2", param);
    }

    public List<LinkedHashMap> getChartData_3(String[] branches, String date) {
        Map param = new HashMap();
        param.put("BRANCH_ID", MarketUtil.arrayJoinForSQL(branches));
        param.put("DATA_DATE", date);
        return queryData("ANALYSIS.getChartData_3", param);
    }

    public List<LinkedHashMap> getChartData_4(String kpi_id, String branchId, String date) {
        Map param = new HashMap();
        param.put("KPI_ID", kpi_id);
        param.put("BRANCH_ID", branchId);
        param.put("DATA_DATE", date);
        return queryData("ANALYSIS.getChartData_4", param);
    }
}
