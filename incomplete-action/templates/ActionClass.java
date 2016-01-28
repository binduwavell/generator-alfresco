package <%= package %>;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.util.PropertyCheck;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ParameterDefinition;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

public class <%= actionClass %> extends ActionExecuterAbstractBase implements InitializingBean {
  // Private Global
  private static final Log _logger = LogFactory.getLog(<%= actionClass %>.class);

  // Public Global
  public static final String ACTION_NAME = "<%= actionId %>";

  private ServiceRegistry serviceRegistry = null;

  @Override
  public void afterPropertiesSet() throws Exception {
    PropertyCheck.mandatory(this, "serviceRegistry", this.serviceRegistry);
  }

  @Override
  protected void executeImpl(Action action, NodeRef actionedUponNodeRef) {
  }

  @Override
  protected void addParameterDefinitions(List<ParameterDefinition> paramList) {
  }

  public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }
}
