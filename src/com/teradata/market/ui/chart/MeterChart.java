package com.teradata.market.ui.chart;

/**
 * MeterChart，用于仪表盘。
 */
public class MeterChart extends ChartObject {

    /**
     * 左边界
     */
    protected String lowerLimit;
    /**
     * 右边界
     */
    protected String upperLimit;

    /**
     * 灯值
     */
    protected String bulbValue;
    /**
     * 灯的显示区间
     */
    protected String[][] bulbRange;
    /**
     * 灯的颜色，每个显示区间一个
     */
    protected String[] bulbColorId;

    /**
     * 仪表值
     */
    protected String meterValue;
    /**
     * 刻度区间
     */
    protected String[][] meterRange;
    /**
     * 区间颜色，每个区间一个
     */
    protected String[] meterColorId;

    /**
     * 构造函数。
     */
    public MeterChart() {
        super(ChartObject.CHART_STYLE_METER);
    }

    /**
     * @return Returns the lowerLimit.
     */
    public String getLowerLimit() {
        return lowerLimit;
    }

    /**
     * @param lowerLimit The lowerLimit to set.
     */
    public void setLowerLimit(String lowerLimit) {
        this.lowerLimit = lowerLimit;
    }

    /**
     * @return Returns the upperLimit.
     */
    public String getUpperLimit() {
        return upperLimit;
    }

    /**
     * @param upperLimit The upperLimit to set.
     */
    public void setUpperLimit(String upperLimit) {
        this.upperLimit = upperLimit;
    }

    /**
     * @return Returns the bulbValue.
     */
    public String getBulbValue() {
        return bulbValue;
    }

    /**
     * @param bulbValue The bulbValue to set.
     */
    public void setBulbValue(String bulbValue) {
        this.bulbValue = bulbValue;
    }

    /**
     * @return Returns the bulbRange.
     */
    public String[][] getBulbRange() {
        return bulbRange;
    }

    /**
     * @param bulbRange The bulbRange to set.
     */
    public void setBulbRange(String[][] bulbRange) {
        this.bulbRange = bulbRange;
    }

    /**
     * @return Returns the bulbColorId.
     */
    public String[] getBulbColorId() {
        return bulbColorId;
    }

    /**
     * @param bulbColorId The bulbColorId to set.
     */
    public void setBulbColorId(String[] bulbColorId) {
        this.bulbColorId = bulbColorId;
    }

    /**
     * @return Returns the meterValue.
     */
    public String getMeterValue() {
        return meterValue;
    }

    /**
     * @param meterValue The meterValue to set.
     */
    public void setMeterValue(String meterValue) {
        this.meterValue = meterValue;
    }

    /**
     * @return Returns the meterRange.
     */
    public String[][] getMeterRange() {
        return meterRange;
    }

    /**
     * @param meterRange The meterRange to set.
     */
    public void setMeterRange(String[][] meterRange) {
        this.meterRange = meterRange;
    }

    /**
     * @return Returns the meterColorId.
     */
    public String[] getMeterColorId() {
        return meterColorId;
    }

    /**
     * @param meterColorId The meterColorId to set.
     */
    public void setMeterColorId(String[] meterColorId) {
        this.meterColorId = meterColorId;
    }



}
