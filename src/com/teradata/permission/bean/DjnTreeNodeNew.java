package com.teradata.permission.bean;


import com.teradata.adf.web.djn.DjnTreeNode;

public class DjnTreeNodeNew extends DjnTreeNode {

	private boolean expanded; //展开
	private boolean done;   //选中
	private boolean download;
	
	

	public boolean isExpanded() {
		return expanded;
	}

	public void setExpanded(boolean expanded) {
		this.expanded = expanded;
	}

	public boolean isDone() {
		return done;
	}

	public void setDone(boolean done) {
		this.done = done;
	}

	public boolean isDownload() {
		return download;
	}

	public void setDownload(boolean download) {
		this.download = download;
	}
 
	
	
	
}
