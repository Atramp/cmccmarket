/**
 * Copyright 2014 By Teradata China Co.Ltd. All rights reserved
 * <p/>
 * Created on 2014-04-08
 */
package com.teradata.market.ui.action;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.core.util.ConfigUtil;
import com.teradata.adf.core.util.JsonUtil;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.adf.web.djn.DjnResult;
import com.teradata.adf.web.djn.DjnTreeNode;
import com.teradata.market.service.BranchService;
import com.teradata.market.service.KpiDataService;
import com.teradata.market.ui.chart.ChartUtil;
import com.teradata.market.util.DateUtil;
import com.teradata.market.util.MarketUtil;
import com.teradata.market.util.PoiExcelUtil;
import com.teradata.permission.service.KpiDefineService;
import org.apache.commons.collections.map.MultiValueMap;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.poi.ss.usermodel.Workbook;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.*;


/**
 * 为市场调研数据展示提供数据。
 */
public class MarketingResearchAction extends CommonAction {

    private static final long serialVersionUID = 3613718589414596850L;
    private static final String ROOT_BRANCH_ID = ConfigUtil.getConfiguration().getString("branch.root");

    private static final Log logger = LogFactory.getLog(MarketingResearchAction.class);

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
     * 市场调研数据页面
     *
     * @return
     */
    public String retrieve() {
        KpiDefineService kpiDefineService = (KpiDefineService) ServiceLocatorFactory.getServiceLocator().getService("kpiDefineService");

        // kpiId没传时，获取配置的默认显示指标
        String kpiId = getRequest().getParameter("kpiId");
        if (StringUtils.isEmpty(kpiId)) {
            kpiId = kpiDefineService.getDefaultKpis();
        }

        String startDate = StringUtils.defaultString(getRequest().getParameter("startDate"), DateUtil.currentBeforeMonthDate());
        String endDate = StringUtils.defaultString(getRequest().getParameter("endDate"), DateUtil.currentBeforeMonthDate());

        // 省份参数为空时默认值
        //String branchId = StringUtils.defaultString(getRequest().getParameter("branchId"), "12300,11400,11700,12000");// 支持只显示全国
        String branchId = StringUtils.defaultIfEmpty(getRequest().getParameter("branchId"), "12300,11400,11700,12000");// 不支持只显示全国

        boolean multiMonth = !startDate.equals(endDate);// 是否多月

        String _branchId = MarketUtil.splitString(branchId, ",", "'").concat(",'13500'");// 增加全国作为对比

        // 转换为sql中的格式
        KpiDataService kpiDataService = (KpiDataService) ServiceLocatorFactory.getServiceLocator().getService("kpiDataService");
        List list = kpiDataService.getAllKpis(
                DateUtil.replaceDateZh(startDate),
                DateUtil.replaceDateZh(endDate),
                _branchId,
                MarketUtil.splitString(kpiId, ",", "'"));

        String firstColumnHeader = "";// 多省多月时，第一列标题显示空
        Set columnHeaders = new LinkedHashSet();
        Map data = new LinkedHashMap();

        for (int i = 0; i < list.size(); ++i) {
            Map item = (Map) list.get(i);

            String kpi = item.get("KPI_NAME").toString() + item.get("DATA_DATE").toString();
            if (!multiMonth)
                kpi = item.get("KPI_NAME").toString().concat("(").concat(item.get("UNIT_NAME").toString()).concat(")");
            String columnKey = item.get("BRANCH_SEQ").toString().concat("-").concat(item.get("BRANCH_NAME").toString());

            // 单月时，第一列标题显示月份
            if (!multiMonth) {
                firstColumnHeader = item.get("DATA_DATE").toString();
            }

            // 取出当前行数据，第一次进行初始化
            Map row = (LinkedHashMap) data.get(kpi);
            if (row == null) {
                data.put(kpi, row = new LinkedHashMap());
            }

            row.put("DATA_DATE", item.get("DATA_DATE").toString());
            row.put("KPI_NAME", item.get("KPI_NAME").toString().concat("(").concat(item.get("UNIT_NAME").toString()).concat(")"));

            String kpiKey = columnKey.concat("-").concat("指标值");
            String kpiValue = item.get("KPI_VALUE") == null ? "" : item.get("KPI_VALUE").toString();
            kpiValue = ChartUtil.numberFormat(kpiValue,
                    item.get("UNIT_MULTIPLE").toString(), item.get("PRECISIONS_FORMAT").toString());
            row.put(kpiKey, StringUtils.defaultString(kpiValue, "-"));

            String kpiRankKey = columnKey.concat("-").concat("排名");
            row.put(kpiRankKey, item.get("KPI_RANK") == null ? "-" : item.get("KPI_RANK"));

            String kpiGroupRankKey = columnKey.concat("-").concat("组内排名");
            row.put(kpiGroupRankKey, item.get("KPI_GROUP_RANK") == null ? "-" : item.get("KPI_GROUP_RANK"));

            columnHeaders.add(kpiKey);
            columnHeaders.add(kpiRankKey);
            columnHeaders.add(kpiGroupRankKey);
        }
        // 按照配置的省份顺序或者按照日期就行排序
        String[] columnHeaderArray = (String[]) columnHeaders.toArray(new String[0]);
        Arrays.sort(columnHeaderArray, new Comparator<String>() {
            public int compare(String s, String t1) {
                int n1 = Integer.parseInt(s.substring(0, s.indexOf("-")));
                int n2 = Integer.parseInt(t1.substring(0, t1.indexOf("-")));
                return n1 - n2;
            }
        });

        this.dataInfo.put("data", JsonUtil.toJson(data.values()));// 表数据
        this.dataInfo.put("branchTreeData", JsonUtil.toJson(getBranchTreeData()));// 机构选择树
        this.dataInfo.put("kpiTreeData", JsonUtil.toJson(getKpiTreeData()));// 指标选择树
        this.dataInfo.put("firstColumnHeader", firstColumnHeader);// 第一列表头
        this.dataInfo.put("columnHeaders", JsonUtil.toJson(columnHeaderArray)); //其余列表头
        this.dataInfo.put("multiMonth", multiMonth); //是否多月

        getRequest().setAttribute("branchId", branchId);
        getRequest().setAttribute("kpiId", kpiId);
        getRequest().setAttribute("startDate", startDate);
        getRequest().setAttribute("endDate", endDate);

        return "success";
    }

