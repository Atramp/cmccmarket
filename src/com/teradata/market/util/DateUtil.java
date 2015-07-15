package com.teradata.market.util;

import java.io.PrintStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.Locale;

import org.apache.commons.lang.StringUtils;

public class DateUtil {
    private static final SimpleDateFormat datetimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    private static final SimpleDateFormat monthFormat = new SimpleDateFormat("yyyyMM");
    private static final SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");

    public static String currentDatetime() {
        return datetimeFormat.format(now());
    }

    public static String formatDatetime(Date date) {
        return datetimeFormat.format(date);
    }

    public static String formatDatetime(Date date, String pattern) {
        SimpleDateFormat customFormat = (SimpleDateFormat) datetimeFormat.clone
                ();
        customFormat.applyPattern(pattern);
        return customFormat.format(date);
    }

    public static String currentDate() {
        return dateFormat.format(now());
    }

    public static String currentMonthDate() {
        return monthFormat.format(now());
    }

    public static String currentBeforeMonthDate() {
        Calendar cal = Calendar.getInstance();
        if (cal.get(5) < 15)
            cal.add(2, -2);
        else {
            cal.add(2, -1);
        }

        return monthFormat.format(cal.getTime());
    }

    public static String formatDate(Date date) {
        return dateFormat.format(date);
    }

    public static String currentTime() {
        return timeFormat.format(now());
    }

    public static String formatTime(Date date) {
        return timeFormat.format(date);
    }

    public static Date now() {
        return new Date();
    }

    public static Calendar calendar() {
        Calendar cal = GregorianCalendar.getInstance(Locale.CHINESE);
        cal.setFirstDayOfWeek(2);
        return cal;
    }

    public static long millis() {
        return System.currentTimeMillis();
    }

    public static int month() {
        return (calendar().get(2) + 1);
    }

    public static int dayOfMonth() {
        return calendar().get(5);
    }

    public static int dayOfWeek() {
        return calendar().get(7);
    }

    public static int dayOfYear() {
        return calendar().get(6);
    }

    public static boolean isBefore(Date src, Date dst) {
        return src.before(dst);
    }

    public static boolean isAfter(Date src, Date dst) {
        return src.after(dst);
    }

    public static boolean isEqual(Date date1, Date date2) {
        return (date1.compareTo(date2) == 0);
    }

    public static boolean between(Date beginDate, Date endDate, Date src) {
        return ((beginDate.before(src)) && (endDate.after(src)));
    }

    public static Date lastDayOfMonth() {
        Calendar cal = calendar();
        cal.set(5, 0);
        cal.set(11, 0);
        cal.set(12, 0);
        cal.set(13, 0);
        cal.set(14, 0);
        cal.set(2, cal.get(2) + 1);
        cal.set(14, -1);
        return cal.getTime();
    }

    public static Date firstDayOfMonth() {
        Calendar cal = calendar();
        cal.set(5, 1);
        cal.set(11, 0);
        cal.set(12, 0);
        cal.set(13, 0);
        cal.set(14, 0);
        return cal.getTime();
    }

    private static Date weekDay(int week) {
        Calendar cal = calendar();
        cal.set(7, week);
        return cal.getTime();
    }

    public static Date friday() {
        return weekDay(6);
    }

    public static Date saturday() {
        return weekDay(7);
    }

    public static Date sunday() {
        return weekDay(1);
    }

    public static Date parseDatetime(String datetime)
            throws ParseException {
        return datetimeFormat.parse(datetime);
    }

    public static Date parseDate(String date)
            throws ParseException {
        return dateFormat.parse(date);
    }

    public static Date parseTime(String time)
            throws ParseException {
        return timeFormat.parse(time);
    }

    public static Date parseDatetime(String datetime, String pattern)
            throws ParseException {
        SimpleDateFormat format = (SimpleDateFormat) datetimeFormat.clone();
        format.applyPattern(pattern);
        return format.parse(datetime);
    }

    public static List<String> dateBetween(String startDate, int day) {
        List list = new ArrayList();
        try {
            Date d1 = parseDate(startDate);
            Calendar cal = Calendar.getInstance();

            for (int i = 1; i < day + 1; ++i) {
                cal.setTime(d1);
                cal.set(5, i);
                list.add(formatDate(cal.getTime()));
            }

        } catch (ParseException e) {
            e.printStackTrace();
        }

        return list;
    }

    public static String replaceDateZh(String date) {
        date = StringUtils.replace(date, "年", "");
        date = StringUtils.replace(date, "月", "");
        return date;
    }

    public static String getStandardTimeStamp(){
        return new SimpleDateFormat("yyyyMMddHH24mmss").format(new Date());
    }

}