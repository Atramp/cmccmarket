package com.teradata.permission.bean;


import com.teradata.adf.web.djn.DjnTreeNode;

public class CheckedDjnTreeNode extends DjnTreeNode {

	private boolean expanded; //展开
	private boolean checked;   //选中
	private boolean download;
	
	

	public boolean isExpanded() {
		return expanded;
	}

	public void setExpanded(boolean expanded) {
		this.expanded = expanded;
	}

	public boolean isChecked() {
		return checked;
	}

	public void setChecked(boolean checked) {
		this.checked = checked;
	}

	public boolean isDownload() {
		return download;
	}

	public void setDownload(boolean download) {
		this.download = download;
	}
 
	
	
	
}
