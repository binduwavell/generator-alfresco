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
 * The Rhino JavaScript runtime is really clever at being able to call Java from JavaScript. 
 * It will automatically handle some type conversions and even allows for javascript functions 
 * to be passed to java code if the Java code expects an interface with a single method in it, 
 * the javascript function will be made to look like that function. More details can be found in
 *
 * https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino/Scripting_Java#JavaScript_Functions_as_Java_Interfaces
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

