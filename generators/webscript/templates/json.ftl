<#escape x as x?json_string>
{
  "data": "${data}",
  "greeting": "${msg("greeting")}",
  "item": "${item!"config not loaded"}"
}
</#escape>
