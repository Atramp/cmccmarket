/**
 * Copyright 2014 By Teradata China Co.Ltd. All rights reserved
 * <p/>
 * Created on 2014-04-08
 */
package com.teradata.market.ui.action;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.market.service.AssessmentBaseDataService;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.poi.hssf.usermodel.HSSFDataFormat;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * 市场调研数据页面
 */
public class AssessmentBaseDataAction extends CommonAction {

    private static final long serialVersionUID = 3613718589414596850L;

    private static final Log logger = LogFactory.getLog(AssessmentBaseDataAction.class);

    private String date;

    private String year;

    /**
     * @return
     */
    public String retrieve() {
        AssessmentBaseDataService service = (AssessmentBaseDataService) ServiceLocatorFactory.getServiceLocator().getService("assessmentBaseDataService");
        String minMonth = service.getMinMonth(this.year);
        String maxMonth = service.getMaxMonth(this.year);
        super.dataInfo.put("MIN_DATE", minMonth);
        super.dataInfo.put("MAX_DATE", maxMonth);
        super.dataInfo.put("YEAR", this.year);
        return "success";
    }

    /**
     * 评估基础数据导出
     */
    public void saveExcel() {
        if (this.date == null || this.date.isEmpty())
            return;
        AssessmentBaseDataService service = (AssessmentBaseDataService) ServiceLocatorFactory.getServiceLocator().getService("assessmentBaseDataService");
        OutputStream os = null;

        try {
            Workbook workbook = WorkbookFactory.create(this.getClass().getResourceAsStream("/template/评估基础数据模板/" + year + ".xls"));

            //<branch,<kpi,value>>
            Map<String, Map<String, BigDecimal>> data = new HashMap<String, Map<String, BigDecimal>>();
            Map<String, CellStyle> cellStyleMapByKpi = new HashMap<String, CellStyle>();// 每个KPI对应的格式

            List<Map> abdExtend = service.getABDExtend();
            List<Map<String, Object>> originData = service.getAllDataByMonth(this.date);

            CellStyle baseStyle = workbook.createCellStyle();
            baseStyle.setBorderBottom(CellStyle.BORDER_THIN);
            baseStyle.setBorderLeft(CellStyle.BORDER_THIN);
            baseStyle.setBorderRight(CellStyle.BORDER_THIN);
            baseStyle.setBorderTop(CellStyle.BORDER_THIN);
            baseStyle.setBottomBorderColor(HSSFColor.BLACK.index);
            baseStyle.setLeftBorderColor(HSSFColor.BLACK.index);
            baseStyle.setRightBorderColor(HSSFColor.BLACK.index);
            baseStyle.setTopBorderColor(HSSFColor.BLACK.index);
            baseStyle.setAlignment(CellStyle.ALIGN_CENTER);
            for (Map<String, String> kpi : abdExtend) {
                CellStyle cellStyle = workbook.createCellStyle();
                cellStyle.cloneStyleFrom(baseStyle);
                cellStyle.setDataFormat(HSSFDataFormat.getBuiltinFormat(kpi.get("FORMAT")));
                cellStyleMapByKpi.put(kpi.get("KPI_ID"), cellStyle);
            }
            //原始数据转换
            for (Map<String, Object> map : originData) {
                String kpiID = (String) map.get("KPI_ID");
                String branchName = (String) map.get("BRANCH_NAME");
                Map<String, BigDecimal> branchData = null;
                if ((branchData = data.get(branchName)) == null) {
                    branchData = new HashMap();
                    data.put(branchName, branchData);
                }
                BigDecimal value = (BigDecimal) map.get("KPI_VALUE");
                BigDecimal multiple = (BigDecimal) map.get("MULTIPLE");
                if (value == null)
                    continue;
                branchData.put(kpiID, value.divide(multiple));
            }


            int numberOfSheets = workbook.getNumberOfSheets();
            for (int i = 1; i < numberOfSheets; i++) {
                Sheet sheet = workbook.getSheetAt(i);
                Cell start = null;

                int rowNum = sheet.getLastRowNum();
                for (int j = 0; j < rowNum && start == null; j++) {
                    Row row = sheet.getRow(j);
                    int cellNum = row.getLastCellNum();
                    for (int k = 0; k < cellNum && start == null; k++) {
                        Cell cell = row.getCell(k);
                        if (cell.getCellType() == Cell.CELL_TYPE_STRING && "ABD".equals(cell.getStringCellValue())) {
                            start = cell;
                        }
                    }
                }

                Row kpiRow = sheet.getRow(start.getRowIndex());
                for (int j = start.getRowIndex() + 1; j <= rowNum; j++) {
                    Row row = sheet.getRow(j);
                    if (row == null)
                        continue;
                    String branch = row.getCell(start.getColumnIndex()).getStringCellValue();
                    if (StringUtils.isEmpty(branch))
                        branch = row.getCell(start.getColumnIndex() - 1).getStringCellValue();
                    if (StringUtils.isEmpty(branch))
                        continue;
                    Map<String, BigDecimal> branchData = data.get(branch);
                    if (branchData == null)
                        continue;
                    for (int k = start.getColumnIndex() + 1, max = row.getLastCellNum(); k < max; k++) {
                        if (kpiRow.getCell(k) == null)
                            continue;
                        String kpi = kpiRow.getCell(k).getStringCellValue();
                        if (StringUtils.isEmpty(kpi))
                            continue;
                        Cell targetCell = row.getCell(k);
                        BigDecimal value = branchData.get(kpi);
                        if (value != null)
                            targetCell.setCellValue(value.doubleValue());

                        CellStyle cellStyle = cellStyleMapByKpi.get(kpi);
                        if (cellStyle != null)
                            targetCell.setCellStyle(cellStyle);
                    }
                }
                sheet.shiftRows(kpiRow.getRowNum() + 1, sheet.getLastRowNum(), -1);
            }
            String fileName = String.format("%s年1-%s月评估基础数据（保密）.xls", date.substring(0, 4), Integer.valueOf(date.substring(4, 6)));
            HttpServletResponse response = this.getResponse();
            response.setContentType("application/vnd.ms-excel");
            response.setHeader("Content-Disposition", "attachment;filename=" + new String(fileName.getBytes("GBK"), "ISO8859-1"));
            // 设定输出文件头
            os = this.getResponse().getOutputStream();
            workbook.write(this.getResponse().getOutputStream());
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InvalidFormatException e) {
            e.printStackTrace();
        } finally {
            if (os != null) {
                try {
                    os.flush();
                    os.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }
}
