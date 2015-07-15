package com.teradata.market.util;

import java.util.*;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFRichTextString;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.teradata.adf.core.util.JsonUtil;

public class PoiExcelUtil {
    public static Map<String, CellStyle> createStyles(Workbook wb) {
        Map styles = new HashMap();

        CellStyle style_base = wb.createCellStyle();
        style_base.setAlignment((short) 2);
        style_base.setVerticalAlignment((short) 1);
        style_base.setWrapText(true);
        style_base.setBorderTop((short) 1);
        style_base.setBorderRight((short) 1);
        style_base.setBorderBottom((short) 1);
        style_base.setBorderLeft((short) 1);

        Font font_bold = wb.createFont();
        font_bold.setBoldweight((short) 700);
        font_bold.setColor(IndexedColors.WHITE.getIndex());

        CellStyle style_header = wb.createCellStyle();
        style_header.cloneStyleFrom(style_base);
        style_header.setFont(font_bold);
        style_header.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        style_header.setFillPattern((short) 1);
        styles.put("style_header", style_header);

        CellStyle style_fcol = wb.createCellStyle();
        style_fcol.cloneStyleFrom(style_base);
        style_fcol.setAlignment((short) 1);
        style_fcol.setVerticalAlignment((short) 1);
        styles.put("style_fcol", style_fcol);

        CellStyle style_data = wb.createCellStyle();
        style_data.cloneStyleFrom(style_base);
        style_data.setAlignment((short) 3);
        style_data.setVerticalAlignment((short) 3);
        styles.put("style_data", style_data);
        return styles;
    }

    public static LinkedHashMap<String, String> getMarketResearchRowMap(List resultList) {
        LinkedHashMap rowMap = new LinkedHashMap();
        for (int m = 0; m < resultList.size(); m++) {
            String data = resultList.get(m) + "";
            data = StringUtils.replace(data, "{", "");
            data = StringUtils.replace(data, "}", "");
            data = data.substring(data.indexOf("KPI_NAME2=") + 10, data.length());
            String[] datas = data.split(",");
            for (int i = 1; i < datas.length; i++) {
                String colName = datas[i].split("-")[0];
                colName = StringUtils.deleteWhitespace(colName);
                rowMap.put(colName, datas[i]);
            }
        }


        return rowMap;
    }

    public static LinkedHashMap<String, LinkedHashMap<String, String>> getMarketResearchDataMap(List resultList) {
        LinkedHashMap dataMap = new LinkedHashMap();
        for (int m = 0; m < resultList.size(); m++) {
            String data = resultList.get(m) + "";
            data = StringUtils.replace(data, "{", "");
            data = StringUtils.replace(data, "}", "");
            data = data.substring(data.indexOf("KPI_NAME2=") + 10, data.length());
            String[] datas = data.split(",");
            String KPI_NAME = datas[0];
            LinkedHashMap valMap = new LinkedHashMap();
            for (int i = 1; i < datas.length; ++i) {
                String rowName = datas[i].split("-", -1)[0];
                String val = datas[i].split("=", -1)[1];
                rowName = StringUtils.deleteWhitespace(rowName);
                if (valMap.containsKey(rowName)) {
                    String n = (String) valMap.get(rowName);
                    n = n + "," + val;
                    valMap.put(rowName, n);
                } else {
                    valMap.put(rowName, val);
                }

            }

            dataMap.put(KPI_NAME, valMap);
        }

        return dataMap;
    }

    public static LinkedHashMap<String, List> getMarketResearchMap(List resultList) {
        LinkedHashMap map = new LinkedHashMap();
        for (int m = 0; m < resultList.size(); ++m) {
            List list;
            String data = resultList.get(m) + "";
            Map entry = (Map) resultList.get(m);
            String DATA_DATE = (String) entry.get("DATA_DATE");
            if (map.containsKey(DATA_DATE)) {
                list = (List) map.get(DATA_DATE);
                list.add(data);
                map.put(DATA_DATE, list);
            } else {
                list = new ArrayList();
                list.add(data);
                map.put(DATA_DATE, list);
            }

        }

        return map;

    }

