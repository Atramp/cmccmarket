package com.teradata.permission.service;

import com.teradata.adf.core.dao.CommonDao;
import com.teradata.adf.core.service.CommonService;
import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.permission.bean.DataField;
import com.teradata.permission.bean.PerBranch;
import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.util.PermissionUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


//用户
public class PerUsersService  extends CommonService {

	private static final String CACHE_KEY_MENUS = "PER_USERS";
	 HashMap<String,String> branchNameMap=PerBranch.getBranchByName();
	 HashMap<String,String> deptNameMap=PerBranch.getDeptByName();
	 HashMap<String,String> statusNameMap=PermissionUtil.getUserStatusByName();
	 
	public ArrayList<PerUsers>  getUserDataField(List list){
		  ArrayList<PerUsers>  data=new ArrayList<PerUsers>();
		for(int i=0;i<list.size();i++){
	    	Map map = (Map)list.get(i);
	    	PerUsers user=new PerUsers();
            user.setUSER_ID(""+map.get("USER_ID"));
            user.setUSER_NAME(""+map.get("USER_NAME"));
            user.setUSER_REAL_NAME(""+map.get("USER_REAL_NAME"));
            HashMap<String,String> smap=PermissionUtil.getUserStatusByCode();
            if(smap.containsKey(""+map.get("USER_STATUS"))){
            	user.setUSER_STATUS(smap.get(""+map.get("USER_STATUS")));
            }else{
            	user.setUSER_STATUS(""+map.get("USER_STATUS"));
            }
            user.setUSER_PWD(""+map.get("USER_PWD"));
            user.setUSER_ROLE_GROUP(""+map.get("USER_ROLE_GROUP"));
            user.setUSER_DATA_GROUP(""+map.get("USER_DATA_GROUP")); 
            HashMap<String,String> bmap=PerBranch.getBranchByCode();
            if(bmap.containsKey(""+map.get("USER_BRANCH_GROUP"))){
            	user.setUSER_BRANCH_GROUP(bmap.get(""+map.get("USER_BRANCH_GROUP")));
            }else{
            	user.setUSER_BRANCH_GROUP(""+map.get("USER_BRANCH_GROUP"));
            }
            
            HashMap<String,String> dmap=PerBranch.getDeptByCode();
            if(dmap.containsKey(""+map.get("USER_DEPT_GROUP"))){
            	user.setUSER_DEPT_GROUP(dmap.get(""+map.get("USER_DEPT_GROUP")));
            }else{
            	user.setUSER_DEPT_GROUP(""+map.get("USER_DEPT_GROUP"));
            }
             
            user.setUSER_SEQ(""+map.get("USER_SEQ"));
            user.setUSER_MID_DATE(""+map.get("USER_MID_DATE"));
            data.add(user);
	    }
		return data;
	}
	
	/**
	 *  获得用户列表
	 * @return
	 */
	 public ArrayList<PerUsers> selectAllUsers() {
		 List roleList=queryData("PER_ROLE.selectUserRole", null);
		 
		 HashMap<String,String> usermap=new HashMap<String,String>();
		 for(int i=0;i<roleList.size();i++){
	    	  Map map = (Map)roleList.get(i);
	    	  String key=map.get("USER_ID")+"";
	    	  String ROLE_NAME=map.get("ROLE_NAME")+"";
	    	  if(usermap.containsKey(key)){
	    		  usermap.put(key, usermap.get(key)+","+ROLE_NAME);
	    	  }else{
	    		  usermap.put(key, ROLE_NAME);
	    	  }
	    	 
		 }
		 ArrayList<PerUsers> userList=getUserDataField(queryData("PER_USERS.geUsers", null));
		 for(int i=0;i<userList.size();i++){
			 PerUsers user = (PerUsers)userList.get(i);
			 if(usermap.containsKey(user.getUSER_ID())){
				 user.setUSER_ROLE_GROUP(usermap.get(user.getUSER_ID()));
			 }else{
				 user.setUSER_ROLE_GROUP("-");
			 }
		 }
		 
		 return userList;
	 }
 
	 
	 public PerUsers selectUserByLogin(String USER_NAME,String USER_PWD) {
		 HashMap<String,String> data=new HashMap<String,String>();
		 data.put("USER_NAME",USER_NAME);
		 data.put("USER_PWD",USER_PWD);
		 ArrayList<PerUsers>  userList=getUserDataField(queryData("PER_USERS.geUserByLogin", data));
		 PerUsers  user=new PerUsers();
		 if(userList.size()>0) user=userList.get(0);
		 return user;
	 }
	 
	 
	 public List getUserByUserName(DataField  df){
		 HashMap<String,String> data=new HashMap<String,String>();
		 data.put("USER_NAME", df.getField("USER_NAME").FieldValue);
		 return queryData("PER_USERS.getUserByUserName", data);
	 }
	 
