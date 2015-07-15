package com.teradata.market.ui.djn;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.softwarementors.extjs.djn.config.annotations.DirectMethod;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.core.util.ConfigUtil;
import com.teradata.adf.web.djn.DjnResult;
import com.teradata.adf.web.djn.DjnTreeNode;
import com.teradata.market.service.BranchService;

public class BranchDomain {
	private static final String ROOT_BRANCH_ID = ConfigUtil.getConfiguration().getString("branch.root");

	/**
	 * 查询数据库中机构配置，并转化为EXT_TREE数据格式（不限层级）
	 * @return
	 */
	@DirectMethod
	public DjnResult getBranchs() {
		BranchService service = (BranchService) ServiceLocatorFactory.getServiceLocator().getService("branchService");
		// 取得机构列表
		List datas = service.getBranchs();

		// 存放所有一级机构的map
		Map<String, DjnTreeNode> branchMap = new HashMap<String, DjnTreeNode>();
		
		//根节点
		DjnTreeNode root = new DjnTreeNode();
		
		// 循环处理机构数据
		for (int i = 0; i < datas.size(); i++) {
			Map data = (Map) datas.get(i);
			String branchId = (String) data.get("BRANCH_ID");
			String parBranchId = (String) data.get("PAR_BRANCH_ID");

			// 节点已存在，则为处理子节点时创建的
			DjnTreeNode curNode = branchMap.get(branchId);
			if (curNode != null) {
				curNode.setText((String) data.get("BRANCH_NAME"));
			} else {// 节点不存在，创建
				curNode = this.data2Branch(data);
				branchMap.put(branchId, curNode);
			}
			
			if (ROOT_BRANCH_ID.equals(branchId))
				root = curNode;

			// 将当前节点放入父节点，父节点不存在则NEW一个
			DjnTreeNode parItem = branchMap.get(parBranchId);
			if (null != parItem) {
				parItem.addChildren(curNode);
			} else if (ROOT_BRANCH_ID.equals(branchId)) {
				branchMap.put(branchId, curNode);
			} else {
				parItem = new DjnTreeNode();
				parItem.setId(parBranchId);
				parItem.addChildren(curNode);
				branchMap.put(parBranchId, parItem);
			}
		}
		
		return new DjnResult(root);
	}
	
	/**
	 * 将菜单数据转换成菜单对象
	 * @param data 菜单数据
	 * @return 菜单对象
	 */
	private DjnTreeNode data2Branch(Map data) {
		DjnTreeNode item = new DjnTreeNode();
		
		item.setId((String)data.get("BRANCH_ID"));
		item.setText((String)data.get("BRANCH_NAME"));
		return item;
	}
}
