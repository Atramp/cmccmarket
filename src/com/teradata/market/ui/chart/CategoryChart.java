package com.teradata.market.ui.chart;

import com.teradata.adf.core.util.ConfigUtil;


/**
 * Category图对象，可用于线图，条形图，饼图等
 */
public class CategoryChart extends ChartObject {

    /**
     * X轴名称
     */
    protected String axisNameX;
    
    /**
     * Y轴名称
     */
    protected String axisNameY;
    
    /**
     * 右边Y轴名称，用于支持双轴图
     */
    protected String axisNameYS;

    /**
     * 序列名称，支持多序列图
     */
    protected String[] serieNames;
  
  /**
   * 序列显示类型，支持多序列图，序列可显示为Bar、Line、Area等形式
   */
  protected String[] seriesTypes;

    /**
     * category名称，显示于x轴
     */
    protected String[] categoryNames;

    /**
     * 提示，每个category一个
     */
    protected String[] categoryTips;
    protected String[][] categoryTipsMulti;

    /**
     * 数据
     */
    protected Object[][] datas;
    
    protected String[] types;

    /**
     * 数据的详细信息连接url
     */
    protected String[][] links;

    /**
     * 限制显示个数
     */
    protected int limit;

    /**
     * 颜色数组
     */
    protected String[] colors;
    
    /**
     * 颜色板
     */
    protected String colorpalette;
    
    /**
     * Y轴数字前缀
     */
    protected String numberPrefix = "";
    
    /**
     * Y轴数字后缀
     */
    protected String numberSuffix = "";
    
    /**
     * X轴数字前缀
     */
    protected String sNumberPrefix = "";
    
    /**
     * X轴数字后缀
     */
    protected String sNumberSuffix = "";
    
    /**
     * 模板文件名称
     */
    protected String template = "";
    
    /**
     * FLASH文件名称
     */
    protected String flashFile = "";
    
    /**
     * 是否是双轴图
     */
    protected String doubleYAxisFlag = "0";

    protected String showValues = "1";

    protected String showBorder = "1";

    protected String canvasBorderThickness = "1";

    protected String showYAxisValues = "1";

    protected String divLineAlpha = "100";

    protected String showYAxisLine = "0";
    
    /**
     * @return the doubleYAxisFlag
     */
    public String getDoubleYAxisFlag() {
        return doubleYAxisFlag;
    }

    /**
     * @param doubleYAxisFlag the doubleYAxisFlag to set
     */
    public void setDoubleYAxisFlag(String doubleYAxisFlag) {
        this.doubleYAxisFlag = doubleYAxisFlag;
    }

    /**
     * @return the template
     */
    public String getTemplate() {
        return template;
    }

    /**
     * @param template the template to set
     */
    public void setTemplate(String template) {
        this.template = template;
    }

    /**
     * @return the flashFile
     */
    public String getFlashFile() {
        return flashFile;
    }

    /**
     * @param flashFile the flashFile to set
     */
    public void setFlashFile(String flashFile) {
        this.flashFile = flashFile;
    }

    /**
     * @return the colorpalette
     */
    public String getColorpalette() {
        return colorpalette;
    }
    
    /**
     * @param colorpalette the colorpalette to set
     */
    public void setColorpalette(String colorpalette) {
        this.colorpalette = colorpalette;
    }

    /**
     * 轴类型
     */
    protected String[] axisTypes;
  
  /**
   * 目标值，显示为一根水平线
   */
  protected String targetValue = "N/A";
  
  /**
   * 目标值颜色，显示为一根水平线
   */
  protected String targetColor = "#FF0000";  
  
  /**
   * 目标值显示标签
   */
  protected String targetLabel = targetValue;  

