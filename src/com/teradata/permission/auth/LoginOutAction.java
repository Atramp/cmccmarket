package com.teradata.permission.auth;

import com.teradata.adf.web.action.CommonAction;
import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.util.GlobalConstants;

import javax.servlet.ServletException;
import java.io.IOException;

public class LoginOutAction  extends CommonAction {
	
	
	
	public String loginOut() throws IOException, ServletException {
		String ip = this.getRequest().getRemoteAddr();
	    PerUsers userVO = (PerUsers)this.getSession().getAttribute(GlobalConstants.USER_INFO_KEY);
	  	
	  	//add end
	    this.getRequest().getSession().setAttribute("logout_mode", "1");	
	    this.getRequest().getSession().removeAttribute("USER_NAME");  
	    this.getRequest().getSession().removeAttribute(GlobalConstants.USER_INFO_KEY);  
	    this.getRequest().getSession().invalidate();
	   
	    
	    return SUCCESS;
	  }
}
