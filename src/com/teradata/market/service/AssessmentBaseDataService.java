/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * <p/>
 * Created on 2011-10-8
 */
package com.teradata.market.service;

import com.teradata.adf.core.service.CommonService;
import com.teradata.market.bean.AssessmentBaseDataNode;
import org.apache.commons.collections.MapUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 提供指标数据信息的服务类，对指标数据进行了缓存。
 */
public class AssessmentBaseDataService extends CommonService {
    public List<Map<String, Object>> getAllDataByMonth(String month) {
        Map map = new HashMap();
        map.put("DATA_DATE", month);
        return queryData("ABD.getAllDataByMonth", map);
    }

    public List<Map> getABDExtend() {
        return queryData("ABD.getABDExtend", null);
    }

    public String getMinMonth(String year) {
        Map param = new HashMap();
        param.put("START_MONTH", year.concat("01"));
        param.put("END_MONTH", year.concat("12"));
        List<Map> data = queryData("ABD.getMinMonth", param);
        if (data != null && !data.isEmpty()) {
            Map map = data.get(0);
            if (map != null && !map.isEmpty())
                return MapUtils.getString(map, "MONTH", "");
        }
        return null;
    }

    public String getMaxMonth(String year) {
        Map param = new HashMap();
        param.put("START_MONTH", year.concat("01"));
        param.put("END_MONTH", year.concat("12"));
        List<Map> data = queryData("ABD.getMaxMonth", param);
        if (data != null && !data.isEmpty()) {
            Map map = data.get(0);
            if (map != null && !map.isEmpty())
                return MapUtils.getString(map, "MONTH", "");
        }
        return null;
    }
}