    public CategoryChart(int chartStyle) {
        super(chartStyle);
        this.axisNameX = "";
        this.axisNameY = "";
        this.axisNameYS = "";
        this.limit = -1;
        //预设颜色值：40 colors
        this.colors = new String[] { "0099FF", "AA6600", "FF66CC",
                "6600FF", "7C7CB4", "99AA00", "66AAFF", "FF6600",
                "006666", "33FF66", "FFFF00", "804040", "FF8040",
                "00FF00", "008080", "004080", "8080FF", "800040",
                "FF0080", "808080", "FF8000", "C0C0C0", "008040",
                "0000FF", "0000A0", "800080", "8000FF", "400000",
                "804000", "004000", "000080", "400040", "FF8080",
                "FFFF80", "80FF80", "0080FF", "FF80C0", "800000",
                "008000", "808000" };

        this.colorpalette = ConfigUtil.getConfiguration().getString("chart.colorpalette");
        if(colorpalette != null){
            colorpalette = colorpalette.replace(":", ",");
            this.colors = colorpalette.split(",");
        }else{
            //设置预设颜色值
            colorpalette = "0099FF, AA6600, FF66CC," +
                "6600FF, 7C7CB4, 99AA00, 66AAFF, FF6600," +
                "006666, 33FF66, FFFF00, 804040, FF8040," +
                "00FF00, 008080, 004080, 8080FF, 800040," +
                "FF0080, 808080, FF8000, C0C0C0, 008040," +
                "0000FF, 0000A0, 800080, 8000FF, 400000," +
                "804000, 004000, 000080, 400040, FF8080," +
                "FFFF80, 80FF80, 0080FF, FF80C0, 800000," +
                "008000, 808000";
        }
        
        //获取配置文件中双轴图的图形样式值
        String doubleYAxisChartStyles = ConfigUtil.getConfiguration().getString("chart.doubleYAxisChartStyles");
        //对于属于双轴图的图形样式设置双轴图标志
        if(doubleYAxisChartStyles != null && doubleYAxisChartStyles.length() > 0){
            String[] charts = doubleYAxisChartStyles.split(":");
            for(int i=0; i<charts.length; i++){
                if(charts[i].equals(String.valueOf(chartStyle))){
                    this.setDoubleYAxisFlag("1");
                    break;
                }
            }
        }
        
    }

    public String[] getCategoryNames() {
        return categoryNames;
    }

    public void setCategoryNames(String[] categoryNames) {
        this.categoryNames = categoryNames;
    }

    public Object[][] getDatas() {
        return datas;
    }

    public void setDatas(Object[][] datas) {
        this.datas = datas;
    }

    public String[][] getLinks() {
        return links;
    }

    public void setLinks(String[][] links) {
        this.links = links;
    }

    public String[] getSerieNames() {
        return serieNames;
    }

    public void setSerieNames(String[] serieNames) {
        this.serieNames = serieNames;
    }

    public String[][] getCategoryTipsMulti() {
        return categoryTipsMulti;
    }
    public String[] getCategoryTips() {
        return categoryTips;
    }

    public void setCategoryTips(String[] categoryTips) {
        this.categoryTips = categoryTips;
    }
    
