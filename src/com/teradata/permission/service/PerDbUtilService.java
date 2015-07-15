package com.teradata.permission.service;

import com.teradata.adf.core.service.CommonService;
import com.teradata.permission.bean.DataField;
import com.teradata.permission.bean.PerBranch;
import com.teradata.permission.util.PermissionUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
 

//用户
public class PerDbUtilService  extends CommonService {

	private static final String CACHE_KEY_MENUS = "PER_USERS";
	 HashMap<String,String> branchNameMap=PerBranch.getBranchByName();
	 HashMap<String,String> deptNameMap=PerBranch.getDeptByName();
	 HashMap<String,String> statusNameMap=PermissionUtil.getUserStatusByName();
	
	 
	 
	 public  HashMap<String,String>  getSysParametes(){
		 HashMap<String,String> data=new HashMap<String,String>();
		 List list=queryData("PER_DB_UTIL.getSysParametes", null);
		 for(int i=0;i<list.size();i++){
			 Map map=(Map) list.get(i);
			 DataField df=new DataField();
			 df.setField("SYS_PAR_ID", map.get("SYS_PAR_ID")+"", 0);
			 df.setField("APP_ID", map.get("APP_ID")+"", 0);
			 df.setField("SYS_PAR_VALUE", map.get("SYS_PAR_VALUE")+"", 0);
			 df.setField("SYS_PAR_DESC", map.get("SYS_PAR_DESC")+"", 0);
			 data.put(map.get("SYS_PAR_ID")+"", map.get("SYS_PAR_VALUE")+"");
		 }
		 return data;
	 }
	 
	 
	 
	 
	 
	 
	 
 
	 
	 
 
	  
}
