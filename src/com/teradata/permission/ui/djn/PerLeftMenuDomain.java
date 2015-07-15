
package com.teradata.permission.ui.djn;

import com.softwarementors.extjs.djn.config.annotations.DirectMethod;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.djn.DjnResult;
import com.teradata.adf.web.djn.DjnTreeNode;
import com.teradata.permission.service.PerLeftMenuService;
import org.apache.commons.lang.StringUtils;
import org.springframework.util.ObjectUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 提供菜单数据的direct函数
 */
public class PerLeftMenuDomain {
    /**
     * 根菜单的父菜单Id�?1表示
     */
    private static final String ROOT_PARENT_ID = "-1";

    /**
     * 获得�?��菜单，数据是树形结构
     *
     * @return 含有菜单数据的DjnResult
     */
    @DirectMethod
    public DjnResult getMenus(String USER_ID) {

        PerLeftMenuService service = (PerLeftMenuService) ServiceLocatorFactory.getServiceLocator().getService("perLeftMenuService");
        //取得菜单列表
        List datas = service.getRoleMenus(USER_ID);

        //存放�?��菜单的map
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
                menus.add(item);//加入跟菜单列�?
            } else {//不是根菜�?
                DjnTreeNode parItem = menuMap.get(parMenuId);//取得父菜�?
                if (null != parItem) {
                    parItem.addChildren(item);//父菜单添加此菜单为子菜单
                }
            }
        }

        return new DjnResult(menus);
    }


    @DirectMethod
    public List<DjnTreeNode> getMyMenus(String id, String branchId) {
        return (List<DjnTreeNode>) getMenus(id).data;

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
        String url = (String) data.get("KPI_SET_URL");
        if (StringUtils.isNotEmpty(url)) {
            item.setUrl(new StringBuilder(url)
                    .append("?")
                    .append("kpiSetId=").append(data.get("KPI_SET_ID"))
                    .append("&")
                    .append("download=").append(data.get("DOWNLOAD"))
                    .toString());
        }

        return item;
    }

}


