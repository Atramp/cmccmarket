package com.teradata.market.ui.action;

import com.teradata.adf.core.service.ServiceLocatorFactory;
import com.teradata.adf.web.action.CommonAction;
import com.teradata.market.service.BranchService;
import com.teradata.market.service.MarketAnalysisService;
import com.teradata.market.ui.chart.CategoryChart;
import com.teradata.market.ui.chart.ChartObject;
import com.teradata.market.ui.chart.fusionchart.FCCategoryChartProducer;
import com.teradata.market.util.DateUtil;
import com.teradata.market.util.FreemarkerUtil;
import com.teradata.permission.bean.PerUsers;
import com.teradata.permission.util.GlobalConstants;
import freemarker.template.Configuration;
import freemarker.template.DefaultObjectWrapper;
import org.apache.batik.transcoder.Transcoder;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.JPEGTranscoder;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.collections.map.MultiValueMap;
import org.apache.commons.io.input.CharSequenceReader;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.log4j.Logger;
import org.docx4j.XmlUtils;
import org.docx4j.dml.wordprocessingDrawing.Inline;
import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.BinaryPartAbstractImage;
import org.docx4j.wml.*;

import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBElement;
import java.io.*;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.*;
import java.util.concurrent.*;

/**
 * Created by alex on 15-3-18.
 */
public class MarketingAnalysisAction extends CommonAction {
    private static final Log logger = LogFactory.getLog(KpiDataAction.class);
    private MarketAnalysisService service = (MarketAnalysisService) ServiceLocatorFactory.getServiceLocator().getService("marketAnalysisService");
    private BranchService branchService = (BranchService) ServiceLocatorFactory.getServiceLocator().getService("branchService");
    private String date = null;
    private String branchId = null;
    private String branchName = null;
    private Configuration cfg = null;

    {
        cfg = new Configuration(Configuration.VERSION_2_3_0);
        cfg.setServletContextForTemplateLoading(this.getServletContext(), "WEB-INF/classes/template/");
        cfg.setObjectWrapper(new DefaultObjectWrapper(Configuration.VERSION_2_3_0));
    }