    public void setCategoryTipsMulti(String[][] categoryTipsMulti) {
        this.categoryTipsMulti = categoryTipsMulti;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public String[] getColors() {
        return colors;
    }

    public void setColors(String[] colors) {
        this.colors = colors;
    }

    public String[] getAxisTypes() {
        return axisTypes;
    }

    public void setAxisTypes(String[] axisTypes) {
        this.axisTypes = axisTypes;
    }

    public String getAxisNameX() {
        return axisNameX;
    }

    public void setAxisNameX(String axisNameX) {
        this.axisNameX = axisNameX;
    }

    public String getAxisNameY() {
        return axisNameY;
    }

    public void setAxisNameY(String axisNameY) {
        this.axisNameY = axisNameY;
    }

    public String getAxisNameYS() {
        return axisNameYS;
    }

    public void setAxisNameYS(String axisNameYS) {
        this.axisNameYS = axisNameYS;
    }

    /**
     * 获取Category图形对象。
     * 
     * @return Category图形对象数组
     */
    public CategoryChart[] getChartObjects(){
        CategoryChart chartObjectY = new CategoryChart(this.chartStyle);
        chartObjectY.setAxisNameX(this.axisNameX);
        chartObjectY.setAxisNameY(this.axisNameY);
        chartObjectY.setAxisNameYS(this.axisNameYS);
        chartObjectY.setCaption(this.caption);
        chartObjectY.setCategoryNames(this.categoryNames);
        chartObjectY.setCategoryTips(this.categoryTips);
        chartObjectY.setColors(this.colors);
        chartObjectY.setHeight(this.height);
        chartObjectY.setLimit(this.limit);
        chartObjectY.setLinks(this.links);
        chartObjectY.setShowLegend(this.showLegend);
        chartObjectY.setSubCaption(this.subCaption);
        chartObjectY.setWidth(this.width);
        
        CategoryChart chartObjectYS = new CategoryChart(this.chartStyle);
        chartObjectYS.setAxisNameX(this.axisNameX);
        chartObjectYS.setAxisNameY(this.axisNameY);
        chartObjectYS.setAxisNameYS(this.axisNameYS);
        chartObjectYS.setCaption(this.caption);
        chartObjectYS.setCategoryNames(this.categoryNames);
        chartObjectYS.setCategoryTips(this.categoryTips);
        chartObjectYS.setColors(this.colors);
        chartObjectYS.setHeight(this.height);
        chartObjectYS.setLimit(this.limit);
        chartObjectYS.setLinks(this.links);
        chartObjectYS.setShowLegend(this.showLegend);
        chartObjectYS.setSubCaption(this.subCaption);
        chartObjectYS.setWidth(this.width);        
        
        int countY = 0;
        int countYS = 0;
        
        for (int i=0; i<axisTypes.length; i++){
            if("P".equalsIgnoreCase(axisTypes[i]))
                countY++;
            else if("S".equalsIgnoreCase(axisTypes[i]))
                countYS++;
        }
        
        String[][] datasY = new String[countY][categoryNames.length]; 
        String[][] datasYS = new String[countYS][categoryNames.length]; 
        String[] axisTypesY = new String[countY];
        String[] axisTypesYS = new String[countYS];        
        String[] serieNamesY = new String[countY];
        String[] serieNamesYS = new String[countYS];
        
        countY = 0;
        countYS = 0;
        
        for(int i=0; i<axisTypes.length; i++){
            if("P".equalsIgnoreCase(axisTypes[i])){
                datasY[countY] = (String[])this.datas[i];
                serieNamesY[countY] = this.serieNames[i];
                axisTypesY[countY] = this.axisTypes[i];
                countY++;
            }
            else if("S".equalsIgnoreCase(axisTypes[i])){
                datasYS[countYS] = (String[])this.datas[i];
                serieNamesYS[countYS] = this.serieNames[i];
                axisTypesYS[countYS] = this.axisTypes[i];
                countYS++;
            }
        }
        
        String[][] datasAll = new String[serieNames.length][categoryNames.length];
        String[] serieNamesAll = new String[serieNames.length];
        int countAll = 0;
        for(int i=0; i<axisTypes.length; i++){
            if("P".equalsIgnoreCase(axisTypes[i])){
                datasAll[countAll] = (String[])this.datas[i];
                countAll++;
            }
        }
        for(int i=0; i<axisTypes.length; i++){
            if("S".equalsIgnoreCase(axisTypes[i])){
                datasAll[countAll] = (String[])this.datas[i];
                countAll++;
            }
        }
        
        chartObjectY.setDatas(datasY);
        chartObjectY.setSerieNames(serieNamesY);
        chartObjectY.setAxisTypes(axisTypesY);
    
        chartObjectYS.setDatas(datasYS);
        chartObjectYS.setSerieNames(serieNamesYS);
        chartObjectYS.setAxisTypes(axisTypesYS);
        
        this.setDatas(datasAll);
        
        CategoryChart[] chartObjects = new CategoryChart[3];
        chartObjects[0] = chartObjectY;
        chartObjects[1] = chartObjectYS;
        chartObjects[2] = this;
        
        return chartObjects;
    }

  /**
   * @return Returns the serieTypes.
   */
  public String[] getSeriesTypes() {
    return seriesTypes;
  }

  /**
   * @param serieTypes The serieTypes to set.
   */
  public void setSeriesTypes(String[] seriesTypes) {
    this.seriesTypes = seriesTypes;
  }

  /**
   * @return Returns the targetValue.
   */
  public String getTargetValue() {
    return targetValue;
  }

  /**
   * @param targetValue The targetValue to set.
   */
  public void setTargetValue(String targetValue) {
    this.targetValue = targetValue;
  }

  /**
   * @return Returns the targetColor.
   */
  public String getTargetColor() {
    return targetColor;
  }

  /**
   * @param targetColor The targetColor to set.
   */
  public void setTargetColor(String targetColor) {
    this.targetColor = targetColor;
  }

  /**
   * @return Returns the targetLabel.
   */
  public String getTargetLabel() {
    return targetLabel;
  }

  /**
   * @param targetLabel The targetLabel to set.
   */
  public void setTargetLabel(String targetLabel) {
    this.targetLabel = targetLabel;
  }
  protected String chartProperties = "";

    /**
     * @return Returns the chartProperties.
     */
    public String getChartProperties() {
        return chartProperties;
    }

    /**
     * @param chartProperties
     *            The chartProperties to set.
     */
    public void setChartProperties(String chartProperties) {
        this.chartProperties = chartProperties;
    }

    /**
     * @return the numberPrefix
     */
    public String getNumberPrefix() {
        return numberPrefix;
    }

    /**
     * @param numberPrefix the numberPrefix to set
     */
    public void setNumberPrefix(String numberPrefix) {
        this.numberPrefix = numberPrefix;
    }

    /**
     * @return the sNumberSuffix
     */
    public String getsNumberSuffix() {
        return sNumberSuffix;
    }

    /**
     * @param sNumberSuffix the sNumberSuffix to set
     */
    public void setsNumberSuffix(String sNumberSuffix) {
        this.sNumberSuffix = sNumberSuffix;
    }

    /**
     * @return the types
     */
    public String[] getTypes() {
        return types;
    }

    /**
     * @param types the types to set
     */
    public void setTypes(String[] types) {
        this.types = types;
    }

    /**
     * @return the numberSuffix
     */
    public String getNumberSuffix() {
        return numberSuffix;
    }

    /**
     * @param numberSuffix the numberSuffix to set
     */
    public void setNumberSuffix(String numberSuffix) {
        this.numberSuffix = numberSuffix;
    }

    /**
     * @return the sNumberPrefix
     */
    public String getsNumberPrefix() {
        return sNumberPrefix;
    }

    /**
     * @param sNumberPrefix the sNumberPrefix to set
     */
    public void setsNumberPrefix(String sNumberPrefix) {
        this.sNumberPrefix = sNumberPrefix;
    }

    public String getShowValues() {
        return showValues;
    }

    public void setShowValues(String showValues) {
        this.showValues = showValues;
    }

    public String getShowBorder() {
        return showBorder;
    }

    public void setShowBorder(String showBorder) {
        this.showBorder = showBorder;
    }

    public String getCanvasBorderThickness() {
        return canvasBorderThickness;
    }

    public void setCanvasBorderThickness(String canvasBorderThickness) {
        this.canvasBorderThickness = canvasBorderThickness;
    }

    public String getShowYAxisValues() {
        return showYAxisValues;
    }

    public void setShowYAxisValues(String showYAxisValues) {
        this.showYAxisValues = showYAxisValues;
    }

    public String getDivLineAlpha() {
        return divLineAlpha;
    }

    public void setDivLineAlpha(String divLineAlpha) {
        this.divLineAlpha = divLineAlpha;
    }

    public String getShowYAxisLine() {
        return showYAxisLine;
    }

    public void setShowYAxisLine(String showYAxisLine) {
        this.showYAxisLine = showYAxisLine;
    }
}
