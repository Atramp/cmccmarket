package com.teradata.market.util;

import freemarker.cache.StringTemplateLoader;
import freemarker.template.Configuration;
import freemarker.template.Template;

import java.io.StringWriter;

/**
 * Created by alex on 15/8/31.
 */
public class FreemarkerUtil {
    private static Configuration cfg;
    private static StringTemplateLoader stl;

    static {
        cfg = new Configuration();
        stl = new StringTemplateLoader();
        cfg.setTemplateLoader(stl);
    }

    public static String stringReplace(String template, Object variety) {
        try {
            if (stl.findTemplateSource(template) == null)
                stl.putTemplate(template, template);
            Template _template = cfg.getTemplate(template);
            StringWriter writer = new StringWriter();
            _template.process(variety, writer);
            System.out.println(writer.toString());
            return writer.toString();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

}
