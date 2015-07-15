package com.teradata.permission.service;

import com.teradata.adf.core.service.CommonService;
import com.teradata.permission.bean.PerLeftMenu;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class PerLeftMenuService extends CommonService {

    private static final String CACHE_KEY_MENUS = "PER_LEFT_MENU";

    public ArrayList<PerLeftMenu> getMenuDataField(List list) {
        ArrayList<PerLeftMenu> data = new ArrayList<PerLeftMenu>();
        for (int i = 0; i < list.size(); i++) {
            Map map = (Map) list.get(i);
            PerLeftMenu menu = new PerLeftMenu();
            menu.setMENU_ID("" + map.get("KPI_SET_ID"));
            menu.setMENU_PAR_ID("" + map.get("PAR_KPI_SET_ID"));
            menu.setMENU_NAME("" + map.get("KPI_SET_NAME"));
            menu.setMENU_SEQ("" + map.get("KPI_SET_SEQ"));
            menu.setMENU_LEVEL("" + map.get("KPI_SET_LEVEL"));
            menu.setMENU_URL("" + map.get("KPI_SET_URL"));
            data.add(menu);
        }
        return data;
    }

    /**
     * 获得菜单列表
     *
     * @return
     */
    public List getMenus() {
        return queryData("PER_LEFT_MENU.getMenus", null);
    }

    public List getRoleMenus(String USER_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("USER_ID", USER_ID);
        return queryData("PER_LEFT_MENU.getRoleMenus", data);
    }

    public ArrayList<PerLeftMenu> getMainMenus() {
        return getMenuDataField(queryData("PER_LEFT_MENU.getMainMenus", null));
    }


}
