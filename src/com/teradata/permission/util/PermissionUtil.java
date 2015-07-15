package com.teradata.permission.util;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.permission.service.PerDbUtilService;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

public class PermissionUtil {

	

	public static HashMap<String,String> getUserStatusByCode(){
		HashMap<String,String> map=new HashMap<String,String>();
		map.put("0", "启用");
		map.put("1", "禁用");
		return map;
	}
	public static HashMap<String,String> getUserStatusByName(){
		HashMap<String,String> map=new HashMap<String,String>();
		map.put("启用", "0");
		map.put("禁用", "1");
		return map;
	}
	
	public static Map<String,String> getSysParametesMap(HttpServletRequest request) {
		HashMap<String,String> sysMap = null;
		
		//当参数request不为null时，先判断session中是否有缓存；如果为null，则从数据库中获取
		if(request != null){
			sysMap = (HashMap<String,String>)request.getSession().getServletContext().getAttribute(GlobalConstants.SYS_PARAMETER_KEY);
			//当session中已经缓存了sys_parameter的信息时，返回session中已经保存的信息
			if(sysMap != null)
				return sysMap;
		}
		sysMap = new HashMap<String,String>();
		PerDbUtilService perDbUtilService = (PerDbUtilService) ServiceLocatorFactory.getServiceLocator().getService("perDbUtilService");
		sysMap=perDbUtilService.getSysParametes();		
		
		
		//将从数据库中获取到的系统参数放入session中
		if(request != null)
			request.getSession().getServletContext().setAttribute(
		              GlobalConstants.SYS_PARAMETER_KEY,sysMap);
		
		return sysMap;
	 	
	}
	
}
