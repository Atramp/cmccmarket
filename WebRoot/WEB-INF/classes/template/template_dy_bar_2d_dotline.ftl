<chart <#include "root.ftl">>
<categories fontSize="12">
        <#list categoryNames as cat>
            <#if (limit == -1)>
                <category name="${cat}"/>
            <#else>
                <#if (cat_index < limit)>
                    <category name="${cat}"/>
                </#if>
            </#if>
        </#list>
    </categories>

    <#list serieNames as series >
        <dataset seriesName="${serieNames[series_index]}" renderAs="${types[series_index]}"
                 parentYAxis="${axisTypes[series_index]}" valuePosition="${(series_index % 2 == 1) ? string('ABOVE','BELOW')}" anchorSides="${(series_index % 2 == 1) ? string('','4')}" anchorRadius="5" >
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