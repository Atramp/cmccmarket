package com.teradata.market.util;

import com.sun.xml.internal.messaging.saaj.util.ByteInputStream;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import java.io.*;

/**
 * Created by alex on 15-4-10.
 */
public class PictureEncodeUtil {
    public static String encode(File pic) throws IOException {
        if (pic != null) {
            BASE64Encoder encoder = new BASE64Encoder();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            encoder.encode(new FileInputStream(pic), baos);
            decode(baos.toString());
            System.out.print(baos.toString());
        }
        return "";
    }

    public static void decode(String str) throws IOException {
        BASE64Decoder decoder = new BASE64Decoder();
        new FileOutputStream(new File("/Users/alex/Desktop/blue_1_export.jpg")).write(decoder.decodeBufferToByteBuffer(str).array());

    }

    public static void main(String[] args) {
        try {
            encode(new File("/Users/alex/Desktop/blue_1.jpg"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
