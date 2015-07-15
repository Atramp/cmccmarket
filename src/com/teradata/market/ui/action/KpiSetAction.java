/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2011-10-8
 */
package com.teradata.market.ui.action;

import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.market.service.KpiSetService;
import com.teradata.adf.web.action.CommonAction;

import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapper;

/**
 * 为指标集提供数据
 */
public class KpiSetAction extends CommonAction {

    private static final long serialVersionUID = 5221602943925290507L;
    
    private static final Log logger = LogFactory.getLog(KpiSetAction.class);
	
	public String getMenus() {
		KpiSetService service = (KpiSetService)ServiceLocatorFactory.getServiceLocator().getService("kpiSetService");
		List menus = service.getMenus();
        for(int i = 0; i < menus.size(); i++) {
			Map m = (Map) menus.get(i);
			Object[] menu = new Object[4];
			menu[0] = m.get("KPI_SET_ID");
			menu[1] = m.get("PAR_KPI_SET_ID");
			menu[2] = m.get("KPI_SET_NAME");
			menu[3] = m.get("KPI_SET_URL");
			
			datas.add(menu);
		}

		return SUCCESS;
	}

}
