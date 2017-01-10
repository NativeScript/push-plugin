package com.telerik.pushplugin;


import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Collection;
import java.util.Map;


public class JsonObjectExtended extends JSONObject{
    //Overwrite for the method wrap as it is only available in Api Level 19+ and this ensures
    //it will work on lower level deployments

    /**
     * Wraps the given object if necessary.
     *
     * <p>If the object is null or , returns {@link #NULL}.
     * If the object is a {@code JSONArray} or {@code JSONObject}, no wrapping is necessary.
     * If the object is {@code NULL}, no wrapping is necessary.
     * If the object is an array or {@code Collection}, returns an equivalent {@code JSONArray}.
     * If the object is a {@code Map}, returns an equivalent {@code JSONObject}.
     * If the object is a primitive wrapper type or {@code String}, returns the object.
     * Otherwise if the object is from a {@code java} package, returns the result of {@code toString}.
     * If wrapping fails, returns null.
     */
    public static Object wrap(Object o) {
        if (o == null) {
            return NULL;
        }
        if (o instanceof JSONArray || o instanceof JSONObject) {
            return o;
        }
        if (o.equals(NULL)) {
            return o;
        }
        try {
            if (o instanceof Collection) {
                return new JSONArray((Collection) o);
            } else if (o instanceof Object[]) {
                Log.d("jsonconverter", "is converting array");
                Object[] arr = (Object[]) o;
                JSONArray jsonArr = new JSONArray();
                for (Object elem: arr) {
                    jsonArr.put(elem);
                }
                Log.d("jsonconverter", jsonArr.toString());
                return jsonArr;
            }
            if (o instanceof Map) {
                return new JSONObject((Map) o);
            }
            if (o instanceof Boolean ||
                    o instanceof Byte ||
                    o instanceof Character ||
                    o instanceof Double ||
                    o instanceof Float ||
                    o instanceof Integer ||
                    o instanceof Long ||
                    o instanceof Short ||
                    o instanceof String) {
                return o;
            }
            if (o.getClass().getPackage().getName().startsWith("java.")) {
                return o.toString();
            }
        } catch (Exception ignored) {
        }
        return null;
    }

}
