package com.teradata.permission.service;


import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.teradata.adf.core.service.CommonService;
import com.teradata.adf.core.util.JsonUtil;
import org.apache.commons.collections.map.MultiValueMap;

import java.util.*;


public class KpiDefineService extends CommonService {

    private static final String CACHE_KEY_MENUS = "kpi_define";

    /**
     * 查询数据库，获取所有KPI
     *
     * @return
     */
    public List getKpiDefine() {
        List allKpis = (List) this.getCacheManager().getData(CACHE_KEY_MENUS);
        if (null == allKpis) {
            allKpis = queryData("KPI_DEFINE.getKpiDefine", null);
            this.getCacheManager().putData(CACHE_KEY_MENUS, allKpis);
        }
        return allKpis;
    }

    /**
     * 获取配置的默认显示KPI
     *
     * @return
     */
    public String getDefaultKpis() {
        List list = queryData("KPI_DEFINE.getDefaultKpis", null);
        StringBuilder kpi = new StringBuilder();
        for (int i = 0; i < list.size(); ++i) {
            Map item = (Map) list.get(i);
            kpi.append(item.get("KPI_ID")).append(",");
        }
        return kpi.substring(0, kpi.length() - 1);
    }

    /**
     * 获取所有KPI，并生成EXT的指标选择控件需要的数据格式
     *
     * @param chechedKpis 页面上勾选的需要显示的指标
     * @return
     */
    public String generateKpiDataForExt(String chechedKpis) {
        JsonArray extData = new JsonArray();

        // 将查询结果转换为树结构
        List list = getKpiDefine();
        MultiValueMap map = MultiValueMap.decorate(new LinkedHashMap());
        for (int i = 0; i < list.size(); ++i) {
            Map item = (Map) list.get(i);
            map.put(item.get("KPI_GROUP_NAME"), item);
        }

        // 遍历指标组，生成每个指标组的ext结构数据
        Set<String> keys = map.keySet();
        for (String groupName : keys) {
            List kpis = (List) map.getCollection(groupName);

            JsonObject kpiGroup = new JsonObject();
            kpiGroup.addProperty("text", groupName);

            JsonArray menuItems = new JsonArray();// 当前组的子项
            for (int i = 0; i < kpis.size(); ++i) {
                Map item = (Map) kpis.get(i);
                String KPI_ID = item.get("KPI_ID").toString();
                JsonObject menuItem = new JsonObject();
                menuItem.addProperty("text", "'".concat((String) item.get("KPI_NAME")).concat("'"));
                menuItem.addProperty("xtype", "menucheckitem");
                menuItem.addProperty("value", KPI_ID);
                menuItem.addProperty("checked", chechedKpis.indexOf(KPI_ID) > -1);
                menuItem.addProperty("checkHandler", "onItemCheck");
                menuItems.add(menuItem);
            }
            JsonObject kpiGroupItems = new JsonObject();
            kpiGroupItems.add("items", menuItems);
            kpiGroup.add("menu", kpiGroupItems);
            extData.add(kpiGroup);
        }
        return new Gson().toJson(extData);
    }

}