    public static Workbook createMarketResearch(String fileName, String fristColumNm, String flag, List resultList) {
        LinkedHashMap data = null;

        if (flag.equals("more")) {
            data = getMarketResearchMap(resultList);
        } else {
            data = new LinkedHashMap();
            data.put(fileName, resultList);
        }
        LinkedHashMap headerMap = new LinkedHashMap();
        LinkedHashMap dataMap = new LinkedHashMap();

        Workbook wb = new XSSFWorkbook();
        for (Iterator localIterator = data.entrySet().iterator(); localIterator.hasNext(); ) {

            Map.Entry sheetEntry = (Map.Entry) localIterator.next();

            headerMap = getMarketResearchRowMap((List) sheetEntry.getValue());

            dataMap = getMarketResearchDataMap((List) sheetEntry.getValue());
            System.out.println("##############################");
            wb = createMarketResearch(wb, fileName, fristColumNm, (String) sheetEntry.getKey(), headerMap, dataMap);
        }
        return wb;
    }

    private static Workbook createMarketResearch(Workbook wb, String fileName, String fristColumNm, String sheetName, LinkedHashMap<String, String> headerMap, LinkedHashMap<String, LinkedHashMap<String, String>> dataMap) {
        List<Entry<String, String>> entries = new ArrayList(headerMap.entrySet());
        if (!headerMap.containsKey("全国"))
            Collections.sort(entries, new Comparator<Entry<String, String>>() {
                @Override
                public int compare(Entry<String, String> o, Entry<String, String> t1) {
                    return o.getKey().compareTo(t1.getKey());
                }
            });
        Sheet sheet = wb.createSheet(sheetName);
        Map styleMap = createStyles(wb);
        int row = 0;
        int rows = 1;
        int col = 0;
        int cols = 0;

        sheet.addMergedRegion(new CellRangeAddress(row, rows, col, cols));
        Row first_row = sheet.createRow(0);
        Cell cell = first_row.createCell(0);
        cell.setCellStyle((CellStyle) styleMap.get("style_header"));
        cell.setCellValue(new XSSFRichTextString(" " + fristColumNm));

        row = 0;
        rows = 0;
        col = 1;
        cols = 3;
        Row second_row = sheet.createRow(1);

        String header_str = "";
        for (Map.Entry entry : entries) {
            String key = (String) entry.getKey();
            sheet.addMergedRegion(new CellRangeAddress(row, rows, col, cols));
            cell = first_row.createCell((short) col);
            cell.setCellStyle((CellStyle) styleMap.get("style_header"));
            cell.setCellValue(key);

            cell = second_row.createCell((short) col);
            cell.setCellStyle((CellStyle) styleMap.get("style_header"));
            cell.setCellValue("指标值");
            ++col;
            cell = second_row.createCell((short) col);
            cell.setCellStyle((CellStyle) styleMap.get("style_header"));
            cell.setCellValue("排名");
            ++col;
            cell = second_row.createCell((short) col);
            cell.setCellStyle((CellStyle) styleMap.get("style_header"));
            cell.setCellValue("组内排名");

            row = 0;
            rows = 0;
            col = 1 + cols;
            cols += 3;
            header_str = header_str + key + ",";
        }

        row = 2;
        col = 0;

        for (Map.Entry entry : dataMap.entrySet()) {

            Row data_row = sheet.createRow((short) row);
            Cell data_cell = data_row.createCell((short) col);
            data_cell.setCellStyle((CellStyle) styleMap.get("style_fcol"));
            data_cell.setCellValue((String) entry.getKey());

            LinkedHashMap data = (LinkedHashMap) entry.getValue();
            String[] hs = header_str.split(",");

            for (int h = 0; h < hs.length; ++h) {
                String s = hs[h];

                if (data.containsKey(s)) {
                    String[] ss = ((String) data.get(s)).split(",");
                    for (int m = 0; m < ss.length; ++m) {
                        ++col;
                        data_cell = data_row.createCell((short) col);
                        data_cell.setCellStyle((CellStyle) styleMap.get("style_data"));
                        try {
                            double d = Double.parseDouble(ss[m]);
                            data_cell.setCellValue(d);
                        } catch (Exception ex) {
                            data_cell.setCellValue(ss[m]);
                        }
                    }
                } else {
                    for (int m = 0; m < 3; ++m) {
                        ++col;
                        data_cell = data_row.createCell((short) col);
                        data_cell.setCellStyle((CellStyle) styleMap.get("style_data"));
                        data_cell.setCellValue("");
                    }
                }
            }

            col = 0;
            ++row;
        }

        sheet.setColumnWidth(0, 12800);
        sheet.createFreezePane(1, 0, 1, 0);

        return wb;
    }
}