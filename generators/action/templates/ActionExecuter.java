package <%- packageName %>;

import org.alfresco.repo.action.ParameterDefinitionImpl;
import org.alfresco.repo.action.executer.ActionExecuterAbstractBase;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.action.Action;
import org.alfresco.service.cmr.action.ParameterDefinition;
import org.alfresco.service.cmr.dictionary.DataTypeDefinition;
import org.alfresco.service.cmr.repository.NodeRef;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class <%- className %> extends ActionExecuterAbstractBase {
  private static Log logger = LogFactory.getLog(<%- className %>.class);

  public static final String PARAM_ONE = "one";
  public static final String PARAM_TWO = "two";

  private ServiceRegistry serviceRegistry;
  public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }

  @Override
  protected void addParameterDefinitions(List<ParameterDefinition> paramList) {
    for (String s : new String[]{PARAM_ONE, PARAM_TWO}) {
      paramList.add(new ParameterDefinitionImpl(s, DataTypeDefinition.TEXT, true, getParamDisplayLabel(s)));
    }
  }

  @Override
  protected void executeImpl(Action action, NodeRef actionedUponNodeRef) {
    if (serviceRegistry.getNodeService().exists(actionedUponNodeRef) == true) {
      logger.info("<%- className %> is processing: ", actionedUponNodeRef.toString());
    }
  }
}
