package <%- packageName %>;

import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.ServiceRegistry;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.alfresco.repo.processor.BaseProcessorExtension;

/**
 * Documentation on creating custom javascript root objects can be found here:
 *
 * http://docs.alfresco.com/5.2/references/dev-extension-points-javascript-root-objects.html
 *
 */
public class <%- className %> extends BaseProcessorExtension {
  private static Log logger = LogFactory.getLog(<%- className %>.class);

  private ServiceRegistry serviceRegistry;
  private PolicyComponent policyComponent;

  public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }
  public void setPolicyComponent(PolicyComponent policyComponent) {
    this.policyComponent = policyComponent;
  }
  /**
   * This is a sample method that can be called from the javascript root object.
   * Example: <%- rootObjectId %>.callMe();
   */
  public void callMe() {
  	logger.error("<%- className %> the javascript root object works :)");
  }
}

