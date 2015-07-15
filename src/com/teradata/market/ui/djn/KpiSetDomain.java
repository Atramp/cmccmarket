/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 *
 * Created on 2011-10-8
 */
package com.teradata.market.ui.djn;

import com.softwarementors.extjs.djn.config.annotations.DirectMethod;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.djn.DjnResult;
import com.teradata.adf.web.djn.DjnTreeNode;
import com.teradata.market.service.KpiSetService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 提供菜单数据的direct函数
 */
public class KpiSetDomain {
    /**
     * 根菜单的父菜单Id用-1表示
     */
    private static final String ROOT_PARENT_ID = "-1";

    /**
     * 获得所有菜单，数据是树形结构
     *
     * @return 含有菜单数据的DjnResult
     */
    @DirectMethod
    public DjnResult getMenus() {
        KpiSetService service = (KpiSetService) ServiceLocatorFactory.getServiceLocator().getService("kpiSetService");
        //取得菜单列表
        List datas = service.getMenus();
        //存放所有菜单的map
        Map<String, DjnTreeNode> menuMap = new HashMap<String, DjnTreeNode>();
        //存放跟菜单的列表
        List<DjnTreeNode> menus = new ArrayList<DjnTreeNode>();

        //循环处理菜单数据
        for (int i = 0; i < datas.size(); i++) {
            Map data = (Map) datas.get(i);
            DjnTreeNode item = this.data2Menu(data);
            menuMap.put(item.getId(), item);

            String parMenuId = (String) data.get("PAR_KPI_SET_ID");
            if (ROOT_PARENT_ID.equals(parMenuId)) {//是根菜单
                menus.add(item);//加入跟菜单列表
            } else {//不是根菜单
                DjnTreeNode parItem = menuMap.get(parMenuId);//取得父菜单
                if (null != parItem) {
                    parItem.addChildren(item);//父菜单添加此菜单为子菜单
                }
            }
        }

        return new DjnResult(menus);
    }

    @DirectMethod
    public List<DjnTreeNode> getMyMenus(String id, String branchId) {
        return (List<DjnTreeNode>) getMenus().data;

    }

    /**
     * 将菜单数据转换成菜单对象
     *
     * @param data 菜单数据
     * @return 菜单对象
     */
    private DjnTreeNode data2Menu(Map data) {
        DjnTreeNode item = new DjnTreeNode();

        item.setId((String) data.get("KPI_SET_ID"));
        item.setText((String) data.get("KPI_SET_NAME"));
        item.setUrl((String) data.get("KPI_SET_URL"));
//		item.setData(data);

        return item;
    }

}


