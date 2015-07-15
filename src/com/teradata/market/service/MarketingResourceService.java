/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 *
 * Created on 2011-10-8
 */
package com.teradata.market.service;

import com.teradata.adf.core.service.CommonService;

import java.util.*;

/**
 * 提供指标数据信息的服务类，对指标数据进行了缓存。
 */
public class MarketingResourceService extends CommonService {

    /**
     * 缓存指标组的key
     */
    private static final String CACHE_KEY_KPI_GROUP_INFO_MAP = "kpi_group_info_map";

    public List getMarketingResourceByRPID(String rp_id) {
        Map params = new HashMap();
        params.put("RP_ID", rp_id);
        List list = queryData("KPI_DATA.getMarketingResourceByRPID", params);
        return list;
    }

    public List getMarketingResourceChartByRPID(String rp_id) {
        Map params = new HashMap();
        params.put("RP_ID", rp_id);
        List list = queryData("KPI_DATA.getMarketingResourceChartByRPID", params);
        return list;
    }
}