    /**
     * 市场调研数据导出
     */
    public void saveExcel() {
        KpiDefineService kpiDefineService = (KpiDefineService) ServiceLocatorFactory.getServiceLocator().getService("kpiDefineService");

        String startDate = StringUtils.defaultString(getRequest().getParameter("startDate"), DateUtil.currentBeforeMonthDate());
        String endDate = StringUtils.defaultString(getRequest().getParameter("endDate"), DateUtil.currentBeforeMonthDate());
        //String branchId = StringUtils.defaultString(getRequest().getParameter("branchId"), "12300,11400,11700,12000");// 支持只显示全国
        String branchId = StringUtils.defaultIfEmpty(getRequest().getParameter("branchId"), "12300,11400,11700,12000");// 不支持只显示全国
        String kpiId = StringUtils.defaultString(getRequest().getParameter("kpiId"), kpiDefineService.getDefaultKpis());

        String firstColumn = "";
        String kpiIds = MarketUtil.splitString(kpiId, ",", "'");
        String branchIds = MarketUtil.splitString(branchId, ",", "'").concat(",'13500'");// 添加全国作为对比（页面没有选择任何省份时，得到""，此时只展示全国数据）

        String flag = "single_month";

        if (!startDate.equals(endDate)) {
            flag = "more";
        }

        KpiDataService kpiDataService = (KpiDataService) ServiceLocatorFactory.getServiceLocator().getService("kpiDataService");
        List list = kpiDataService.getAllKpis(DateUtil.replaceDateZh(startDate), DateUtil.replaceDateZh(endDate), branchIds, kpiIds);
        LinkedHashMap all = new LinkedHashMap();

        for (int i = 0; i < list.size(); ++i) {
            Map item = (Map) list.get(i);

            String key = item.get("KPI_NAME").toString() + item.get("DATA_DATE").toString();
            if (!(flag.equals("more")))
                key = item.get("KPI_NAME").toString().concat("(").concat(item.get("UNIT_NAME").toString()).concat(")");

            Map p = (LinkedHashMap) all.get(key);

            if (p == null) {
                all.put(key, p = new LinkedHashMap());
                p.put("KPI_NAME", key);
            }
            p.put("DATA_DATE", item.get("DATA_DATE").toString());

            String UNIT_NAME = item.get("UNIT_NAME").toString();
            String KPI_NAME2 = item.get("KPI_NAME").toString().concat("(").concat(UNIT_NAME).concat(")");
            if (UNIT_NAME.indexOf("%") > -1) {
                KPI_NAME2 = item.get("KPI_NAME").toString();
            }
            p.put("KPI_NAME2", KPI_NAME2);

            String level_name = item.get("BRANCH_NAME").toString();

            if (flag.equals("single_month")) {
                firstColumn = item.get("DATA_DATE").toString();
            }

            String kpiKey = level_name.concat("-").concat("指标值").concat("-").concat("%");
            String kpiValue = ChartUtil.numberFormat((item.get("KPI_VALUE") == null) ? "" : item.get("KPI_VALUE").toString(),
                    item.get("UNIT_MULTIPLE").toString(), item.get("PRECISIONS_FORMAT").toString());

            if (UNIT_NAME.indexOf("%") > -1) {
                try {
                    kpiValue = Float.parseFloat(kpiValue) / 100.00 + "";
                } catch (Exception ex) {
                }
            }

            p.put(kpiKey, kpiValue);

            String kpiRankKey = level_name.concat("-").concat("排名");
            p.put(kpiRankKey, (item.get("KPI_RANK") == null) ? "-" : item.get("KPI_RANK"));

            String kpiGroupRankKey = level_name.concat("-").concat("组内排名");
            p.put(kpiGroupRankKey, (item.get("KPI_GROUP_RANK") == null) ? "-" : item.get("KPI_GROUP_RANK"));
        }

        List resultList = new ArrayList(all.values());

        HttpServletResponse response = getResponse();
        OutputStream os = null;
        try {
            String fileName = String.format("市场调研数据(%s-%s).xlsx", startDate, endDate);
            os = response.getOutputStream();
            response.setHeader("Content-disposition", "attachment; filename=" +
                    new String(fileName.getBytes("GBK"), "ISO8859-1"));

            response.setContentType("application/msexcel");

            Workbook wb = PoiExcelUtil.createMarketResearch("市场调研数据", firstColumn, flag, resultList);
            wb.write(os);
        } catch (IOException e1) {
            e1.printStackTrace();
        } catch (Exception e) {
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

    public DjnResult getKpiTreeData() {
        KpiDefineService service = (KpiDefineService) ServiceLocatorFactory.getServiceLocator().getService("kpiDefineService");
        List data = service.getKpiDefine();

        DjnTreeNode root = new DjnTreeNode();
        root.setText("全部指标");
        root.setId("root");

        MultiValueMap multiValueMap = MultiValueMap.decorate(new LinkedHashMap());
        for (int i = 0; i < data.size(); ++i) {
            Map item = (Map) data.get(i);
            DjnTreeNode node = new DjnTreeNode();
            node.setId(item.get("KPI_ID").toString());
            node.setText(item.get("KPI_NAME").toString());
            node.setLeaf(true);
            multiValueMap.put(item.get("KPI_GROUP_NAME"), node);
        }

        Set<String> keys = multiValueMap.keySet();
        for (String key : keys) {
            DjnTreeNode node = new DjnTreeNode();
            node.setId(key);
            node.setText(key);
            List<DjnTreeNode> children = (ArrayList<DjnTreeNode>) multiValueMap.getCollection(key);
            for (DjnTreeNode node1 : children)
                node.addChildren(node1);
            root.addChildren(node);
        }
        return new DjnResult(root);
    }

    public DjnResult getBranchTreeData() {
        BranchService service = (BranchService) ServiceLocatorFactory.getServiceLocator().getService("branchService");
        List data = service.getBranchs();
        Map branchMap = new HashMap();

        DjnTreeNode root = new DjnTreeNode();
        for (int i = 0; i < data.size(); ++i) {
            Map item = (Map) data.get(i);
            String branchId = (String) item.get("BRANCH_ID");
            String parBranchId = (String) item.get("PAR_BRANCH_ID");

            DjnTreeNode curNode = (DjnTreeNode) branchMap.get(branchId);
            if (curNode != null) {
                curNode.setText((String) item.get("BRANCH_NAME"));
            } else {
                curNode = data2Branch(item);
                branchMap.put(branchId, curNode);
            }

            if (ROOT_BRANCH_ID.equals(branchId)) {
                root = curNode;
            }

            DjnTreeNode parItem = (DjnTreeNode) branchMap.get(parBranchId);
            if (parItem != null) {
                parItem.addChildren(curNode);
            } else if (ROOT_BRANCH_ID.equals(branchId)) {
                branchMap.put(branchId, curNode);
            } else {
                parItem = new DjnTreeNode();
                parItem.setId(parBranchId);
                parItem.addChildren(curNode);
                branchMap.put(parBranchId, parItem);
            }
        }
        return new DjnResult(root);
    }

    private DjnTreeNode data2Branch(Map data) {
        DjnTreeNode item = new DjnTreeNode();
        item.setId((String) data.get("BRANCH_ID"));
        item.setText((String) data.get("BRANCH_NAME"));

        return item;
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