    /**
     * /market/retrieveMarketingAnalysis.action
     * 返回页面数据，包括文字和图标xml
     *
     * @return
     */
    public String retrieve() {
        if (date == null || branchId == null)
            return SUCCESS;
        List<Map> kpiSetList = service.getMarketAnalysisKpiSet();
        ExecutorService executorService = Executors.newFixedThreadPool(10);
        for (Map kpiSet : kpiSetList) {
            List<Map> kpiGroupList = service.getMarketAnalysisKpiGroupBySet(kpiSet);
            kpiSet.put("KPI_GROUPS", kpiGroupList);
            for (final Map kpiGroup : kpiGroupList) {
                executorService.execute(new Runnable() {
                    public void run() {
                        processGroupData(kpiGroup);
                    }
                });
            }
        }
        try {
            executorService.shutdown();
            while (!executorService.awaitTermination(100, TimeUnit.MILLISECONDS)) {
                Logger.getLogger(this.getClass()).debug("处理未完成");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        this.datas = kpiSetList;
        getSession().setAttribute("datas", this.datas);

        // 生成用户临时目录
        PerUsers user = (PerUsers) getSession().getAttribute(GlobalConstants.USER_INFO_KEY);
        String path = getRealPath("//jsp//marketing-analysis//") + "//" + user.getUSER_NAME();
        checkDirExists(path, true);// 检查用户目录是否存在，不存在则创建
        getSession().setAttribute("basePath", path);
        return SUCCESS;
    }

    public void saveSVG() throws IOException {

        String svg = getRequest().getParameter("SVG");
        String ID = getRequest().getParameter("ID");
        String width = getRequest().getParameter("WIDTH");

        String picFolderPath = getSession().getAttribute("basePath") + "//charts//" + date + "//";
        checkDirExists(picFolderPath, true);// 检查图片目录是否存在，不存在则创建

        Transcoder transcoder = new JPEGTranscoder();
        transcoder.addTranscodingHint(JPEGTranscoder.KEY_QUALITY, 1.0F);
        transcoder.addTranscodingHint(JPEGTranscoder.KEY_WIDTH, 2 * Float.parseFloat(StringUtils.defaultString(width, "450")));
        transcoder.addTranscodingHint(JPEGTranscoder.KEY_HEIGHT, 500F);
        TranscoderInput input = new TranscoderInput(new CharSequenceReader(svg));
        OutputStream outputStream = null;
        try {
            outputStream = new FileOutputStream(picFolderPath + ID + ".jpg");
            TranscoderOutput output = new TranscoderOutput(outputStream);
            transcoder.transcode(input, output);
        } catch (Exception e) {
            try {
                getResponse().sendError(500);
            } catch (IOException e1) {
            }
        } finally {
            try {
                outputStream.close();
            } catch (IOException e) {
            }
        }
    }

    public void downloadDoc() {
        String tempName = getRequest().getParameter("tempName");
        if (tempName != null && !tempName.isEmpty()) {
            OutputStream outputStream = null;
            try {
                File file = new File(getSession().getAttribute("basePath") + "//temp//" + tempName);
                if (file.exists()) {
                    HttpServletResponse response = getResponse();
                    response.setHeader("Content-disposition", "attachment; filename="
                            + new String(getRequest().getParameter("fileName").getBytes(), "ISO8859-1"));
                    response.setContentType("application/ms-doc");// 定义输出类型
                    FileInputStream fileInputStream = new FileInputStream(file);
                    outputStream = response.getOutputStream();

                    int i = -1;
                    while ((i = fileInputStream.read()) != -1)
                        outputStream.write(i);
                    outputStream.flush();
                    file.delete();
                }
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (outputStream != null)
                    try {
                        outputStream.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
            }
        }
    }

    /**
     * /market/saveToDoc_mkt_analysis.action
     * 返回doc文件
     */
    public void saveDoc() {
        String basePath = (String) getSession().getAttribute("basePath");
        String picFolderPath = basePath + "//charts//" + date + "//";
        try {
            if (!checkDirExists(picFolderPath, false))// 图片目录不存在则退出
                return;
            // 加载模板doc
            WordprocessingMLPackage template = WordprocessingMLPackage.load(this.getClass().getResourceAsStream("/template/市场简析报告.doc"));
            // 获取文档中的表格
            List<Object> tables = getAllElementFromObject(template.getMainDocumentPart(), Tbl.class);
            Tbl table = (Tbl) tables.get(0);
            // 获取表格中的所有行
            List<Object> rows = getAllElementFromObject(table, Tr.class);

            // 生成文件标题，生成第一行
            Tr headerRow = (Tr) rows.get(0);
            Map<String, Object> headerData = new HashMap<String, Object>();
            headerData.put("BRANCH", this.branchName);
            headerData.put("YEAR", this.date.substring(0, 4));
            headerData.put("MONTH", this.date.substring(4));
            duplicateRowWithReplacement(table, headerRow, headerData);
            table.getContent().remove(headerRow);

            // 重复生成指标集，指标组各行
            String[] NoInChinese = new String[]{"一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"};
            Tr kpiSetRow = (Tr) rows.get(1);
            Tr kpiGroupRow = (Tr) rows.get(2);
            Tr kpiGroupContentRow = (Tr) rows.get(3);
            Tr kpiGroupContentRow2 = (Tr) rows.get(4);
            //Tr kpiGroupCommentRow = (Tr) rows.get(5);

            List<Map> datas = (List<Map>) getSession().getAttribute("datas");

            for (int i = 0; i < datas.size(); i++) {
                // 指标集行
                Map kpiSet = datas.get(i);
                Map<String, Object> kpiSetData = new HashMap<String, Object>();
                kpiSetData.put("KPI_SET_INDEX", NoInChinese[i]);
                kpiSetData.put("KPI_SET_NAME", kpiSet.get("KPI_SET_NAME"));
                duplicateRowWithReplacement(table, kpiSetRow, kpiSetData);

                List<Map> kpiGroupList = (List<Map>) kpiSet.get("KPI_GROUPS");
                for (int j = 0; j < kpiGroupList.size(); j++) {
                    // 指标组行
                    Map kpiGroup = kpiGroupList.get(j);
                    Map<String, Object> kpiGroupData = new HashMap<String, Object>();
                    kpiGroupData.put("KPI_GROUP_INDEX", String.valueOf(j + 1));
                    kpiGroupData.put("KPI_GROUP_NAME", kpiGroup.get("KPI_GROUP_NAME"));
                    duplicateRowWithReplacement(table, kpiGroupRow, kpiGroupData);

                    // 指标组内容行
                    Map<String, Object> kpiGroupContentData = new HashMap<String, Object>();
                    // 图片
                    Inline inline = null;
                    File pic = new File(picFolderPath + "//" + kpiGroup.get("KPI_GROUP_ID") + ".jpg");
                    if (pic.exists()) {
                        BinaryPartAbstractImage imagePart = BinaryPartAbstractImage.createImagePart(
                                template, convertImageToByteArray(
                                        new FileInputStream(pic)));
                        inline = imagePart.createImageInline("Filename hint", "Picture missing", 1, 2, false);
                    }
                    // 文本，由指标组内各个指标描述组成
                    List<Map> kpiList = (List<Map>) kpiGroup.get("KPIS");
                    if (kpiList != null && kpiList.size() > 0) {
                        StringBuilder text = new StringBuilder();
                        for (int k = 0; k < kpiList.size(); k++) {
                            text.append(kpiList.get(k).get("TEXT"));
                        }
                        kpiGroupContentData.put("TEXT", text.toString());
                        kpiGroupContentData.put("图片 1", inline);
                        kpiGroupContentData.put("DATA_SOURCE", MapUtils.getString(kpiGroup, "DATA_SOURCE"));
                        duplicateRowWithReplacement(table, kpiGroupContentRow, kpiGroupContentData);
                    } else {
                        kpiGroupContentData.put("图片 2", inline);
                        kpiGroupContentData.put("DATA_SOURCE", MapUtils.getString(kpiGroup, "DATA_SOURCE"));
                        duplicateRowWithReplacement(table, kpiGroupContentRow2, kpiGroupContentData);
                    }

                    //duplicateRowWithReplacement(table, kpiGroupCommentRow, kpiGroupCommentData);
                }
            }

            table.getContent().remove(headerRow);
            table.getContent().remove(kpiSetRow);
            table.getContent().remove(kpiGroupRow);
            table.getContent().remove(kpiGroupContentRow);
            table.getContent().remove(kpiGroupContentRow2);
            //table.getContent().remove(kpiGroupCommentRow);
            // 保存到临时文件夹
            String tempName = DateUtil.getStandardTimeStamp() + ".doc";
            String path = basePath + "//temp//";
            checkDirExists(path, true);
            template.save(new File(path + tempName));
            getResponse().getWriter().write(tempName);

        } catch (Exception e) {
            e.printStackTrace();
            try {
                getResponse().sendError(500, "生成文件失败");
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        } finally {
            //清理图片文件夹
            File picFolder = new File(picFolderPath);
            if (picFolder.exists() && picFolder.isDirectory())
                for (File temp : picFolder.listFiles())
                    temp.delete();
        }

    }

    private void processGroupData(Map kpiGroup) {
        try {
            kpiGroup.put("KPIS", processGroupKpis(kpiGroup));
            kpiGroup.put("CHART_DATA", new FCCategoryChartProducer(cfg,
                    processChartData(kpiGroup),
                    MapUtils.getString(kpiGroup, "XML_TEMPLATE")).getChartXML().replace("\r\n", ""));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private CategoryChart processChartData(Map kpiGroup, String... args) {
        String year = date.substring(0, 4);
        String _month = date.substring(4);
        String month = _month.startsWith("0") ? _month.substring(1) : _month;
        String kpiGroupId = MapUtils.getString(kpiGroup, "KPI_GROUP_ID");
        CategoryChart chart = new CategoryChart(MapUtils.getIntValue(kpiGroup, "CHART_STYLE_ID"));
        chart.setShowYAxisValues(ChartObject.SWITCH.TRUE.value());
        chart.setCanvasBorderThickness("0");
        chart.setDivLineAlpha("0");
        chart.setShowBorder(ChartObject.SWITCH.TRUE.value());
        chart.setShowYAxisLine(ChartObject.SWITCH.TRUE.value());
        switch (MapUtils.getIntValue(kpiGroup, "CHART_DATA_CODE")) {
            case 1: {            // 单省+全国 多年跨度
                String dates[] = new String[5];
                for (int i = 0; i < 5; i++) {
                    dates[i] = String.valueOf(Integer.valueOf(year) - 4 + i) + _month;
                }
                chart.setSerieNames(new String[]{branchName, "全国"});
                List<Map> data = service.getChartData_1(kpiGroupId, branchId, dates);
                if (data == null || data.isEmpty()) {
                    chart = null;
                    break;
                }
                // 如果没有当月值,页面不展示该条
                boolean hasCurrentMonthData = false;
                for (Map map : data) {
                    if (date.equals(MapUtils.getString(map, "DATA_DATE"))) {
                        hasCurrentMonthData = true;
                        break;
                    }

                }
                if (!hasCurrentMonthData)
                    return null;
                String[] data0 = new String[5];
                String[] data1 = new String[5];
                Arrays.fill(data0, "");
                Arrays.fill(data1, "");
                Set<String> categories = new LinkedHashSet();
                for (Map row : data) {
                    categories.add(MapUtils.getString(row, "DATA_DATE"));
                    if ("13500".equals(MapUtils.getString(row, "BRANCH_ID")))
                        data1[categories.size() - 1] = formatKpiValue(row);
                    else
                        data0[categories.size() - 1] = formatKpiValue(row);
                }
                chart.setDatas(new String[][]{data0, data1});
                StringBuilder caption = new StringBuilder();
                String unitName = MapUtils.getString(data.get(0), "UNIT_NAME", "");
                caption.append(MapUtils.getString(kpiGroup, "KPI_GROUP_NAME"));
                if (!unitName.isEmpty())
                    caption.append("(").append(unitName).append(")");
                caption.append("（").append("1-").append(month).append("月").append("）");
                chart.setCaption(caption.toString());
                chart.setCategoryNames(categories.toArray(new String[categories.size()]));

                break;
            }
            case 2:// 组内+全国 单月
            {
                List<Map> branches = branchService.getBranchsSameGroup(branchId);
                String categories[] = new String[branches.size()];
                String branchIds[] = new String[branches.size()];
                for (int i = 0; i < branches.size(); i++) {
                    branchIds[i] = MapUtils.getString(branches.get(i), "BRANCH_ID");
                    categories[i] = MapUtils.getString(branches.get(i), "BRANCH_NAME");
                }
                chart.setCategoryNames(ArrayUtils.add(categories, "全国"));
                List<Map> data = service.getChartData_2(kpiGroupId, date, ArrayUtils.add(branchIds, "13500"));
                if (data == null || data.isEmpty()) {
                    chart = null;
                    break;
                }
                MultiValueMap multiValueMap = MultiValueMap.decorate(new LinkedHashMap());
                Map<String, String> typeMap = new LinkedHashMap();
                Map<String, String> axisMap = new LinkedHashMap();
                for (Map row : data) {
                    String kpiName = MapUtils.getString(row, "KPI_NAME");
                    String unitName = MapUtils.getString(row, "UNIT_NAME");
                    String unitType = MapUtils.getString(row, "UNIT_TYPE");
                    if ("13500".equals(MapUtils.getString(row, "BRANCH_ID")) && "1".equals(unitType))
                        multiValueMap.put(kpiName + "（" + unitName + "）", "");
                    else
                        multiValueMap.put(kpiName + "（" + unitName + "）", formatKpiValue(row));
                    typeMap.put(kpiName, MapUtils.getString(row, "CHART_TYPE_CODE"));
                    axisMap.put(kpiName, MapUtils.getString(row, "AXIS"));
                }
                chart.setTypes(typeMap.values().toArray(new String[0]));
                chart.setAxisTypes(axisMap.values().toArray(new String[0]));
                chart.setSerieNames((String[]) multiValueMap.keySet().toArray(new String[0]));
                String[][] datas = new String[chart.getSerieNames().length][chart.getCategoryNames().length + 1];
                for (int i = 0; i < chart.getSerieNames().length; i++) {
                    datas[i] = (String[]) multiValueMap.getCollection(chart.getSerieNames()[i]).toArray(new String[0]);
                }
                chart.setDatas(datas);
                StringBuilder caption = new StringBuilder();
                caption.append(MapUtils.getString(kpiGroup, "KPI_GROUP_NAME")).append("（").append(year).append("年1-").append(month).append("月").append("）");
                chart.setCaption(caption.toString());
                break;
            }
            case 3: {// 移动数据流量构成表
                String categories[] = new String[]{"1M以下", "1-10M", "10-30M", "30-50M", "50-100M", "100-150M", "150-200M", "200-500M", "500-1000M", "1000M以上"};
                chart.setCategoryNames(categories);
                chart.setSerieNames(new String[]{branchName, "全国"});
                List<LinkedHashMap> data = service.getChartData_3(new String[]{branchId, "13500"}, date);
                if (data == null || data.isEmpty()) {
                    chart = null;
                    break;
                }
                String[] data0 = new String[10];
                String[] data1 = new String[10];
                for (int i = 0; i < data.size(); i++) {
                    Map row = data.get(i);
                    Set entrySet = row.entrySet();
                    int index = 0;
                    Iterator<Map.Entry> it = entrySet.iterator();
                    it.next();//跳过BRANCH_ID列
                    while (it.hasNext()) {
                        String value = it.next().getValue().toString();
                        if ("13500".equals(MapUtils.getString(row, "BRANCH_ID")))
                            data1[index] = value;
                        else
                            data0[index] = value;
                        index++;
                    }
                }
                chart.setDatas(new String[][]{data0, data1});
                StringBuilder caption = new StringBuilder();
                caption.append(MapUtils.getString(kpiGroup, "KPI_GROUP_NAME")).append("(%)（").append(year).append("年1-").append(month).append("月").append("）");
                chart.setCaption(caption.toString());
                break;
            }
            case 4: {// 4G客户每月净增 201402至今 单省不加全国
                chart.setSerieNames(new String[]{branchName});
                List<LinkedHashMap> data = service.getChartData_4(MapUtils.getString((Map) ((List) kpiGroup.get("KPIS")).get(0), "KPI_ID"), branchId, date);
                // 当前月份没有数据则返回空,页面不展示
                if (data == null || data.isEmpty() || !date.equals(MapUtils.getString(data.get(data.size() - 1), "DATA_DATE"))) {
                    chart = null;
                    break;
                }
                int size = data.size();
                String[] data0 = new String[size];
                String[] months = new String[size];
                for (int i = 0; i < size; i++) {
                    Map row = data.get(i);
                    data0[i] = formatKpiValue(row);
                    months[i] = MapUtils.getString(row, "DATA_DATE");
                }
                chart.setCategoryNames(months);
                chart.setDatas(new String[][]{data0});
                StringBuilder caption = new StringBuilder();
                caption.append(MapUtils.getString(kpiGroup, "KPI_GROUP_NAME")).append("（2014年2月至今）");
                chart.setCaption(caption.toString());
                break;
            }
            case 5: {// 手机上网有效渗透率 单省+全国 单月
                String categories[] = new String[]{branchName, "全国"};
                String branchIds[] = new String[]{branchId, "13500"};
                chart.setCategoryNames(categories);
                List<Map> data = service.getChartData_2(kpiGroupId, date, branchIds);
                if (data == null || data.isEmpty()) {
                    chart = null;
                    break;
                }
                MultiValueMap multiValueMap = MultiValueMap.decorate(new LinkedHashMap());
                Map<String, String> typeMap = new LinkedHashMap();
                Map<String, String> axisMap = new LinkedHashMap();
                for (Map row : data) {
                    String kpiName = MapUtils.getString(row, "KPI_NAME");
                    String unitName = MapUtils.getString(row, "UNIT_NAME");
                    String unitType = MapUtils.getString(row, "UNIT_TYPE");
                    if ("13500".equals(MapUtils.getString(row, "BRANCH_ID")) && "1".equals(unitType))
                        multiValueMap.put(kpiName + "（" + unitName + "）", "");
                    else
                        multiValueMap.put(kpiName + "（" + unitName + "）", formatKpiValue(row));
                    typeMap.put(kpiName, MapUtils.getString(row, "CHART_TYPE_CODE"));
                    axisMap.put(kpiName, MapUtils.getString(row, "AXIS"));
                }
                chart.setTypes(typeMap.values().toArray(new String[0]));
                chart.setAxisTypes(axisMap.values().toArray(new String[0]));
                chart.setSerieNames((String[]) multiValueMap.keySet().toArray(new String[0]));
                String[][] datas = new String[chart.getSerieNames().length][chart.getCategoryNames().length + 1];
                for (int i = 0; i < chart.getSerieNames().length; i++) {
                    datas[i] = (String[]) multiValueMap.getCollection(chart.getSerieNames()[i]).toArray(new String[0]);
                }
                chart.setDatas(datas);
                StringBuilder caption = new StringBuilder();
                caption.append(MapUtils.getString(kpiGroup, "KPI_GROUP_NAME")).append("（").append(year).append("年1-").append(month).append("月").append("）");
                chart.setCaption(caption.toString());
                break;
            }
        }
        return chart;
    }

    private List processGroupKpis(Map kpiGroup) {
        List<Map> kpis = service.getMarkeyAnalysisKpisByGroup(kpiGroup);
        String year = date.substring(0, 4);
        String _month = date.substring(4);
        String month = _month.startsWith("0") ? _month.substring(1) : _month;
        if (kpis != null) {
            for (int i = 0; i < kpis.size(); i++) {
                Map kpi = kpis.get(i);
                Map currentValue = service.getMarketAnalysisKpiValueByBranchMonth(kpi.get("KPI_ID").toString(), branchId, date);
                if (currentValue == null || currentValue.isEmpty()) {
                    kpis.remove(i--);
                    continue;
                }
                Map currentNationValue = service.getMarketAnalysisKpiValueByBranchMonth(kpi.get("KPI_ID").toString(), "13500", date);
                Map lastYearValue = service.getMarketAnalysisKpiValueByBranchMonth(kpi.get("KPI_ID").toString(), branchId, getMonthLastYear(date));
                // 生成text
                String multiple = MapUtils.getString(currentValue, "UNIT_MULTIPLE");
                String format = MapUtils.getString(currentValue, "PRECISIONS_FORMAT");

                String unit = MapUtils.getString(currentValue, "UNIT_NAME");
                String unitX = "%".equals(unit) ? "pp" : unit;

                String kpiValue = formatKpiValue(currentValue);
                String kpiValue_lastYear = formatKpiValue(lastYearValue);
                String kpiValueNation = formatKpiValue(currentNationValue);

                String kpiRank = MapUtils.getString(currentValue, "KPI_RANK", "-");
                String kpiRank_lastYear = MapUtils.getString(lastYearValue, "KPI_RANK", "-");

                String kpiGroupRank = MapUtils.getString(currentValue, "KPI_GROUP_RANK", "-");
                String kpiGroupRank_lastYear = MapUtils.getString(lastYearValue, "KPI_GROUP_RANK", "-");

                Map variable = new HashMap();
                variable.put("BRANCH_NAME", branchName);
                variable.put("PERIOD", year.concat("年").concat("1-").concat(month).concat("月"));
                variable.put("KPI_NAME", MapUtils.getString(kpi, "KPI_NAME"));
                variable.put("UNIT", unit);
                variable.put("UNITX", unitX);
                variable.put("KPI_VALUE", kpiValue);
                variable.put("KPI_VALUE_LAST_YEAR", kpiValue_lastYear);
                variable.put("KPI_VALUE_VARIETY", minus(kpiValue, kpiValue_lastYear, multiple, format));
                variable.put("KPI_VALUE_NATION_VARIETY", minus(kpiValue, kpiValueNation, multiple, format));
                variable.put("KPI_RANK", kpiRank);
                variable.put("KPI_RANK_LAST_YEAR", kpiRank_lastYear);
                variable.put("KPI_GROUP_RANK", kpiGroupRank);
                variable.put("KPI_GROUP_RANK_LAST_YEAR", kpiGroupRank_lastYear);
                variable.put("KPI_RANK_VARIETY", minus(kpiRank, kpiRank_lastYear, null, null));
                variable.put("KPI_GROUP_RANK_VARIETY", minus(kpiGroupRank, kpiGroupRank_lastYear, null, null));

                //年累计收入份额:移动55.35%（去年同期55.33%，变化0.02pp），全国排名第15位（去年同期第20位），组内排名第1位（去年同期第2位）。
                String text_template = MapUtils.getString(kpi, "TEXT_TEMPLATE");
                String text = FreemarkerUtil.stringReplace(text_template, variable);
                kpi.put("TEXT", text == null ? "" : text);
            }
        }
        return kpis;
    }

    private double minus(String value1, String value2, String multiple, String format) {
        if (value1 == null || value2 == null || value1.isEmpty() || value2.isEmpty() || "-".equals(value1) || "-".equals(value2))
            return Double.NaN;
        BigDecimal result = new BigDecimal(value1).subtract(new BigDecimal(value2));
//        if (multiple != null && !multiple.isEmpty())
//            result = result.divide(new BigDecimal(multiple));
//        if (format != null && !format.isEmpty()) {
//            return new DecimalFormat(format).format(result);
//        }
        return result.doubleValue();
    }

    // 根据配置格式化KPI值
    private String formatKpiValue(Map kpiValue) {
        String value = MapUtils.getString(kpiValue, "KPI_VALUE", "");
        String divisor = MapUtils.getString(kpiValue, "UNIT_MULTIPLE", "");
        String formatStr = MapUtils.getString(kpiValue, "PRECISIONS_FORMAT", "");

        if (value.isEmpty() || divisor.isEmpty() || formatStr.isEmpty()) {
            return "-";
        }
        BigDecimal result = new BigDecimal(value).divide(new BigDecimal(divisor));
        DecimalFormat format = new DecimalFormat(formatStr);
        return format.format(result);
    }


    private static List<Object> getAllElementFromObject(Object obj, Class<?> toSearch) {
        List<Object> result = new ArrayList<Object>();
        if (obj instanceof JAXBElement) obj = ((JAXBElement<?>) obj).getValue();
        if (obj.getClass() == toSearch)
            result.add(obj);
        else if (obj instanceof ContentAccessor) {
            List<?> children = ((ContentAccessor) obj).getContent();
            for (Object child : children) {
                result.addAll(getAllElementFromObject(child, toSearch));
            }

        }
        return result;
    }

    private static void duplicateRowWithReplacement(Tbl reviewTable, Tr templateRow, Map<String, Object> replacements) {
        Tr workingRow = XmlUtils.deepCopy(templateRow);
        if (replacements != null) {
            List<?> RElements = getAllElementFromObject(workingRow, R.class);
            for (R r : (List<R>) RElements) {
                List content = r.getContent();
                for (int i = 0; i < content.size(); i++) {
                    Object object = content.get(i);
                    if (object instanceof JAXBElement) {
                        Object temp = ((JAXBElement) object).getValue();
                        if (temp instanceof Text) {
                            Text text = (Text) temp;
                            String replacementValue = (String) replacements.get(text.getValue());
                            if (replacementValue != null) {
                                if (replacementValue.indexOf("\n") == -1) {
                                    text.setValue(replacementValue);
                                } else {
                                    String[] _replacementValue = replacementValue.split("\n");
                                    text.setValue(_replacementValue[0]);
                                    for (int j = 1; j < _replacementValue.length; j++) {
                                        content.add(new Br());
                                        Text _text = new Text();
                                        _text.setSpace(text.getSpace());
                                        _text.setParent(r);
                                        _text.setValue(_replacementValue[j]);
                                        content.add(_text);
                                        i += 2;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            List<?> drawElements = getAllElementFromObject(workingRow, Drawing.class);
            for (Object object : drawElements) {
                Drawing draw = (Drawing) object;
                Inline inline = (Inline) draw.getAnchorOrInline().get(0);
                String name = inline.getDocPr().getName();
                Inline replacementValue = (Inline) replacements.get(name);
                if (replacementValue != null) {
                    inline.setGraphic(replacementValue.getGraphic());
                } else
                    workingRow = null;
            }
        }
        reviewTable.getContent().add(workingRow);
    }

    /**
     * 将图片从文件对象转换成字节数组.
     *
     * @return 包含图片字节数据的字节数组
     * @throws FileNotFoundException
     * @throws IOException
     */
    private static byte[] convertImageToByteArray(InputStream inputStream) throws IOException {
        BufferedInputStream bufferedInputStream = new BufferedInputStream(inputStream);
        byte[] result = new byte[1024 * 1024];
        byte[] bytes = new byte[1024];
        int position = 0;
        while (bufferedInputStream.read(bytes) != -1) {
            System.arraycopy(bytes, 0, result, position, 1024);
            position += bytes.length;
        }
        bufferedInputStream.close();
        inputStream.close();
        return Arrays.copyOfRange(result, 0, position);
    }

    // 获取去年本月
    private String getMonthLastYear(String month) {
        return Integer.valueOf(month.substring(0, 4)) - 1 + month.substring(4);
    }

    private boolean checkDirExists(String path, boolean mkdir) {
        File file = new File(path);
        if (!file.exists() && mkdir)
            return file.mkdirs();
        return true;
    }

    public String getBranchId() {
        return branchId;
    }

    public void setBranchId(String branchId) {
        this.branchId = branchId;
    }

    @Override
    public MarketAnalysisService getService() {
        return service;
    }

    public void setService(MarketAnalysisService service) {
        this.service = service;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

}
