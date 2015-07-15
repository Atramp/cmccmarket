package com.teradata.permission.util;

 
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.StringTokenizer;
import java.util.Vector;

public class StringUtil
{
  public static final String ISO8859 = "ISO-8859-1";
  public static final String UTF8 = "UTF-8";
  public static final String GB2312 = "GB2312";
  public static final String GBK = "GBK";
  public static final String dateRexp_YYYY_MM_DD = "(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)";
  public static final String dateRexp_YYYYMMDD = "(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)";
  public static final String Table_dateRexp = "_(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)";

  public static String[] getArrayFromArrayList(List list)
  {
    if ((list == null) || (list.size() == 0))
      return null;
    String[] str = new String[list.size()];
    for (int i = 0; i < list.size(); ++i)
      str[i] = list.get(i).toString();

    return str;
  }

  public static List getArrayListFromStringArray(String[] array)
  {
    if ((array == null) || (array.length == 0))
      return null;
    Vector returnV = new Vector();
    for (int i = 0; i < array.length; ++i)
      returnV.addElement(array[i]);
    return returnV;
  }

  public static String[] getStringArrayFromObjectArray(Object[] obj)
  {
    if ((obj == null) || (obj.length == 0))
      return null;
    String[] str = new String[obj.length];
    for (int i = 0; i < obj.length; ++i)
      str[i] = obj[i].toString();

    return str;
  }

  public static String replaceString(String theString, String oldVal, String newVal)
  {
    if (theString == null)
      return null;
    theString = theString.replaceAll(oldVal, newVal);
    return theString;
  }

  public static List parsetStringByDelimiter(String sourceStr, String delimiter)
  {
    Vector retV = new Vector();
    StringTokenizer token = new StringTokenizer(sourceStr, delimiter);
    while (token.hasMoreElements()) {
      String retStr = (String)token.nextElement();
      retV.add(retStr);
    }
    return retV;
  }

  public static HashMap stringToMap(String sourceStr, String delimiter)
  {
    HashMap map = null;
    String[] strs = stringToArray(sourceStr, delimiter);
    if ((strs != null) && (strs.length > 0)) {
      map = new HashMap();
      for (int i = 0; i < strs.length; ++i) {
        String[] params = stringToArray(strs[i], "=");
        map.put(params[0], params[1]);
      }
    }
    return map;
  }

  public static String[] stringToArray(String sourceStr, String delimiter)
  {
    StringTokenizer token = new StringTokenizer(sourceStr, delimiter);
    String[] retStrs = new String[token.countTokens()];
    int i = 0;
    while (token.hasMoreElements()) {
      String retStr = (String)token.nextElement();
      retStrs[i] = retStr;
      ++i;
    }
    return retStrs;
  }

  public static String encodeStringUTF8(String str)
  {
    if ((str == null) || (str.length() == 0))
      return str;

    String utf8Str = "";
    try
    {
      utf8Str = URLEncoder.encode(str, "UTF-8");
    }
    catch (UnsupportedEncodingException ex)
    {
      ex.printStackTrace();

      utf8Str = str;
    }
    return utf8Str;
  }

  public static StringBuffer toSqlInString(List inList)
  {
    StringBuffer inBF = new StringBuffer();
    for (int i = 0; i < inList.size(); ++i)
      if (inBF.length() == 0)
        inBF.append("'" + ((String)inList.get(i)) + "'");
      else
        inBF.append(",'" + ((String)inList.get(i)) + "'");


    if (inBF.length() == 0)
      inBF.append("''");
    return inBF;
  }

  public static StringBuffer toSqlInString(String[] inList)
  {
    StringBuffer inBF = new StringBuffer();
    for (int i = 0; i < inList.length; ++i)
      if (inBF.length() == 0)
        inBF.append("'" + inList[i] + "'");
      else
        inBF.append(",'" + inList[i] + "'");


    if (inBF.length() == 0)
      inBF.append("''");
    return inBF;
  }

  public static boolean isNullOrEmpty(String str)
  {
    return ((str == null) || (str.equalsIgnoreCase("null")) || (str.trim().length() == 0));
  }

  public static String toSimpleString(String[] inList)
  {
    return toSimpleString(inList, ",");
  }

  public static String toSimpleString(String[] inList, String separator)
  {
    String resultStr = "";
    if (inList == null)
      return resultStr;

    for (int i = 0; i < inList.length; ++i)
      if (resultStr.length() == 0)
        resultStr = inList[i];
      else
        resultStr = resultStr + separator + inList[i];


    return resultStr;
  }

