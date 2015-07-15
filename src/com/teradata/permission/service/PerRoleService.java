package com.teradata.permission.service;

import com.teradata.adf.core.service.CommonService;
import com.teradata.permission.bean.PerRoleGroup;
import com.teradata.permission.bean.PerUsers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


//角色
public class PerRoleService extends CommonService {


    public ArrayList<PerUsers> getPerUsers(List list) {
        ArrayList<PerUsers> data = new ArrayList<PerUsers>();
        for (int i = 0; i < list.size(); i++) {
            Map map = (Map) list.get(i);
            PerUsers user = new PerUsers();
            user.setUSER_ID("" + map.get("USER_ID"));
            user.setUSER_REAL_NAME("" + map.get("USER_REAL_NAME"));
            user.setUSER_NAME("" + map.get("USER_NAME"));
            user.setUSER_STATUS("" + map.get("USER_STATUS"));
            user.setUSER_ROLE_GROUP("" + map.get("USER_ROLE_GROUP"));

            user.setUSER_DATA_GROUP("" + map.get("USER_DATA_GROUP"));
            user.setUSER_BRANCH_GROUP("" + map.get("USER_BRANCH_GROUP"));
            user.setUSER_BRANCH_GROUP_NAME("" + map.get("USER_BRANCH_GROUP_NAME"));
            user.setUSER_DEPT_GROUP("" + map.get("USER_DEPT_GROUP"));
            user.setDEPT_NAME("" + map.get("DEPT_NAME"));
            data.add(user);
        }
        return data;
    }


    public ArrayList<PerRoleGroup> getPerRoleGroup(List list) {
        ArrayList<PerRoleGroup> data = new ArrayList<PerRoleGroup>();
        for (int i = 0; i < list.size(); i++) {
            Map map = (Map) list.get(i);
            PerRoleGroup role = new PerRoleGroup();
            role.setROLE_ID("" + map.get("ROLE_ID"));
            role.setROLE_CODE("" + map.get("ROLE_CODE"));
            role.setROLE_NAME("" + map.get("ROLE_NAME"));
            role.setROLE_SUMMARY("" + map.get("ROLE_SUMMARY"));
            role.setROLE_SEQ("" + map.get("ROLE_SEQ"));
            data.add(role);
        }
        return data;
    }


    //查询单个用户所有角色,根据USER_ID
    public List selectUserRoleByUserId(String USER_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("USER_ID", USER_ID);
        return queryData("PER_ROLE.selectUserRoleByUserId", data);
    }


    //角色与用户的中间表(PER_ROLE_USER),根据ROLE_ID
    public List selectRoleUserByRoleId(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        return queryData("PER_ROLE.selectRoleUserByRoleId", data);
    }

    //角色与用户的中间表(PER_ROLE_USER),根据ROLE_ID
    public List<PerUsers> selectHasRoleUsers(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        return getPerUsers(queryData("PER_ROLE.selectHasRoleUsers", data));
    }

    //角色与用户的中间表(PER_ROLE_USER)
    public List<PerUsers> selectNoHasRoleUsers(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        return getPerUsers(queryData("PER_ROLE.selectNoHasRoleUsers", data));
    }


    //删除角色与用户的中间表，根据ROLE_ID
    public void deleteRoleUser(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        if (ROLE_ID.endsWith(",")) {
            ROLE_ID = ROLE_ID.substring(0, ROLE_ID.length() - 1);
        }
        data.put("ROLE_ID", ROLE_ID);
        dao.insert("PER_ROLE.deleteRoleUser", data);
    }

    //删除角色与用户的中间表，根据ROLE_ID,批量删除多个用户的ROLE_ID角色
    public void deleteRoleUsers(String ROLE_ID, String USER_IDS) {
        HashMap<String, String> data = new HashMap<String, String>();
        if (USER_IDS.endsWith(",")) {
            USER_IDS = USER_IDS.substring(0, USER_IDS.length() - 1);
        }
        data.put("ROLE_ID", ROLE_ID);
        data.put("USER_ID", USER_IDS);
        dao.insert("PER_ROLE.deleteRoleUsers", data);
    }

