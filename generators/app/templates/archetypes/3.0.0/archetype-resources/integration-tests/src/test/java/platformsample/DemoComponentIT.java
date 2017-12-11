#set($symbol_pound='#')
#set($symbol_dollar='$')
#set($symbol_escape='\' )
/**
 * Copyright (C) 2017 Alfresco Software Limited.
 * <p/>
 * This file is part of the Alfresco SDK project.
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package ${package}.platformsample;

import org.alfresco.rad.test.AbstractAlfrescoIT;
import org.alfresco.rad.test.AlfrescoTestRunner;
import org.alfresco.rad.test.Remote;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * Integration Test of the DemoComponent using the Alfresco Test Runner.
 * The Alfresco Test Runner (i.e. AlfrescoTestRunner.class) will check if it is running in an Alfresco instance,
 * if so it will execute normally locally. On the other hand, if it detects no
 * Alfresco Spring context, then it will make a call to a custom Web Script that
 * will execute this test in the running container remotely. The remote location is
 * determined by the @Remote config.
 *
 * @author martin.bergljung@alfresco.com
 * @since 3.0
 */
@RunWith(value = AlfrescoTestRunner.class)
// Specifying the remote endpoint is not required, it
// will default to http://localhost:8080/alfresco if
// not provided. This shows the syntax but simply
// sets the value back to the default value.
@Remote(endpoint = "http://localhost:8080/alfresco")
public class DemoComponentIT extends AbstractAlfrescoIT {

    @Test
    public void testGetCompanyHome() {
        DemoComponent demoComponent = (DemoComponent) getApplicationContext().getBean("${package}.DemoComponent");
        NodeRef companyHome = demoComponent.getCompanyHome();
        assertNotNull(companyHome);
        String companyHomeName = (String) getServiceRegistry().getNodeService().getProperty(
                companyHome, ContentModel.PROP_NAME);
        assertNotNull(companyHomeName);
        assertEquals("Company Home", companyHomeName);
    }

    @Test
    public void testChildNodesCount() {
        DemoComponent demoComponent = (DemoComponent) getApplicationContext().getBean("${package}.DemoComponent");
        NodeRef companyHome = demoComponent.getCompanyHome();
        int childNodeCount = demoComponent.childNodesCount(companyHome);
        assertNotNull(childNodeCount);
        // There are 7 folders by default under Company Home
        assertEquals(7, childNodeCount);
    }
}