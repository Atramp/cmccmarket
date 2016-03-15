<%@ page language="java" import="org.apache.commons.collections.MapUtils" pageEncoding="UTF-8" %>
<%@ page import="java.text.SimpleDateFormat" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>

<%
    //获取action生成的图形数据
    String currentMonth = request.getParameter("date");
    String currentBranchId = request.getParameter("branchId");
    String currentBranchName = request.getParameter("branchName");

    currentMonth = currentMonth == null ? new SimpleDateFormat("yyyyMM").format(new Date()).toString() : currentMonth;
    String download = request.getParameter("download");

    List<Map> data = (List) request.getAttribute("datas");
    boolean ready = data != null && !data.isEmpty();
    String[] numInChinese = new String[]{"一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三"};
%>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <style>
        body {
            background-color: #ffffff;
        }

        .title {
            padding: 0;
            font-size: 1em;
            font-weight: bold;
            line-height: 2.5em;
        }

        .x-tree-checkbox {
            display: none;
        }

    </style>
    <script language="javascript" type="text/javascript">
        Ext.onReady(function () {
            var years = new Array();
            var endYear = new Date().getYear() + 1900;
            for (var year = 2008; year <= endYear; year++) {
                years.push({value: year, name: year});
            }
            BranchDomain.getBranchs(function (result) {
                if (!result || !result.data)
                    return;
                // 递归生成节点的children
                var initChildren = function (childrenData) {
                    if (!childrenData || childrenData.length <= 0)
                        return null;
                    var children = new Array(childrenData.length);
                    for (var i = 0; i < childrenData.length; i++) {
                        var item = childrenData[i];
                        children[i] = {
                            id: item.id,
                            text: item.text,
                            checked: false,
                            leaf: true
                        };
                        var temp = initChildren(item.children);
                        if (temp && temp.length > 0) {
                            children[i].children = temp;
                            children[i].leaf = false;
                            children[i].expanded = true;
                            children[i].checked = undefined;//暂时使组上的节点不可勾选。
                        }
                    }
                    return children;
                };
                var rootNode = result.data;

                var toolbar = Ext.create('Ext.toolbar.Toolbar', {
                    renderTo: 'toolbarDiv',
                    padding: 6,
                    height: 35,
                    defaults: {
                        width: 180,
                        labelWidth: 30,
                        labelStyle: 'font-size:12px;margin-left: 5px;'
                    },
                    items: [
                        Ext.create('Ext.ux.MonthField', {
                            fieldLabel: '月份',
                            labelWidth: 30,
                            id: 'month',
                            format: 'Ym',
                            value: '<%=currentMonth%>'
                        }),
                        Ext.create('Ext.ux.TreeCombo', {
                            fieldLabel: '机构',
                            labelWidth: 30,
                            name: 'branchTree',
                            id: 'branchTree',
                            width: 300,
                            treeWidth: 250,
                            value: '<%=currentBranchId == null ? "10100" : currentBranchId%>',
                            afterLoadSetValue: true,
                            selectChildren: false,
                            canSelectFolders: true,
                            multiSelect: false,
                            store: Ext.create('Ext.data.TreeStore', {
                                root: {
                                    id: rootNode.id,
                                    text: rootNode.text,
                                    expanded: true,
                                    children: initChildren(rootNode.children)
                                },
                                folderSort: false
                            })
                        })
                        , '->',
                        {
                            text: '提交',
                            height: 25,
                            width: 75,
                            handler: function () {
                                refresh();
                            }
                        }
                        <%if("0".equals(download)){%>
                        ,
                        Ext.create('Ext.button.Button', {
                            text: '导出',
                            height: 25,
                            width: 75,
                            handler: function () {
                                saveDoc();
                            }
                        })
                        <%}%>
                    ]
                });
                setTimeout(function () {
                    $(chartDataArray).each(function () {
                        if (this.chartData != null)
                            drawChart(this.id, this.chartData, this.type, this.width);
                    });
                }, 1);
            });
        });
        var chartDataArray = new Array();

        var chartID = 0;
        function drawChart(id, data, chartType, width) {
            FusionCharts.setCurrentRenderer("javascript");
            var chart = new FusionCharts(chartType, chartID++, width, "250", "0", "0");
            chart.setDataXML(data);
            chart.setChartAttribute("showBorder", 0);
            chart.render(id);
            return chart;
        }

        /**
         * 刷新页面
         */
        function refresh() {
            var mask = new Ext.LoadMask(
                    Ext.getBody(),
                    {
                        width: 300,
                        msg: "数据加载中...",
                        removeMask: true
                    }
            );
            mask.show();
            var month = Ext.Date.format(new Date(Ext.getCmp('month').getValue()), 'Ym');
            var branchId = Ext.getCmp("branchTree").getValue();
            var branchName = document.getElementsByName("branchTree")[0].value;
            var url = "<%=request.getContextPath() %>/market/marketing-analysis/retrieve.action";
            location.href = url + "?branchId=" + branchId + "&date=" + month + "&branchName=" + branchName + "&download=" + <%=download%>;
        }

        /**
         * 导出DOC
         */
        function saveDoc() {
            var mask = new Ext.LoadMask(
                    Ext.getBody(),
                    {
                        width: 300,
                        msg: "正在生成文件，请稍等...",
                        removeMask: true
                    }
            );
            mask.show();
            $("g").removeAttr("class");
            $("g").removeAttr("clip-path");
            var month = Ext.Date.format(new Date(Ext.getCmp('month').getValue()), 'Ym');
            var branchName = document.getElementsByName("branchTree")[0].value;
            var fileName = branchName + "公司市场简析" + "(" + month + ").doc";
            var svgArray = $("svg");
            var i = 0;
            var successCount = 0;
            var id = setInterval(function () {
                console.log(i + "-" + successCount);
                if (i < svgArray.length) {
                    var svg = svgArray[i++];
                    $.ajax({
                        url: "<%=request.getContextPath() %>/market/marketing-analysis/saveSVG.action",
                        type: 'post',
                        data: {
                            date: month,
                            ID: svg.parentElement.parentElement.id,
                            SVG: svg.outerHTML,
                            WIDTH: $(svg).attr("width")
                        },
                        success: function () {
                            successCount++;
                        }
                    });
                } else if (successCount == svgArray.length) {
                    console.log("saving...");
                    clearInterval(id);
                    $.ajax({
                        url: "<%=request.getContextPath() %>/market/marketing-analysis/saveDoc.action",
                        type: 'post',
                        async: 'true',
                        data: {
                            date: month,
                            branchName: branchName,
                            fileName: encodeURI(fileName)
                        },
                        success: function (responseText) {
                            if (responseText) {
                                mask.hide();
                                clearTimeout(timeOutId);
                                location.href = "<%=request.getContextPath() %>/market/marketing-analysis/downloadDoc.action" + "?tempName=" + responseText + "&fileName=" + encodeURI(fileName);
                            }
                        }
                    });
                }
            }, 100);//间隔100发送一次请求，避免请求挤压
            var timeOutId = setTimeout(function () {
                mask.hide();
                clearInterval(id);
                alert("系统异常，请稍后重试。");
            }, 60000);//60秒后清理循环（防止后台图片生成异常，循环无法清除）
        }

    </script>
