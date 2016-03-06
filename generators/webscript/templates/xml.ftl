<#escape x as x?xml>
<?xml version="1.0" encoding="utf-8"?>
<root>
    <data>${data}</data>
    <greeting>${msg("greeting")}</greeting>
    <item>${item!"config not loaded"}</item>
</root>
</#escape>
