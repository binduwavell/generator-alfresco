package <%- classPackage %>;

import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.HashMap;
import java.util.Map;

// See http://docs.alfresco.com/5.1/references/dev-extension-points-webscripts.html
public class <%- className %> extends DeclarativeWebScript {
  private static Log logger = LogFactory.getLog(<%- className %>.class);

  @Override
  protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
    logger.info("<%- className %> executing impl");
    Map<String, Object> model = new HashMap<String, Object>();
    model.put("data", "Facts and statistics collected together for reference or analysis.");
    return model;
  }
}
