/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2011-10-8
 */
package com.teradata.market.service;

import com.teradata.adf.core.service.CommonService;
import com.teradata.permission.bean.PerUsers;
import org.springframework.cache.annotation.Cacheable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 提供菜单信息的服务类，对菜单数据进行了缓存
 */
public class KpiSetService extends CommonService {

    /**
     * 缓存菜单的key
     */
    private static final String CACHE_KEY_MENUS = "kpi_set_menus";
    
    /**
     * 缓存指标集和指标组的key
     */
    private static final String CACHE_KEY_KPI_SET_AND_GROUP = "kpi_set_and_group";
    
    /**
     * 获得菜单列表，测试通过拦截实现缓存
     * @return 菜单列表
     */
    public List getMenus() {
        return queryData("KPI_SET.getMenus", null);
    }

    /**
     * 获得菜单列表，测试通过拦截实现缓存
     * @return 菜单列表
     */
    public List getMenus(PerUsers user) {
        Map param = new HashMap();
        param.put("USER_NAME", user.getUSER_NAME());
        return queryData("KPI_SET.getMenusByUser", param);
    }
    
    /**
     * 获得菜单列表，测试通过注解控制缓存
     * @return 菜单列表
     */
    @Cacheable(value="primaryCache", key="'kpi_set_menus'")
    public List getMenus2() {
        return queryData("KPI_SET.getMenus", null);
    }
    
    /**
     * 获得菜单列表，先从缓存中取，如果没有再从数据库取并放入缓存
     * @return 菜单列表
     */
    public List getMenus3() {
        List menus = (List)this.getCacheManager().getData(CACHE_KEY_MENUS);
        if(null == menus) {
            menus = queryData("KPI_SET.getMenus", null);
            this.getCacheManager().putData(CACHE_KEY_MENUS, menus);
        }
        
        return menus;
    }
    
    /**
     * 根据指标集ID获取其中包含的指标组信息。
     * @param kpiSetId
     * @return
     */
    public List getKpiGroupByKpiSetId(String kpiSetId){

        //每次根据指标集ID获取指标组信息时，先判断缓存中有没有指标集、指标组信息（以
        //Map形式存在），如果没有则从数据库中获取指标集、指标组信息放入缓存，
        //再从缓存的Map中根据kpiSetId获取对应的指标组信息
        
        Map groupsMap = (Map)this.getCacheManager().getData(CACHE_KEY_KPI_SET_AND_GROUP);
        
        if(null == groupsMap){
            List groups = queryData("KPI_SET.getKpiGroups",null);
            
            //将列表转换为Map
            if(null != groups){
                groupsMap = new HashMap();
                for(int i=0; i<groups.size(); i++){
                    Map groupInfo = (Map)groups.get(i);
                    String key = (String)groupInfo.get("KPI_SET_ID");
                    List groupList = (List)groupsMap.get(key);
                    if(null == groupList){
                        groupList = new ArrayList();
                        groupsMap.put(key, groupList);
                    }
                    groupList.add(groupInfo);
                    
                }
            }
            this.getCacheManager().putData(CACHE_KEY_KPI_SET_AND_GROUP, groupsMap);
        }
        
        if(null != groupsMap)
            return (List)groupsMap.get(kpiSetId);
        else
            return null;
    }
    
    /**
     * 获取指标组提示文字
     * @param kpiSetId
     * @param kpiGroupId
     * @return
     */
    public String getKpiGroupTip(String kpiSetId, String kpiGroupId) {
		List groups = getKpiGroupByKpiSetId(kpiSetId);
		if (null != groups) {
			for (int i = 0; i < groups.size(); i++) {
				Map item = (Map)groups.get(i);
				if(kpiGroupId.equals(item.get("KPI_GROUP_ID")))
					return (String)item.get("TIP");
			}
		}
		return "";
	}
    
}
