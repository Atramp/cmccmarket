/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 *
 * Created on 2011-10-8
 */
package com.teradata.market.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.cache.annotation.Cacheable;

import com.teradata.adf.core.service.CommonService;

/**
 * 提供菜单信息的服务类，对菜单数据进行了缓存
 */
public class BranchService extends CommonService {

    /**
     * 缓存机构的key
     */
    private static final String CACHE_KEY_MENUS = "branchs";

    /**
     * 获得菜单列表，先从缓存中取，如果没有再从数据库取并放入缓存
     *
     * @return 菜单列表
     */
    public List getBranchs() {
        List menus = (List) this.getCacheManager().getData(CACHE_KEY_MENUS);
        if (null == menus) {
            menus = queryData("BRANCH.getBranchs", null);
            this.getCacheManager().putData(CACHE_KEY_MENUS, menus);
        }

        return menus;
    }


    public List getBranchsSameGroup(String branchId) {
        Map param = new HashMap();
        param.put("BRANCH_ID", branchId);
        return queryData("BRANCH.getBranchsSameGroup", param);
    }
}
