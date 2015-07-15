package com.teradata.permission.bean;

import java.util.HashMap;
import java.util.LinkedHashMap;

public class PerBranch {

	private int Id;
	private String name;
	private String code;
	private int seq;
	
	public static LinkedHashMap<String,String> getDeptByName(){
		LinkedHashMap<String,String> map=new LinkedHashMap<String,String>();
		map.put("市场部","10100");
		map.put("财务部","10200");
		map.put("计划部","10300");
		map.put("业撑部","10400");
		return map;
	}
	
	public static LinkedHashMap<String,String> getDeptByCode(){
		LinkedHashMap<String,String> map=new LinkedHashMap<String,String>();
		map.put("10100","市场部");
		map.put("10200","财务部");
		map.put("10300","计划部");
		map.put("10400","业撑部");
		return map;
	}
	
	
	public static LinkedHashMap<String,String> getBranchByName(){
		LinkedHashMap<String,String> map=new LinkedHashMap<String,String>();
		map.put("集团","10000");
		map.put("北京","10100");
		map.put("上海","10200");
		map.put("天津","10300");
		map.put("重庆","10400");
		map.put("贵州","10500");
		map.put("湖北","10600");
		map.put("陕西","10700");
		map.put("河北","10800");
		map.put("河南","10900");
		map.put("安徽","11000");
		map.put("福建","11100");
		map.put("青海","11200");
		map.put("甘肃","11300");
		map.put("浙江","11400");
		map.put("海南","11500");
		map.put("黑龙江","11600");
		map.put("江苏","11700");
		map.put("吉林","11800");
		map.put("宁夏","11900");
		map.put("山东","12000");
		map.put("山西","12100");
		map.put("新疆","12200");
		map.put("广东","12300");
		map.put("辽宁","12400");
		map.put("广西","12500");
		map.put("湖南","12600");
		map.put("江西","12700");
		map.put("内蒙古","12800");
		map.put("云南","12900");
		map.put("四川","13000");
		map.put("西藏","13100");
		
		return map;
	}
	
	
	public static HashMap<String,String> getBranchByCode(){
		HashMap<String,String> map=new HashMap<String,String>();
		map.put("10100","北京");
		map.put("10200","上海");
		map.put("10300","天津");
		map.put("10400","重庆");
		map.put("10500","贵州");
		map.put("10600","湖北");
		map.put("10700","陕西");
		map.put("10800","河北");
		map.put("10900","河南");
		map.put("11000","安徽");
		map.put("11100","福建");
		map.put("11200","青海");
		map.put("11300","甘肃");
		map.put("11400","浙江");
		map.put("11500","海南");
		map.put("11600","黑龙江");
		map.put("11700","江苏");
		map.put("11800","吉林");
		map.put("11900","宁夏");
		map.put("12000","山东");
		map.put("12100","山西");
		map.put("12200","新疆");
		map.put("12300","广东");
		map.put("12400","辽宁");
		map.put("12500","广西");
		map.put("12600","湖南");
		map.put("12700","江西");
		map.put("12800","内蒙古");
		map.put("12900","云南");
		map.put("13000","四川");
		map.put("13100","西藏");
		map.put("10000","集团");
		return map;
	}
	
	
	public int getId() {
		return Id;
	}
	public void setId(int id) {
		Id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public int getSeq() {
		return seq;
	}
	public void setSeq(int seq) {
		this.seq = seq;
	}
	
	
	
}
