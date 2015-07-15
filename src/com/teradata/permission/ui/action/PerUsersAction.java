package com.teradata.permission.ui.action;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.permission.bean.DataField;
import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.service.PerUsersService;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Scope("prototype")
public class PerUsersAction extends CommonAction {

	
	public String USER_BRANCH_GROUP;
	public String USER_DEPT_GROUP;
	public String USER_MID_DATE;
	public String USER_NAME;
	public String USER_REAL_NAME;
	public String USER_ROLE_GROUP;
	public String USER_STATUS;
	public String USER_PWD;
	public String USER_ID;
	public String userIds;
	public String userPwd;

	public String getUSER_BRANCH_GROUP() {
		return USER_BRANCH_GROUP;
	}



	public void setUSER_BRANCH_GROUP(String uSERBRANCHGROUP) {
		USER_BRANCH_GROUP = uSERBRANCHGROUP;
	}



	public String getUSER_DEPT_GROUP() {
		return USER_DEPT_GROUP;
	}



	public void setUSER_DEPT_GROUP(String uSERDEPTGROUP) {
		USER_DEPT_GROUP = uSERDEPTGROUP;
	}



	public String getUSER_MID_DATE() {
		return USER_MID_DATE;
	}



	public void setUSER_MID_DATE(String uSERMIDDATE) {
		USER_MID_DATE = uSERMIDDATE;
	}



	public String getUSER_NAME() {
		return USER_NAME;
	}



	public void setUSER_NAME(String uSERNAME) {
		USER_NAME = uSERNAME;
	}



	public String getUSER_REAL_NAME() {
		return USER_REAL_NAME;
	}



	public void setUSER_REAL_NAME(String uSERREALNAME) {
		USER_REAL_NAME = uSERREALNAME;
	}



	public String getUSER_ROLE_GROUP() {
		return USER_ROLE_GROUP;
	}



	public void setUSER_ROLE_GROUP(String uSERROLEGROUP) {
		USER_ROLE_GROUP = uSERROLEGROUP;
	}



	public String getUSER_STATUS() {
		return USER_STATUS;
	}



	public void setUSER_STATUS(String uSERSTATUS) {
		USER_STATUS = uSERSTATUS;
	}



	public String getUSER_ID() {
		return USER_ID;
	}



	public void setUSER_ID(String uSERID) {
		USER_ID = uSERID;
	}
	
	

	public String getUSER_PWD() {
		return USER_PWD;
	}



	public void setUSER_PWD(String uSERPWD) {
		USER_PWD = uSERPWD;
	}



	private boolean success;
	
	private String message;  
	private int page;
	private int start;
	private int limit;
	private String sort;
	private String _dc;
	private int total;  
	private ArrayList<PerUsers> users;  
	private PerUsers  user;
	
	
	
	
   public PerUsers getUser() {
		return user;
	}



	public void setUser(PerUsers user) {
		this.user = user;
	}



public int getTotal() {
		return total;
	}



	public void setTotal(int total) {
		this.total = total;
	}



public String get_dc() {
		return _dc;
	}



	public void set_dc(String dc) {
		_dc = dc;
	}



public boolean isSuccess() {
		return success;
	}



	public void setSuccess(boolean success) {
		this.success = success;
	}

 
	
public String getUserIds() {
		return userIds;
	}



	public void setUserIds(String userIds) {
		this.userIds = userIds;
	}



 
 
	public String getUserPwd() {
		return userPwd;
	}



	public void setUserPwd(String userPwd) {
		this.userPwd = userPwd;
	}
 

public String getMessage() {
		return message;
	}



	public void setMessage(String message) {
		this.message = message;
	}


	 


	public int getPage() {
		return page;
	}



	public void setPage(int page) {
		this.page = page;
	}



	public int getStart() {
		return start;
	}



	public void setStart(int start) {
		this.start = start;
	}



	public int getLimit() {
		return limit;
	}



	public void setLimit(int limit) {
		this.limit = limit;
	}



	public String getSort() {
		return sort;
	}



	public void setSort(String sort) {
		this.sort = sort;
	}



	public ArrayList<PerUsers> getUsers() {
		return users;
	}



	public void setUsers(ArrayList<PerUsers> users) {
		this.users = users;
	}



	public String selectAllUsers() {
		   PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		   users=perUsersService.selectAllUsers();
		   total=users.size();
		   success=true;
		   return SUCCESS;
	}
	
	public String selectByUserId() {
		   PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		   user=perUsersService.selectByUserId(USER_ID);
		   success=true;
		   return SUCCESS;
	}
	
	public String selectUserByLogin() {
		 PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		
		 if(users!=null&&users.size()==0){
			 success=false;
		 }else{
			 success=true;
		 }
			 
		 if (success) {
		      
		      return SUCCESS;
		 }
		
		
	   return INPUT;
	}
	
	//删除用户
	public String deleteUsers(){
		PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		perUsersService.deleteUsersById(userIds);
		success=true;
	    return SUCCESS;
	}
	
	//修改用户状态
	public String updateUsersStatus(){
		PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		perUsersService.updateUsersStatus(userIds,USER_STATUS);
		success=true;
	    return SUCCESS;
	}
	
	//修改用户密码
	public String updateUserPwd(){
		PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		perUsersService.updateUserPwd(USER_ID,USER_PWD);
		success=true;
	    return SUCCESS;
	}
	
	//修改用户对象
	public String updateUser(){
		PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		 DataField df=new DataField();
		 df.setField("USER_ID", USER_ID, 0);
		 df.setField("USER_NAME", USER_NAME, 0);
		 df.setField("USER_REAL_NAME", USER_REAL_NAME, 0);
		 df.setField("USER_BRANCH_GROUP", USER_BRANCH_GROUP, 0);
		 df.setField("USER_DEPT_GROUP", USER_DEPT_GROUP, 0); 
		 df.setField("USER_STATUS", USER_STATUS, 0); 
		 PerUsers user0=perUsersService.selectByUserId(USER_ID);
		 if(user0.getUSER_NAME().equals(USER_NAME)){
			 perUsersService.updateUser(df);
			 success=true;
			 return SUCCESS;
		 }else{
			 List list=perUsersService.getUserByUserName(df);
			 if(list!=null&&list.size()==0){
				 perUsersService.updateUser(df);
				 success=true;
			 }else{
				 success=false;
				 this.message="用户名已存在！";  
			 }
			 if (success) {
			      
			      return SUCCESS;
			 }
		 }
	   return INPUT;
	}
	
	//添加用户
	public String addUser(){
		PerUsersService perUsersService = (PerUsersService) ServiceLocatorFactory.getServiceLocator().getService("perUsersService");
		 DataField df=new DataField();
		 df.setField("USER_NAME", USER_NAME, 0);
		 df.setField("USER_PWD", userPwd, 0);
		 df.setField("USER_REAL_NAME", USER_REAL_NAME, 0);
		 df.setField("USER_BRANCH_GROUP", USER_BRANCH_GROUP, 0);
		 df.setField("USER_DEPT_GROUP", USER_DEPT_GROUP, 0); 
		List list=perUsersService.getUserByUserName(df);
		 if(list!=null&&list.size()==0){
			 perUsersService.addUser(df);	
			 success=true;
			 this.message="添加用户成功！";  
		 }else{
			 success=false;
			 this.message="用户名已存在！";  
		 }
		 if (success) {
		      
		      return SUCCESS;
		 }
	   return INPUT;
	}

}
