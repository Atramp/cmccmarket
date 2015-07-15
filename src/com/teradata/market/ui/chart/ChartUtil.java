package com.teradata.market.ui.chart;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

//import com.teradata.db.DBQueryEngine;
//import com.teradata.tap.system.query.QueryException;

public class ChartUtil {

    private static final Log logger = LogFactory.getLog(ChartUtil.class);

    /**
     * 根据图形类型和查询语句生成序列图对象。
     * @param chartStyle            图形样式
     * @param datas                按照result结构组织的数据
     * @param seriesColName        Series列名
     * @param categoryColName    Category列名
     * @param valueColName        Value列名
     * @return                  序列图对象
     */
    public static CategoryChart genCatChart(int chartStyle,
            List datas, String seriesColName,
            String categoryColName, String valueColName) {
        
        //由于从数据库获取的结果集里面的列名是转换为大写的，所以，将以下列名转换为大写
        seriesColName = seriesColName.toUpperCase();
        categoryColName = categoryColName.toUpperCase();
        valueColName = valueColName.toUpperCase();
        
        CategoryChart chart = new CategoryChart(chartStyle);

        //获取结果集
        //List datas = getDataFromDB(qryEngine, query);
        
        //生成图形对象所需数据
        List seriesList = new ArrayList();
        List numberSuffixList = new ArrayList();
        Map seriesMap = new HashMap();

        List catList = new ArrayList();
        Map catMap = new HashMap();
        
        List chartTypeList = new ArrayList();
        
        List axisTypesList = new ArrayList();
        
		DecimalFormat format = new DecimalFormat("######.#");
		DecimalFormat formatTwo = new DecimalFormat("######.##");
        for (Iterator iter = datas.iterator(); iter.hasNext();) {
            Map data = (Map) iter.next();
            //容错处理，避免值为null时出错
            String seriesName = data.get(seriesColName) == null? null : data.get(seriesColName).toString();
            String catName = data.get(categoryColName) == null? null : data.get(categoryColName).toString();
            String value = data.get(valueColName) == null? null : data.get(valueColName).toString();
            // 导出表格的数据只保留2位小数，不进行单位换算
            if(data.get("KPI_NAME").toString().indexOf("%") == -1)
            	data.put(valueColName + "ORIGIN", formatTwo.format(Double.parseDouble(value)));
            else
            	data.put(valueColName + "ORIGIN", numberFormat(value,(String)data.get("UNIT_MULTIPLE"),(String)data.get("PRECISIONS_FORMAT")));
            // 图表和页面表格数据进行单位换算
            value = numberFormat(value,(String)data.get("UNIT_MULTIPLE"),(String)data.get("PRECISIONS_FORMAT"));
            data.put(valueColName, value);
            
            if (!seriesMap.containsKey(seriesName)) {
                seriesList.add(seriesName);
                numberSuffixList.add((String) data.get("UNIT_NAME"));
                chartTypeList.add((String)data.get("CHART_TYPE_CODE"));
                axisTypesList.add((String)data.get("AXIS"));
                seriesMap.put(seriesName, new HashMap());
            }
            Map valueMap = (Map) seriesMap.get(seriesName);
            valueMap.put(catName, value);

            if (!catMap.containsKey(catName)) {
                catList.add(catName);
                catMap.put(catName, null);
            }
        }

        String[] serieNames = new String[seriesList.size()];
        String[] numberSuffixes = new String[numberSuffixList.size()];
        String[] categoryNames = new String[catList.size()];
        String[] chartTypes = new String[chartTypeList.size()];
        String[] axisTypes = new String[axisTypesList.size()];
        String[][] values = new String[seriesList.size()][catList.size()];

        serieNames = (String[]) seriesList.toArray(serieNames);
        numberSuffixes = (String[]) numberSuffixList.toArray(numberSuffixes);
        categoryNames = (String[]) catList.toArray(categoryNames);
        chartTypes = (String[]) chartTypeList.toArray(chartTypes);
        axisTypes = (String[]) axisTypesList.toArray(axisTypes);
        for (int i = 0; i < seriesList.size(); i++) {
            String seriesName = (String) seriesList.get(i);
            Map valueMap = (Map) seriesMap.get(seriesName);
            for (int j = 0; j < catList.size(); j++) {
                String catName = (String) catList.get(j);
                String value = (String) valueMap.get(catName);
                if (value == null) 
                    value = "";
                else
                	value = format.format(Double.parseDouble(value));
                values[i][j] = value;
            }
        }

        chart.setSerieNames(serieNames);
        chart.setCategoryNames(categoryNames);
        chart.setDatas(values);
        chart.setTypes(chartTypes);
        chart.setAxisTypes(axisTypes);
        
        // 双轴图增加双Y轴的指标显示
        if("1".equals(chart.getDoubleYAxisFlag()) && serieNames.length > 1) {
        	chart.setAxisNameY(serieNames[0]);
            chart.setNumberSuffix(numberSuffixes[0] == null || !"%".equals(numberSuffixes[0]) ? "" : numberSuffixes[0]);
            chart.setAxisNameYS(serieNames[1]);
            chart.setsNumberSuffix(numberSuffixes[1] == null || !"%".equals(numberSuffixes[1]) ? "" : numberSuffixes[1]);
        }
        
        // 生成表格展示所需数据
        Map tableData = genTableData(datas, serieNames, categoryNames, seriesColName, categoryColName, valueColName, 0);
        datas.add(tableData);
        
        return chart;
    }
    
