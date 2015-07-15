 

package com.teradata.permission.bean;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.Hashtable;
  


public class DataField {
    private static Log log = LogFactory.getLog(DataField.class);
    private Hashtable fields;
    DataBean dataBean;
    /** Creates a new instance of DateField */
    public DataField() {
        fields = new Hashtable();
    }
    /** 根据字段名称获取字段bean
     * @param fieldname  字段名称
     * @return DataBean
     */
    public DataBean getField(String fieldname) {
        return (DataBean)fields.get(fieldname);
    }
    /** 获取所有字段
     * @return Hashtable
     */
    public Hashtable getFields(){
        return fields;
    }
    /** 根据字段名称获取字段值
     * @param fieldname  字段名称
     * @return String
     */
    public String getFieldValue(String fieldname) {
        dataBean = getField(fieldname);
        if(dataBean == null) {
            return null;
        } else {
            return dataBean.FieldValue;
        }
    }
    public int getInt(String fieldname){
        int ret=0;
        String s=getFieldValue(fieldname);
        if(s!=null) ret=Integer.parseInt(s);
        return ret;
    }
    /** 添加字段
     * @param fieldname  字段名称
     * @param fieldvalue 字段值
     * @param fieldtype 字段类型 0=字符型，1=整型，2=日期
     */
    public void setField(String fieldname, String fieldvalue, int fieldtype) {
        fields.put(fieldname, new DataBean(fieldname, fieldvalue, fieldtype));
    }
    /** 清除字段
     */
    public void clear() {
        try {
            if(!fields.isEmpty()) {
                fields.clear();
            }
        } catch(Exception e) {
            log.error("DataField Clear Error:",e);
        }
    }
    /** 获取字段个数 */
    public int getLength() {
        return fields.size();
    }
    
}
