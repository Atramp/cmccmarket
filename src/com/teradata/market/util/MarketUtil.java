package com.teradata.market.util;

public class MarketUtil {
    public static String splitString(String ss, String separate, String repalce) {
        String[] tmp = ss.split(separate);
        if (tmp.length > 0) ss = "";
        for (int i = 0; i < tmp.length; ++i) {
            ss = ss + repalce + tmp[i] + repalce + ",";
        }

        if (ss.endsWith(",")) {
            ss = ss.substring(0, ss.length() - 1);
        }

        return ss;
    }

    public static String arrayJoinForSQL(Object[] array){
        if (array == null || array.length == 0)
            return "";
        StringBuilder stringBuilder = new StringBuilder();
        for (Object o : array) {
            stringBuilder.append("'").append((String) o).append("'").append(",");
        }
        return stringBuilder.substring(0, stringBuilder.length() - 1);
    }

}