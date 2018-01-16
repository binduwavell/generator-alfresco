<#-- JavaScript Dependencies -->
<@markup id="js">
  <@script type="text/javascript" src="${url.context}/res/<%- artifactId %>/js/<%- id %>.js" group="dashlets" />
</@>


<#-- Stylesheet Dependencies -->
<@markup id="css">
 <@link rel="stylesheet" href="${url.context}/res/<%- artifactId %>/css/<%- id %>.css" group="dashlets"/>
</@>


<#-- Surf Widget creation
<@markup id="widgets">
    <@createWidgets group="dashlets"/>
</@>
-->

<@markup id="html">
    <@uniqueIdDiv>
      <div class="<%- id %>">
        <#escape x as x?html>
        <!-- Access model.data -->
        <h1>${data}</h1>
        <h2>${msg("greeting")}</h2>
        <p>${item!"config not loaded"}</p>
        <div onclick="alertMe('${msg("greeting")}')">Click Me!</div>
        </#escape>
      </div>
    </@>
</@>