</head>
<body>
<div id="toolbarDiv" style="width: 100%;border-bottom: solid #cccccc 1px;"></div>
<div id="main" style="width: 900px;margin: 20px auto;background-color: #ffffff;">
    <%if (ready) {%>
    <div style="border: 1px solid #aaaaaa;" id="report">
        <h1 align="center" style="font-size: 1.8em;"><%=currentBranchName%>公司市场简析（<%=currentMonth%>）</h1>
        <table width="80%" align="center" cellspacing="0" id="d">
            <% for (int index_set = 0; index_set < data.size(); index_set++) {
                Map kpiSet = data.get(index_set);
            %>
            <tr>
                <td colspan="2"><span
                        class="title">（<%=numInChinese[index_set]%>）<%=MapUtils.getString(kpiSet, "KPI_SET_NAME")%></span>
                </td>
            </tr>
            <%
                List<Map> kpiGroupList = (List) kpiSet.get("KPI_GROUPS");
                int index = 1;
                for (int index_group = 0; index_group < kpiGroupList.size(); index_group++) {
                    Map kpiGroup = kpiGroupList.get(index_group);
            %>
            <tr>
                <td colspan="2"><span
                        class="title"><%=index++%>、<%=MapUtils.getString(kpiGroup, "KPI_GROUP_NAME", "")%></span>
                </td>
            </tr>
            <%
                if (MapUtils.getString(kpiGroup, "CHART_DATA", "").isEmpty())
                    continue;
            %>
            <tr>
                <%
                    List<Map> kpiList = (List<Map>) kpiGroup.get("KPIS");
                    boolean hasText = kpiList != null && !kpiList.isEmpty();
                    if (hasText) {
                %>
                <td width="40%" valign="top">
                    <%
                        for (Map kpi : kpiList) {
                    %>
                    <p style="line-height: 2.5em;margin: 0;">
                        <%=MapUtils.getString(kpi, "TEXT", "")%>
                    </p>
                    <%
                        }
                    %>
                </td>
                <%}%>
                <td colspan="<%=hasText ? 1 : 2%>">
                    <div id="<%=MapUtils.getString(kpiGroup,"KPI_GROUP_ID")%>" style="vertical-align: top;"></div>
                    <script>
                        chartDataArray.push({
                            id: '<%=MapUtils.getString(kpiGroup,"KPI_GROUP_ID")%>',
                            chartData: '<%=MapUtils.getString(kpiGroup,"CHART_DATA")%>',
                            type: '<%=MapUtils.getString(kpiGroup,"FLASH_FILE")%>',
                            width: <%=hasText?450:750%>
                        });
                    </script>
                </td>
            </tr>
            <tr>
                <td width="40%"></td>
                <td width="60%"><span
                        style="font-size:0.8em;float: right;">数据来源：<%=MapUtils.getString(kpiGroup, "DATA_SOURCE")%></span>
                </td>
            </tr>
            <%
                    }
                }
            %>
        </table>
    </div>
    <%}%>
</div>
</body>
</html>
