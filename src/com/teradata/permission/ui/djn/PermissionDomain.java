
package com.teradata.permission.ui.djn;

import com.softwarementors.extjs.djn.config.annotations.DirectMethod;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.permission.bean.PerBranch;
import com.teradata.permission.bean.PerRoleGroup;
import com.teradata.permission.service.PerRoleService;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
 



/**
 * 提供数据的direct函数
 */
public class PermissionDomain {
	 
	 
	//获得省份
	@DirectMethod
	public ArrayList<PerBranch> getBranchByName(){
		LinkedHashMap<String, String>  bmap=PerBranch.getBranchByName();
		ArrayList<PerBranch>  list=new ArrayList<PerBranch>();
		int i=0;
		for(Map.Entry<String,String> map:bmap.entrySet()){
			PerBranch b=new PerBranch();
			b.setId(++i);
			b.setName(map.getKey());
			b.setCode(map.getValue());
			list.add(b);
		}
		return list;
	}
	
	
	//获得
	@DirectMethod
	public ArrayList<PerBranch> getDeptByName(){
		LinkedHashMap<String,String> bmap=PerBranch.getDeptByName();
		ArrayList<PerBranch>  list=new ArrayList<PerBranch>();
		int i=0;
		for(Map.Entry<String,String> map:bmap.entrySet()){
			PerBranch b=new PerBranch();
			b.setId(++i);
			b.setName(map.getKey());
			b.setCode(map.getValue());
			list.add(b);
		}
		return list;
	}
	
	
	
	//所有角色
	@DirectMethod
	public ArrayList<PerRoleGroup> geAllRoleGroup(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		ArrayList<PerRoleGroup>  list=perRoleService.geAllRoleGroup();
		return list;
	}
	
}
	

