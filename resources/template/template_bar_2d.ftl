<chart <#include "root.ftl"> >
    <categories fontSize="11">
    <#list categoryNames as cat>
        <#if (limit == -1)>
            <category label="${cat}"/>
        <#else>
            <#if (cat_index < limit)>
                <category label="${cat}"/>
            </#if>
        </#if>
    </#list>
    </categories>
<#list serieNames as series >
    <dataset seriesName="${serieNames[series_index]}">
        <#list datas[series_index] as data0>
            <#if (limit == -1)>
                <set value="${data0}"/>
            <#else>
                <#if (data0_index < limit)>
                    <set value="${data0}"/>
                </#if>
            </#if>
        </#list>
    </dataset>
</#list>
</chart>