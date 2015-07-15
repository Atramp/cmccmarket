 

package com.teradata.permission.bean;


public class DataBean {
    public String FieldName;
    public String FieldValue;
    public int DataType;
   
    
    /** 数据库字段bean
     * @param f_name  字段名称
     * @param f_value 字段值
     * @param f_type  字段类形,0=字符型，1=整型，2=日期
     */
    public DataBean(String f_name, String f_value, int f_type) {
        FieldName =f_name;
        FieldValue =f_value;
        DataType = f_type;
    }
    
}