    /**
     * 根据图形类型和查询语句生成序列图对象。
     * 
     * @param chartStyle    图形样式
     * @param template    模板文件
     * @param flashFile    FLASH文件
     * @param datas    按照result结构组织的数据
     * @param seriesColName    Series列名
     * @param categoryColName    Category列名
     * @param valueColName    Value列名
     * @return    序列图对象
     */
    public static CategoryChart genCatChart(int chartStyle, String template, String flashFile,
            List datas, String seriesColName,
            String categoryColName, String valueColName){
        CategoryChart chart = genCatChart(chartStyle,datas,seriesColName,categoryColName,valueColName);
        chart.setTemplate(template);
        chart.setFlashFile(flashFile);
        
        return chart;
    }
    
    /**
     * 根据查询数据整理出页面表格显示的数据格式
     * @param datas 数据库返回数据
     * @param seriesColNames    Series
     * @param seriesColName    Series列名
     * @param categoryColName    Category列名
     * @param valueColName    Value列名
     * @param tableType 0-以category为行  1-以series为行
     */
    private static Map genTableData(List datas,String[] serieNames, String[] categoryNames, String seriesColName,String categoryColName,String valueColName,int tableType){
		Map data4Display = new LinkedHashMap();
		Map data4Export = new LinkedHashMap();
		
		String rowKey = categoryColName;//第一列的字段名
		String columnKey = seriesColName;//剩余列的字段名
		String[] columns = serieNames;//剩余列名
		String[] newColumns = new String[columns.length + 1];// 页面表头

		if (tableType == 1) {
			rowKey = seriesColName;
			columnKey = categoryColName;
			columns = categoryNames;
			
			newColumns[0] = "机构";
			System.arraycopy(categoryNames, 0, newColumns, 1, categoryNames.length);
		} else {
			newColumns[0] = "日期";
			System.arraycopy(serieNames, 0, newColumns, 1, serieNames.length);
		}
		
		//循环处理数据库返回结果。将不同的KPI的数据整理合并。
		for (int i = 0; i < datas.size(); i++) {
			Map data = (Map) datas.get(i);

			String key = String.valueOf(data.get(rowKey));//页面和excel表个中第一列的值
			String[] item = (String[]) data4Display.get(key);//页面表格中的每一行
			Map map = (Map) data4Export.get(key);//excel中每一行
			
			if(map == null) {
				map = new HashMap();
				data4Export.put(key, map);
			}
			
			if (item == null) {
				item = new String[columns.length + 1];
				Arrays.fill(item, "-");//初始化为- 如果无数据页面就会显示-
				data4Display.put(key, item);
			}
			map.put(newColumns[0], key);
			item[0] = key;
			
			for (int k = 0; k < columns.length; k++) {
				if(map.get(columns[k]) == null){
					map.put(columns[k], "-");
				}
				if (String.valueOf(data.get(columnKey)).equals(columns[k])){
					String value = (String) data.get(valueColName + "ORIGIN");
					item[k + 1] = (String) data.get(valueColName);
					map.put(columns[k], value);
				}
			}
		}
		
		String[] newColumns4Export = new String[newColumns.length];
		System.arraycopy(newColumns, 0, newColumns4Export, 0, newColumns.length);
		for (int i = 0; i < newColumns4Export.length; i++) {
			String temp = newColumns4Export[i];
			//Pattern pattern = Pattern.compile("亿|万|\\(%\\)");// 百分百不处理
			Pattern pattern = Pattern.compile("亿|万");
			Matcher matcher = pattern.matcher(temp);
			temp = matcher.replaceFirst("");
			newColumns4Export[i] = temp;
		}
		Map tableData = new HashMap();
		tableData.put("COLUMNS", newColumns);
		tableData.put("COLUMNS4EXPORT", newColumns4Export);
		tableData.put("DATA4DISPLAY", new ArrayList(data4Display.values()));
		tableData.put("DATA4EXPORT", new ArrayList(data4Export.values()));

		return tableData; 
    }
    
	/**
	 * 数据格式化
	 * @param value
	 * @param divisor
	 * @param formatStr
	 * @return
	 */
	public static String numberFormat(String value, String divisor, String formatStr) {
		if (value == null || value.length() == 0 || divisor == null || divisor.length() == 0
				|| formatStr == null || formatStr.length() == 0) {
			return value;
		}
		BigDecimal result = new BigDecimal(value).divide(new BigDecimal(divisor));
		DecimalFormat format = new DecimalFormat(formatStr);
		return format.format(result);
	}

}
