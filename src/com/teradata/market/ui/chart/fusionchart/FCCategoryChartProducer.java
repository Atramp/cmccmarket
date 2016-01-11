package com.teradata.market.ui.chart.fusionchart;

import java.io.StringWriter;

import com.teradata.market.ui.chart.CategoryChart;
import com.teradata.market.ui.chart.ChartObject;

import freemarker.template.Configuration;
import freemarker.template.Template;
import org.apache.commons.lang.StringUtils;

/**
 * 将Chart对象转换为FushinChart需要的xml串
 */
public class FCCategoryChartProducer {

    /**
     * FreeMarker的配置对象
     */
    private Configuration cfg;
    /**
     * Chart对象
     */
    private CategoryChart chart;
    /**
     * 转换模板，FreeMarker模板
     */
    private String template;

    public FCCategoryChartProducer(Configuration cfg, CategoryChart chart) {
        this(cfg, chart, null);
        this.template = getChartTemplate();
    }

    public FCCategoryChartProducer(Configuration cfg, CategoryChart chart, String template) {
        this.cfg = cfg;
        this.chart = chart;

        //依以下顺序确认模板
        //1.指定模板
        //2.图形对象所带模板
        //3.图形样式的默认模板
        if (template != null && template.length() > 0)
            this.template = template;
        else if (null != chart.getTemplate() && chart.getTemplate().length() > 0)
            this.template = chart.getTemplate();
        else
            this.template = getChartTemplate();
    }

    public CategoryChart getChart() {
        return chart;
    }

    public String getChartFlash() {
        switch (chart.getChartStyle()) {
            case ChartObject.CHART_STYLE_LINE:
                return "MSLine";
            case ChartObject.CHART_STYLE_DOTLINE:
                return "MSLine";
            case ChartObject.CHART_STYLE_BAR_2D:
                return "MSColumn2D";
            case ChartObject.CHART_STYLE_BAR_3D:
                return "MSColumn3D";
            case ChartObject.CHART_STYLE_PIE_2D:
                return "Pie2D";
            case ChartObject.CHART_STYLE_PIE_3D:
                return "Pie3D";
            case ChartObject.CHART_STYLE_SBAR_2D:
                return "StackedColumn2D";
            case ChartObject.CHART_STYLE_SBAR_3D:
                return "StackedColumn3D";
            case ChartObject.CHART_STYLE_HORIZONTAL_BAR_2D:
                return "MSBar2D";
            case ChartObject.CHART_STYLE_HORIZONTAL_BAR_3D:
                return "MSBar3D";
            case ChartObject.CHART_STYLE_HORIZONTAL_SBAR_2D:
                return "StackedBar2D";
            case ChartObject.CHART_STYLE_HORIZONTAL_SBAR_3D:
                return "StackedBar3D";
            case ChartObject.CHART_STYLE_BAR_2D_DOTLINE:
                return "MSCombiDY2D";
            case ChartObject.CHART_STYLE_BAR_3D_DOTLINE:
                return "MSColumn3DLineDY";
            case ChartObject.CHART_STYLE_DOTLINE_AND_DOTLINE:
                return "MSCombiDY2D";
            case ChartObject.CHART_STYLE_COMBINATION_2D:
                return "MSCombi2D";
            case ChartObject.CHART_STYLE_COMBINATION_3D:
                return "MSCombi3D";

            default:
                return "MultiAxesLine";
        }
    }

    /**
     * 获取对应的FLASH文件（含路径）。
     *
     * @param chartDepository
     * @return
     */
    public String getChartFilePath(String chartDepository) {
        if (null != chart.getFlashFile() && chart.getFlashFile().length() > 0)
            return chartDepository + chart.getFlashFile();
        else
            return chartDepository + getChartFlash() + ".swf";
    }

    public String getChartXML() {
        return getChartXML(this.template);
    }

    public String getChartXML(String template) {
        if (StringUtils.isEmpty(template) || chart == null)
            return "";

        StringWriter out = new StringWriter();
        try {
            Template temp = cfg.getTemplate(template);
            temp.process(chart, out);
            out.flush();
            return out.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 根据图形对象的类型，获取模板文件名称
     *
     * @return
     */
    public String getChartTemplate() {
        switch (chart.getChartStyle()) {
            case ChartObject.CHART_STYLE_LINE:
                return "template_line.ftl";
            case ChartObject.CHART_STYLE_DOTLINE:
                return "template_dotline.ftl";
            case ChartObject.CHART_STYLE_BAR_2D:
                return "template_bar_2d.ftl";
            case ChartObject.CHART_STYLE_BAR_3D:
                return "template_bar_3d.ftl";
            case ChartObject.CHART_STYLE_PIE_2D:
                return "template_pie_2d.ftl";
            case ChartObject.CHART_STYLE_PIE_3D:
                return "template_pie_3d.ftl";
            case ChartObject.CHART_STYLE_SBAR_2D:
                return "template_sbar_2d.ftl";
            case ChartObject.CHART_STYLE_SBAR_3D:
                return "template_sbar_3d.ftl";
            case ChartObject.CHART_STYLE_HORIZONTAL_BAR_2D:
                return "template_hbar_2d.ftl";
            case ChartObject.CHART_STYLE_HORIZONTAL_BAR_3D:
                return "template_hbar_3d.ftl";
            case ChartObject.CHART_STYLE_HORIZONTAL_SBAR_2D:
                return "template_hsbar_2d.ftl";
            case ChartObject.CHART_STYLE_HORIZONTAL_SBAR_3D:
                return "template_hsbar_3d.ftl";
            case ChartObject.CHART_STYLE_BAR_2D_DOTLINE:
                return "template_dy_bar_2d_dotline.ftl";
            case ChartObject.CHART_STYLE_BAR_3D_DOTLINE:
                return "template_dy_bar_3d_dotline.ftl";
            case ChartObject.CHART_STYLE_DOTLINE_AND_DOTLINE:
                return "template_dy_dotline_dotline.ftl";
            case ChartObject.CHART_STYLE_COMBINATION_2D:
                return "template_combi_2d.ftl";
            case ChartObject.CHART_STYLE_COMBINATION_3D:
                return "template_combi_3d.ftl";

            default:
                return "template_my_dotline.ftl";
        }
    }

    /**
     * @return Returns the template.
     */
    public String getTemplate() {
        return template;
    }

    /**
     * @param template The template to set.
     */
    public void setTemplate(String template) {
        this.template = template;
    }

}
