<chart <#include "root.ftl">>
<categories fontSize='12'>
    <#list categoryNames as cat>
        <category name='${cat}' hoverText='${cat}'/>
    </#list>
    </categories>
<#list datas as datalist>
    <dataset seriesName='${serieNames[datalist_index]}' color='${colors[datalist_index]?substring(1)}'
             anchorBorderColor='${colors[datalist_index]}' anchorRadius='3' parentYAxis='${axisTypes[datalist_index]}'>
        <#list datalist as data>
            <set value='${data}'/>
        </#list>
    </dataset>
</#list>

    <styles>
        <definition>
            <style type='font' color='666666' name='CaptionFont' size='15'/>
            <style type='font' name='SubCaptionFont' bold='0'/>
        </definition>
        <application>
            <apply toObject='caption' styles='CaptionFont'/>
            <apply toObject='SubCaption' styles='SubCaptionFont'/>
        </application>
    </styles>
</chart>