  public static String charsetTransform(String sourceStr, String sourceCharset, String resultCharset)
    throws UnsupportedEncodingException
  {
    String resultStr = "";
    resultStr = new String(sourceStr.getBytes(sourceCharset), resultCharset);
    return resultStr;
  }

  public static String addQuota(String str)
  {
    return "'" + str + "'";
  }

  public static String filterDollarStr(String str)
  {
    String sReturn = "";
    if (!(str.trim().equals(""))) {
      if (str.indexOf(36, 0) > -1) while (true) {
          while (true) { if (str.length() <= 0) return sReturn;
            if (str.indexOf(36, 0) <= -1) break;
            sReturn = sReturn + str.subSequence(0, str.indexOf(36, 0));
            sReturn = sReturn + "\\$";
            str = str.substring(str.indexOf(36, 0) + 1, str.length());
          }
          sReturn = sReturn + str;
          str = "";
        }


      sReturn = str;
    }

    return sReturn;
  }

  public static String replaceFileSlash(String file)
  {
    file = file.replaceAll("\\", "/");
    return file;
  }

  public static String convertTextToHtml(String text)
  {
    if ((text == null) || ("".equals(text)))
      return "";
    return text.replaceAll("&", "&amp;").replaceAll(">", "&gt;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
  }

  public static String convertTextToXML(String text)
  {
    if ((text == null) || ("".equals(text)))
      return "";
    return text.replaceAll("&", "&amp;").replaceAll(">", "&gt;").replaceAll("<", "&lt;").replaceAll("\"", "&quot;");
  }

  public static String decodeUnicode(String dataStr)
  {
    if (dataStr.indexOf("\\u") < 0)
      return dataStr;
    int start = 0;
    int end = 0;
    StringBuffer buffer = new StringBuffer();
    while (start > -1) {
      end = dataStr.indexOf("\\u", start + 2);
      String charStr = "";
      if (end == -1)
        charStr = dataStr.substring(start + 2, dataStr.length());
      else
        charStr = dataStr.substring(start + 2, end);

      char letter = (char)Integer.parseInt(charStr, 16);
      buffer.append(new Character(letter).toString());
      start = end;
    }
    return buffer.toString();
  }

  public static String hexToString(String strPart)
  {
    if (strPart.startsWith("%"))
      strPart = strPart.substring(1, strPart.length());
    byte[] baKeyword = new byte[strPart.length() / 2];
    for (int i = 0; i < baKeyword.length; ) {
      try {
        baKeyword[i] = (byte)(0xFF & Integer.parseInt(strPart.substring(i * 2, i * 2 + 2), 16));
      }
      catch (Exception e) {
        e.printStackTrace();
      }
      ++i;
    }

    try
    {
      strPart = new String(baKeyword, "utf-8");
    } catch (Exception e1) {
      e1.printStackTrace();
    }
    return strPart;
  }

  public static String EmptyIfNULL(String str)
  {
    if (str == null)
      return "";

    return str;
  }

  public static Object[] addArray(Object[] str1, Object[] str2)
  {
    if (str2 == null)
      return null;
    if ((str1 == null) || (str1.length < 1))
      return str2;

    int n = str1.length + str2.length;
    Object[] str = new String[n];
    for (int j = 0; j < str1.length; ++j)
      str[j] = str1[j];
    for (int j = str1.length; j < n; ++j)
      str[j] = str2[j];

    return str;
  }

  public static Object[][] addArray(Object[][] str1, Object[][] str2)
  {
    int j;
    if ((str2 == null) || (str2.length < 1))
      return ((Object[][])null);
    if ((str1 == null) || (str1.length < 1))
      return str2;

    if (str1[0].length != str2[0].length)
      return ((Object[][])null);

    int n = str1.length + str2.length;
    Object[][] str = new String[n][str1.length];
    for (int i = 0; i < str1.length; ++i)
      for (j = 0; j < str1[0].length; ++j)
        str[i][j] = str1[i][j];
    for (int i = str1.length; i < n; ++i)
      for (j = 0; j < str1[0].length; ++j)
        str[i][j] = str2[i][j];

    return str;
  }

  public static void main(String[] args)
  {
    String table = "SSSS_20070608";
    table = table.replaceAll("_(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})(((0[13578]|1[02])(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)(0[1-9]|[12][0-9]|30))|(02(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))0229)", "");
    System.out.println("Table:" + table);

    System.out.println(filterDollarStr("5ef$laksdjf$dkf$aljf"));

    System.out.println("5ef$laksdjf$dkf$aljf".replace("$", "\\$"));
  }
}
