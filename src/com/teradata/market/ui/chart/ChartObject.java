package com.teradata.market.ui.chart;

/**
 * 基本Chart对象，Chart对象是对FusionChart和JFreeChart共同属性的抽象，
 * 提供了一种组件独立的chart结构，可方便转换为以上两种，也方便支持以后转换为其他组件
 */
public class ChartObject {
    public enum SWITCH{
        TRUE("1"),FALSE("0");
        private String value;
        SWITCH(String value){
            this.value = value;
        }
        public String value(){
            return this.value;
        }
    }
    public static final int CHART_STYLE_METER = 0;//CeWolf FusionChart
    public static final int CHART_STYLE_LINE = 1;//CeWolf
    public static final int CHART_STYLE_DOTLINE = 2;//CeWolf FusionChart
    public static final int CHART_STYLE_BAR_2D = 3;//CeWolf FusionChart
    public static final int CHART_STYLE_BAR_3D = 4;//CeWolf
    public static final int CHART_STYLE_PIE_2D = 5;//CeWolf FusionChart
    public static final int CHART_STYLE_PIE_3D = 6;
    public static final int CHART_STYLE_SBAR_2D = 7;//CeWolf
    public static final int CHART_STYLE_SBAR_3D = 8;//CeWolf FusionChart
    public static final int CHART_STYLE_HORIZONTAL_BAR_2D = 9;//CeWolf FusionChart
    public static final int CHART_STYLE_HORIZONTAL_BAR_3D = 10;//CeWolf FusionChart
    public static final int CHART_STYLE_HORIZONTAL_SBAR_2D = 11;//CeWolf FusionChart
    public static final int CHART_STYLE_HORIZONTAL_SBAR_3D = 12;
    public static final int CHART_STYLE_BAR_2D_DOTLINE = 13;//CeWolf FusionChart
    public static final int CHART_STYLE_BAR_3D_DOTLINE = 14;//CeWolf FusionChart
    public static final int CHART_STYLE_DOTLINE_AND_DOTLINE = 15;//CeWolf FusionChart
    public static final int CHART_STYLE_COMBINATION_2D = 16;//FusionChart
    public static final int CHART_STYLE_COMBINATION_3D = 17;//FusionChart


    /**
     * 图表类型
     */
    protected int chartStyle;

    /**
     * 是否显示图列
     */
    protected boolean showLegend;

    /**
     * 标题
     */
    protected String caption;
    /**
     * 子标题
     */
    protected String subCaption;
    /**
     * 宽度
     */
    protected int width;
    /**
     * 高度
     */
    protected int height;
    
    protected String fullCaption;

    /**
     * 构造函数
     * @param chartStyle 类型
     */
    public ChartObject(int chartStyle) {
        this.chartStyle = chartStyle;
        this.showLegend = true;
        this.caption = "";
        this.subCaption = "";
        this.width = 200;
        this.height = 150;
        this.fullCaption = "";
    }

    /**
     * @return Returns the chartStyle.
     */
    public int getChartStyle() {
        return chartStyle;
    }

    /**
     * @param chartStyle The chartStyle to set.
     */
    public void setChartType(int chartStyle) {
        this.chartStyle = chartStyle;
    }

    /**
     * @return Returns the showLegend.
     */
    public boolean isShowLegend() {
        return showLegend;
    }

    /**
     * @param showLegend The showLegend to set.
     */
    public void setShowLegend(boolean showLegend) {
        this.showLegend = showLegend;
    }

    /**
     * @return Returns the caption.
     */
    public String getCaption() {
        return caption;
    }

    /**
     * @param caption The caption to set.
     */
    public void setCaption(String caption) {
        this.caption = caption;
    }

    /**
     * @return Returns the subCaption.
     */
    public String getSubCaption() {
        return subCaption;
    }

    /**
     * @param subCaption The subCaption to set.
     */
    public void setSubCaption(String subCaption) {
        this.subCaption = subCaption;
    }

    /**
     * @return Returns the width.
     */
    public int getWidth() {
        return width;
    }

    /**
     * @param width The width to set.
     */
    public void setWidth(int width) {
        this.width = width;
    }

    /**
     * @return Returns the height.
     */
    public int getHeight() {
        return height;
    }

    /**
     * @param height The height to set.
     */
    public void setHeight(int height) {
        this.height = height;
    }

    /**
     * @return Returns the fullCaption.
     */
    public String getFullCaption() {
        return fullCaption;
    }

    /**
     * @param fullCaption The fullCaption to set.
     */
    public void setFullCaption(String fullCaption) {
        this.fullCaption = fullCaption;
    }

}
