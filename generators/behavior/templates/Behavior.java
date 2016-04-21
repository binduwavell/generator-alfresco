package <%- packageName %>;

import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.NodeServicePolicies;
import org.alfresco.repo.policy.Behaviour;
import org.alfresco.repo.policy.JavaBehaviour;
import org.alfresco.repo.policy.PolicyComponent;
import org.alfresco.service.ServiceRegistry;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.namespace.QName;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.InitializingBean;

import java.io.Serializable;
import java.util.Map;

/**
 * Documentation on creating custom behaviors can be found here:
 *
 * http://docs.alfresco.com/community/references/dev-extension-points-behaviors.html
 *
 */
public class <%- className %> implements InitializingBean {
  private static Log logger = LogFactory.getLog(<%- className %>.class);

  private ServiceRegistry serviceRegistry;
  private PolicyComponent policyComponent;

  public void setServiceRegistry(ServiceRegistry serviceRegistry) {
    this.serviceRegistry = serviceRegistry;
  }
  public void setPolicyComponent(PolicyComponent policyComponent) {
    this.policyComponent = policyComponent;
  }
  @Override
  public void afterPropertiesSet() throws Exception {
    policyComponent.bindClassBehaviour(
      NodeServicePolicies.OnUpdatePropertiesPolicy.QNAME,
      ContentModel.TYPE_CONTENT,
      new JavaBehaviour(this, "onUpdateProperties",
        Behaviour.NotificationFrequency.TRANSACTION_COMMIT));
  }

  /**
   * Called after a node's properties have been changed.
   *
   * @param nodeRef reference to the updated node
   * @param before the node's properties before the change
   * @param after the node's properties after the change
   */
  public void onUpdateProperties(NodeRef nodeRef, Map<QName, Serializable> before, Map<QName, Serializable> after){
    if(nodeRef != null){
      logger.info("<%- className %> working on properties update for node: " + nodeRef.toString());
    }
  }
}

