package <%- classPackage %>;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.io.IOException;

// See http://docs.alfresco.com/5.1/references/dev-extension-points-webscripts.html
public class <%- className %> extends AbstractWebScript {
  private static Log logger = LogFactory.getLog(<%- className %>.class);

  @Override
  public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
    try {
      logger.info("<%- className %> executing");
      JSONObject obj = new JSONObject();
      obj.put("data", "Facts and statistics collected together for reference or analysis.");
      String jsonString = obj.toString();
      res.getWriter().write(jsonString);
    } catch (JSONException e) {
      throw new WebScriptException("Unable to serialize JSON");
    }
  }
}
