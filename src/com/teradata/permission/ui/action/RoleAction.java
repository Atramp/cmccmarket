package com.teradata.permission.ui.action;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.permission.bean.DataField;
import com.teradata.permission.bean.DjnTreeNodeNew;
import com.teradata.permission.bean.PerRoleGroup;
import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.service.PerLeftMenuService;
import com.teradata.permission.service.PerRoleService;
import com.teradata.permission.service.PerUsersService;
import com.teradata.permission.util.StringUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RoleAction  extends CommonAction {

	private ArrayList<PerRoleGroup> roleList; 
    private List<PerUsers> roleUserList;
	private ArrayList<DjnTreeNodeNew> children;
	
	private String node; 
	private String ROLE_ID;
	private String ROLE_NAME;
	private String ROLE_SUMMARY;
	private String ROLE_CODE;
	private String ROLE_SEQ;
	private String  MENU_ID;
	private String  MENU_SHOW;
	private String MENU_DOWNLOAD;
	private String USER_ID;
 	private String sort;
 	private String _dc;
 	private String message;
    
	public String getMessage() {
		return message;
	}


	public void setMessage(String message) {
		this.message = message;
	}

 

	public String getUSER_ID() {
		return USER_ID;
	}


	public void setUSER_ID(String uSERID) {
		USER_ID = uSERID;
	}


	public String getMENU_ID() {
		return MENU_ID;
	}


	public void setMENU_ID(String mENUID) {
		MENU_ID = mENUID;
	}


	public String getMENU_SHOW() {
		return MENU_SHOW;
	}


	public void setMENU_SHOW(String mENUSHOW) {
		MENU_SHOW = mENUSHOW;
	}


	public ArrayList<DjnTreeNodeNew> getChildren() {
		return children;
	}

	public void setChildren(ArrayList<DjnTreeNodeNew> children) {
		this.children = children;
	}
	
	public String getNode() {
		return node;
	}

	public void setNode(String node) {
		this.node = node;
	}

	public ArrayList<PerRoleGroup> getRoleList() {
		return roleList;
	}

	public void setRoleList(ArrayList<PerRoleGroup> roleList) {
		this.roleList = roleList;
	}

 
	public String getSort() {
		return sort;
	}

	public void setSort(String sort) {
		this.sort = sort;
	}

	public String get_dc() {
		return _dc;
	}

	public void set_dc(String dc) {
		_dc = dc;
	}
	
	

	public String getROLE_ID() {
		return ROLE_ID;
	}

	public void setROLE_ID(String rOLEID) {
		ROLE_ID = rOLEID;
	}
	
	

	public String getROLE_NAME() {
		return ROLE_NAME;
	}


	public void setROLE_NAME(String rOLENAME) {
		ROLE_NAME = rOLENAME;
	}


	public String getROLE_SUMMARY() {
		return ROLE_SUMMARY;
	}


	public void setROLE_SUMMARY(String rOLESUMMARY) {
		ROLE_SUMMARY = rOLESUMMARY;
	}

	
	
	public String getROLE_CODE() {
		return ROLE_CODE;
	}


	public void setROLE_CODE(String rOLECODE) {
		ROLE_CODE = rOLECODE;
	}


	public String getROLE_SEQ() {
		return ROLE_SEQ;
	}


	public void setROLE_SEQ(String rOLESEQ) {
		ROLE_SEQ = rOLESEQ;
	}


	public List<PerUsers> getRoleUserList() {
		return roleUserList;
	}


	public void setRoleUserList(List<PerUsers> roleUserList) {
		this.roleUserList = roleUserList;
	}

	
	
    public String getMENU_DOWNLOAD() {
		return MENU_DOWNLOAD;
	}


	public void setMENU_DOWNLOAD(String mENUDOWNLOAD) {
		MENU_DOWNLOAD = mENUDOWNLOAD;
	}


	/**
     * 读取工程菜单,且checked某角色的可访问菜单
     * 
     */
	public String selectAllMenuByRoleId(){
		PerLeftMenuService service = (PerLeftMenuService)ServiceLocatorFactory.getServiceLocator().getService("perLeftMenuService");
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		List roleMenuList=perRoleService.selectRoleMenuByRoleId(ROLE_ID);
		HashMap<String,Map>  roleMenuMap=new HashMap<String,Map>();
		for(int i=0;i<roleMenuList.size();i++){
			Map data = (Map)roleMenuList.get(i);
			roleMenuMap.put(data.get("MENU_ID")+"",data);
		}
		
		
		
		List datas = service.getMenus();
		Map<String, DjnTreeNodeNew> menuMap = new HashMap<String, DjnTreeNodeNew>();
		children = new ArrayList<DjnTreeNodeNew>();
	 
		for(int i=0; i<datas.size(); i++) {
			Map data = (Map)datas.get(i);
			DjnTreeNodeNew item = this.data2Menu(data);
			if(roleMenuMap.containsKey(item.getId())) {
				Map map0=roleMenuMap.get(item.getId());
				if((map0.get("MENU_SHOW")+"").equals("0")){
					item.setDone(true);
				}
				if((map0.get("MENU_DOWNLOAD")+"").equals("0")){
					item.setDownload(true);
				}
			}else{
				item.setDone(false);
				item.setDownload(false);
			}
			menuMap.put(item.getId(),item);
			
			String parMenuId = (String)data.get("PAR_KPI_SET_ID");
			if("-1".equals(parMenuId)) { 
				children.add(item); 
			} else { 
				DjnTreeNodeNew parItem = menuMap.get(parMenuId); 
				if(null != parItem) {
					parItem.addChildren(item); 
				}
			}
		}
		
 
		return SUCCESS;
	}
	
	/**
	 * 
	 * 添加角色与权限菜单的中间表,向角色添加可访问的权限菜单
	 * 1、删除角色与菜单相关联的中间表(per_role_menu), ROLE_ID为条件
	 * 2、添加角色与菜单相关联的中间表(per_role_menu)  ROLE_ID,MENU_ID,MENU_SHOW(1：不允许查看，反之),MENU_DOWNLOAD(1：不允许下载，反之)					
	 * 
	 */
	public String addRoleMenuByRoleId(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		perRoleService.deleteRoleMenu(ROLE_ID);
		String[] MENU_SHOWS=MENU_SHOW.split(",");
	 
		String[] MENU_DOWNLOADS=MENU_DOWNLOAD.split(",");
		
	 
		HashMap<String,String>  menu=new HashMap<String,String>();
		for(int i=0;i<MENU_SHOWS.length;i++){
			menu.put(MENU_SHOWS[i],"MENU_SHOW");
		}
		for(int j=0;j<MENU_DOWNLOADS.length;j++){
			String key=MENU_DOWNLOADS[j];
			if(menu.containsKey(key)){
				String value=menu.get(key);
				menu.put(key,value+"#MENU_DOWNLOAD");
			}else{
				menu.put(key,"MENU_DOWNLOAD");
			}
		}
		
 
		
		
		HashMap<String,DataField>  menuDF=new HashMap<String,DataField>();
		
		String parent="";
		for(Map.Entry<String,String> map:menu.entrySet()){
			DataField df=new DataField();
			String key=map.getKey();String value=map.getValue();
			df.setField("ROLE_ID", ROLE_ID, 0);
			df.setField("MENU_ID", key, 0);
			if(value.indexOf("MENU_SHOW")==-1){ 
				//1：不允许查看，反之
				df.setField("MENU_SHOW", "1", 0);
			}else{
				df.setField("MENU_SHOW", "0", 0);
			}
			if(value.indexOf("MENU_DOWNLOAD")==-1){ 
				//1：不允许下载，反之
				df.setField("MENU_DOWNLOAD", "1", 0);
			}else{
				df.setField("MENU_DOWNLOAD", "0", 0);
			}
			
			if(key.length()==5){
				menuDF.put(key, df);
				parent+="'"+key.substring(0,3)+"',";
			}
			
			//perRoleService.addRoleMenu(ROLE_ID,df.getFieldValue("MENU_ID"),df.getFieldValue("MENU_SHOW"),df.getFieldValue("MENU_DOWNLOAD"));
			
		}
		
		if(parent.endsWith(",")){parent=parent.substring(0,parent.length()-1);}
		HashMap<String,String> map3=perRoleService.getParentMenus(parent);
		
		for(Map.Entry<String,DataField> map:menuDF.entrySet()){
			String key=map.getKey();
			DataField df=map.getValue();
			perRoleService.addRoleMenu(ROLE_ID,df.getFieldValue("MENU_ID"),df.getFieldValue("MENU_SHOW"),df.getFieldValue("MENU_DOWNLOAD"));
			
		}
		
		String[] s=parent.split(",");
		for(String s1:s){
			s1=s1.replaceAll("'", "");
			perRoleService.addRoleMenu(ROLE_ID,s1,"0","0");
		}
		for(Map.Entry<String,String> map:map3.entrySet()){
			String key=map.getKey();
			
			perRoleService.addRoleMenu(ROLE_ID,key,"0","0");
		}
  
		
		return SUCCESS;
		
	}
	
	
	/**
	 * 查询所有角色
	 */
	public String selectAllRoleGroup() {
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		roleList=perRoleService.geAllRoleGroup();
		return SUCCESS;
	}
	
	/**
	 * 1、查询【角色名称】是否已存在，以role_name为条件
	 * 2、步骤一为TRUE时，添加角色表记录(per_role_group)
	 */
	public String addRoleGroup(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		List list=perRoleService.selectRoleGroupByRoleNm(ROLE_NAME);
		if(list.size()==0){
			perRoleService.addRoleGroup(ROLE_NAME, ROLE_SUMMARY);
			return SUCCESS;
		}else{
		 	message="角色名称已存在";
			return INPUT;
		}
	}
	
	/**
	 * 0、强制设置管理员角色不能删除、修改
	 * 1、查询 重命名的【角色名称】是否已存在，以role_name为条件
	 * 2、步骤一为TRUE时，修改角色属性(ROLE_ID, ROLE_NAME, ROLE_SUMMARY)
	 *
	 */
	public String updateRoleGroup(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		List list=perRoleService.selectRoleGroupByRoleNm(ROLE_NAME);
		if(list.size()==0){
			perRoleService.updateRoleGroup(ROLE_ID, ROLE_NAME, ROLE_SUMMARY);
			return SUCCESS;
		}else{
		     	Map map = (Map)list.get(0);
		    	String roleId=map.get("ROLE_ID")+"";
		    	if(roleId.equals(ROLE_ID)){
		    		perRoleService.updateROLESummary(ROLE_ID, ROLE_SUMMARY);
		    		return SUCCESS;
		    	}else{
		    		message="角色名称已存在";
					return INPUT;
		    	}
			 
			
			
		}
		
		
	}
	/**
	 * 0、强制设置管理员角色不能删除、修改
	 * 1、删除角色表(per_role_group),role_id 为条件
	 * 2、删除角色与菜单相关联的中间表(per_role_menu),role_id 为条件
	 * 3、删除角色与用户相关联的中间表(per_role_user),role_id 为条件
	 */
 	public String deleteRoleGroup(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		perRoleService.deleteRoleGroupById(ROLE_ID);
		perRoleService.deleteRoleMenu(ROLE_ID);  
		perRoleService.deleteRoleUser(ROLE_ID);
		return SUCCESS;
	}
	
	public String selectHasRoleUsers(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		if(message.equals("hasRole")){
			roleUserList=perRoleService.selectHasRoleUsers(ROLE_ID);
		}else{
			roleUserList=perRoleService.selectNoHasRoleUsers(ROLE_ID);
		}
		return SUCCESS;
		
	}
	
	
	//添加角色与用户的中间表(PER_ROLE_USER)，根据ROLE_ID,批量多个用户的ROLE_ID角色
	public String addRoleUser(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		perRoleService.deleteRoleUsers(ROLE_ID, USER_ID);
		String[] USER_IDS=USER_ID.split(",");
		for(String s:USER_IDS){
			perRoleService.addRoleUser(ROLE_ID, s, "0");
		}
		return SUCCESS;
		
	}
	
	//删除角色与用户的中间表(PER_ROLE_USER)，根据ROLE_ID,批量删除多个用户的ROLE_ID角色
	public String deleteRoleUsers(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		perRoleService.deleteRoleUsers(ROLE_ID, USER_ID);
		return SUCCESS;	
	}
	
	//查询角色与用户的中间表(PER_ROLE_USER)，
	public String selectRoleUser(){
		PerRoleService perRoleService = (PerRoleService) ServiceLocatorFactory.getServiceLocator().getService("perRoleService");
		List list=perRoleService.selectRoleUserByRoleId(ROLE_ID);
		
		PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		if(list.size()>0){
			
		}
		
		
		perRoleService.deleteRoleMenu(ROLE_ID);
		String[] USER_IDS=USER_ID.split(",");
		for(String s:USER_IDS){
			perRoleService.addRoleUser(ROLE_ID, s, "0");
		}
		return SUCCESS;
		
	}
	
	
	
	
	
	private DjnTreeNodeNew data2Menu(Map data) {
		
		DjnTreeNodeNew item = new DjnTreeNodeNew();
		item.setId((String)data.get("KPI_SET_ID"));
		item.setText((String)data.get("KPI_SET_NAME"));
		item.setUrl((String)data.get("KPI_SET_URL"));
		item.setExpanded(true);
		return item;
	}
	
	
}