    //添加角色与用户的中间表(PER_ROLE_USER)
    public void addRoleUser(String ROLE_ID, String USER_ID, String USER_SHOW) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        data.put("USER_ID", USER_ID);
        data.put("USER_SHOW", USER_SHOW);
        dao.insert("PER_ROLE.addRoleUser", data);
    }


    //添加角色与功能权限的中间表
    public void addRoleMenu(String ROLE_ID, String MENU_ID, String MENU_SHOW, String MENU_DOWNLOAD) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        data.put("MENU_ID", MENU_ID);
        data.put("MENU_SHOW", MENU_SHOW);
        data.put("MENU_DOWNLOAD", MENU_DOWNLOAD);
        dao.insert("PER_ROLE.addRoleMenu", data);


    }

    //读取只选中了子菜单的父菜单信息
    public HashMap<String, String> getNoSelectMainMenus(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        List list = queryData("PER_ROLE.getNoSelectMainMenus", data);
        HashMap<String, String> map2 = new HashMap<String, String>();
        for (int i = 0; i < list.size(); i++) {
            Map map = (Map) list.get(i);
            map2.put("" + map.get("KPI_SET_ID"), "" + map.get("KPI_SET_ID"));
            map2.put("" + map.get("PAR_KPI_SET_ID"), "" + map.get("PAR_KPI_SET_ID"));
        }

        return map2;
    }

    //获取一级、二级菜单
    public HashMap<String, String> get01MainMenus() {
        List list = queryData("PER_ROLE.get01MainMenus", null);
        HashMap<String, String> data = new HashMap<String, String>();
        for (int i = 0; i < list.size(); i++) {
            Map map = (Map) list.get(i);
            String KPI_SET_ID = map.get("KPI_SET_ID") + "";
            String PAR_KPI_SET_ID = map.get("PAR_KPI_SET_ID") + "";
            data.put(KPI_SET_ID, PAR_KPI_SET_ID);
        }
        return data;
    }

    public HashMap<String, String> getParentMenus(String KPI_SET_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("KPI_SET_ID", KPI_SET_ID);
        List list = queryData("PER_ROLE.getParentMenus", data);

        HashMap<String, String> data1 = new HashMap<String, String>();
        for (int i = 0; i < list.size(); i++) {
            Map map = (Map) list.get(i);
            String PAR_KPI_SET_ID = map.get("PAR_KPI_SET_ID") + "";
            data1.put(PAR_KPI_SET_ID, PAR_KPI_SET_ID);
        }
        return data1;
    }


    //删除角色与功能权限的中间表，根据ROLE_ID
    public void deleteRoleMenu(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        if (ROLE_ID.endsWith(",")) {
            ROLE_ID = ROLE_ID.substring(0, ROLE_ID.length() - 1);
        }
        data.put("ROLE_ID", ROLE_ID);
        dao.insert("PER_ROLE.deleteRoleMenu", data);
    }

    public List selectRoleMenuByRoleId(String ROLE_ID) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        return queryData("PER_ROLE.selectRoleMenuByRoleId", data);
    }


    //所有角色
    public ArrayList<PerRoleGroup> geAllRoleGroup() {
        return getPerRoleGroup(queryData("PER_ROLE.geAllRoleGroup", null));
    }

    public List selectRoleGroupByRoleNm(String ROLE_NAME) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_NAME", ROLE_NAME);
        return queryData("PER_ROLE.selectRoleGroupByRoleNm", data);
    }


    //添加角色
    public void addRoleGroup(String ROLE_NAME, String ROLE_SUMMARY) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_NAME", ROLE_NAME);
        data.put("ROLE_SUMMARY", ROLE_SUMMARY);
        dao.insert("PER_ROLE.addRoleGroup", data);
    }

    //修改角色属性
    public void updateRoleGroup(String ROLE_ID, String ROLE_NAME, String ROLE_SUMMARY) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        data.put("ROLE_NAME", ROLE_NAME);
        data.put("ROLE_SUMMARY", ROLE_SUMMARY);
        dao.insert("PER_ROLE.updateRoleGroup", data);
    }

    //修改角色描述属性
    public void updateROLESummary(String ROLE_ID, String ROLE_SUMMARY) {
        HashMap<String, String> data = new HashMap<String, String>();
        data.put("ROLE_ID", ROLE_ID);
        data.put("ROLE_SUMMARY", ROLE_SUMMARY);
        dao.insert("PER_ROLE.updateROLESummary", data);
    }

    //删除角色,根据id号
    public void deleteRoleGroupById(String ids) {
        HashMap<String, String> data = new HashMap<String, String>();
        if (ids.endsWith(",")) {
            ids = ids.substring(0, ids.length() - 1);
        }
        data.put("ROLE_ID", ids);
        dao.insert("PER_ROLE.deleteRoleGroupById", data);
    }


}