	 public PerUsers selectByUserId(String USER_ID) {
		 HashMap<String,String> data=new HashMap<String,String>();
		 data.put("USER_ID",USER_ID);
		 ArrayList<PerUsers>  list=getUserDataField(queryData("PER_USERS.getUserByUserId", data));
		 PerUsers  users=new PerUsers();
		 if(list.size()>0){
			 users=list.get(0);
			 List roleList=queryData("PER_ROLE.selectUserRoleByUserId", data);
			 String ROLE_NAME="";
			 for(int i=0;i<roleList.size();i++){
		    	  Map map = (Map)roleList.get(i);
		    	  ROLE_NAME+=map.get("ROLE_NAME")+",";
			 }
			 if(ROLE_NAME.endsWith(",")){ROLE_NAME=ROLE_NAME.substring(0,ROLE_NAME.length()-1);}
			 users.setUSER_ROLE_GROUP(ROLE_NAME);
			 
		 }
		 return users;
	 }
	 
	 
	 //删除用户,根据id号
	 public void deleteUsersById(String ids){
		 HashMap<String,String> data=new HashMap<String,String>();
		 if(ids.endsWith(",")){ids=ids.substring(0,ids.length()-1);}
		 data.put("USER_ID",ids);
		 dao.insert("PER_USERS.deleteUsersById", data);
	 }
	 
	//更新用户状态,根据id号
	 public void updateUsersStatus(String ids,String USER_STATUS){
		 HashMap<String,String> data=new HashMap<String,String>();
		 if(ids.endsWith(",")){ids=ids.substring(0,ids.length()-1);}
		 data.put("USER_ID",ids);
		 data.put("USER_STATUS",USER_STATUS);
		 dao.insert("PER_USERS.updateUsersStatus", data);
	 }
	 
	 //更新用户密码,根据id号
	 public void updateUserPwd(String id,String USER_PWD){
		 HashMap<String,String> data=new HashMap<String,String>();
		 data.put("USER_ID",id);
		 data.put("USER_PWD",USER_PWD);
		 dao.insert("PER_USERS.updateUserPwd", data);
	 }
	 
	//更新用户
	 public void updateUser(DataField  df){
		 HashMap<String,String> data=new HashMap<String,String>();
		 data.put("USER_ID", df.getField("USER_ID").FieldValue);
		 data.put("USER_NAME", df.getField("USER_NAME").FieldValue);
		 data.put("USER_REAL_NAME", df.getField("USER_REAL_NAME").FieldValue);
		
		 String USER_BRANCH_GROUP=df.getField("USER_BRANCH_GROUP").FieldValue;
		 if(branchNameMap.containsKey(USER_BRANCH_GROUP)){
			 data.put("USER_BRANCH_GROUP",branchNameMap.get(USER_BRANCH_GROUP)); 
		 }else{
			 data.put("USER_BRANCH_GROUP", df.getField("USER_BRANCH_GROUP").FieldValue);
		 }
		 
		 String USER_DEPT_GROUP=df.getField("USER_DEPT_GROUP").FieldValue;
		 if(deptNameMap.containsKey(USER_DEPT_GROUP)){
			 data.put("USER_DEPT_GROUP",deptNameMap.get(USER_DEPT_GROUP)); 
		 }else{
			 data.put("USER_DEPT_GROUP", df.getField("USER_DEPT_GROUP").FieldValue);
		 }
		 
		 String USER_STATUS=df.getField("USER_STATUS").FieldValue;
		 if(statusNameMap.containsKey(USER_STATUS)){
			 data.put("USER_STATUS",statusNameMap.get(USER_STATUS)); 
		 }else{
			 data.put("USER_STATUS", df.getField("USER_STATUS").FieldValue);
		 }
		 dao.insert("PER_USERS.updateUser", data);
	 }
	 
	 //添加用户
	 public void addUser(DataField  df){
		 CommonDao dao = (CommonDao) ServiceLocatorFactory.getServiceLocator().getService("commonDao");
		 HashMap<String,String> data=new HashMap<String,String>();
		 data.put("USER_NAME", df.getField("USER_NAME").FieldValue);
		 data.put("USER_PWD", df.getField("USER_PWD").FieldValue);
		 data.put("USER_REAL_NAME", df.getField("USER_REAL_NAME").FieldValue);
		 String USER_BRANCH_GROUP=df.getField("USER_BRANCH_GROUP").FieldValue;
		 if(branchNameMap.containsKey(USER_BRANCH_GROUP)){
			 data.put("USER_BRANCH_GROUP",branchNameMap.get(USER_BRANCH_GROUP)); 
		 }else{
			 data.put("USER_BRANCH_GROUP", df.getField("USER_BRANCH_GROUP").FieldValue);
		 }
		 String USER_DEPT_GROUP=df.getField("USER_DEPT_GROUP").FieldValue;
		 if(deptNameMap.containsKey(USER_DEPT_GROUP)){
			 data.put("USER_DEPT_GROUP",deptNameMap.get(USER_DEPT_GROUP)); 
		 }else{
			 data.put("USER_DEPT_GROUP", df.getField("USER_DEPT_GROUP").FieldValue);
		 }
	 	 dao.insert("PER_USERS.add", data);
		 
	 }
	 
 
	 
	 
 
	  
}
