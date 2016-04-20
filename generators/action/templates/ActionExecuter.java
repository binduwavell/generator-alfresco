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

import java.util.List;

/**
 * Documentation on creating custom repo actions can be found here:
 *
 * http://docs.alfresco.com/5.1/references/dev-extension-points-actions.html
 *
 * You will be able to call this action from Java and JavaScript:
 *
 * ```java
 * ActionService actionService = serviceRegistry.getActionService();
 * boolean checkConditions = true;
 * boolean executeAsync = true;
 * Map<String, Serializable> aParams = new HashMap<String, Serializable>();
 * aParams.put(<%- className %>.PARAM_ONE, "Document");
 * aParams.put(<%- className %>.PARAM_TWO, "Example");
 *
 * Action action = actionService.createAction("<%- artifactId %>.<%- actionId %>", aParams);
 * if (action != null) {
 *   actionService.executeAction(action, docNodeRef, checkConditions, executeAsync);
 * } else {
 *   throw new RuntimeException("Could not create <%- artifactId %>.<%- actionId %> action");
 * }
 * ```
 *
 * ```javascript
 * var myAction = actions.create('<%- artifactId %>.<%- actionId %>');
 * myAction.parameters['one'] = 'Document';
 * myAction.parameters['two'] = 'Example';
 * myAction.execute(document);
 * ```
 */
public class <%- className %> extends ActionExecuterAbstractBase {
  private static Log logger = LogFactory.getLog(<%- className %>.class);

  public static final String ACTION_NAME = "<%- artifactId %>.<%- actionId %>";
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
      logger.info("<%- className %> is processing: " + actionedUponNodeRef.toString());
    }
  }
}
