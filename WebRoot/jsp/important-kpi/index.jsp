<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<%
    //获取action生成的图形数据
    Map dataInfo = (Map) request.getAttribute("dataInfo");
    String chartXML = (String) dataInfo.get("chartXML");
    String chartSWF = (String) dataInfo.get("chartSWF");
    String tableDataStr = (String) dataInfo.get("tableDataStr");

    String currentFreq = (String) session.getAttribute("freq");
    String currentStartDate = (String) session.getAttribute("startDate");
    String currentEndDate = (String) session.getAttribute("endDate");
    String currentBranchId = (String) session.getAttribute("branchId");

    String currentKpiGroupId = (String) session.getAttribute("kpiGroupId");
    String currentKpiSetId = (String) session.getAttribute("kpiSetId");
    String tip = (String) dataInfo.get("tip");

    List kpiGroups = (List) dataInfo.get("kpiGroups");

    boolean downloadAuth = "0".equals(request.getParameter("download"));
%>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <title>重点指标展示</title>
    <style>
        .x-tree-checkbox {
            display: none;
        }
    </style>
    <script language="javascript" type="text/javascript">
        var chart = null;
        Ext.onReady(function () {
            var years = new Array();
            var endYear = new Date().getYear() + 1900;
            for (var year = 2012; year <= endYear; year++) {
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

                Ext.create('Ext.toolbar.Toolbar', {
                    renderTo: 'toolbarDiv',
                    padding: 6,
                    height: 35,
                    defaults: {
                        width: 180,
                        labelWidth: 30,
                        labelStyle: 'font-size:12px;margin-left:5px;'
                    },
                    items: [
                        {
                            id: 'freq',
                            xtype: 'combo',
                            width: 120,
                            fieldLabel: '频度',
                            value: '<%=currentFreq%>',
                            store: {
                                fields: ['value', 'name'],
                                data: [
                                    {"value": "year", "name": "年"},
                                    {"value": "month", "name": "月"}
                                ]
                            },
                            displayField: 'name',
                            valueField: 'value',
                            listeners: {
                                change: function (selected) {
                                    if (selected.value == 'year') {
                                        Ext.getCmp('startDate').hide();
                                        Ext.getCmp('endDate').hide();

                                        Ext.getCmp('startDateY').show();
                                        Ext.getCmp('endDateY').show();

                                    } else {
                                        Ext.getCmp('startDate').show();
                                        Ext.getCmp('endDate').show();

                                        Ext.getCmp('startDateY').hide();
                                        Ext.getCmp('endDateY').hide();
                                    }
                                }
                            }
                        },
                        Ext.create('Ext.ux.MonthField', {
                            fieldLabel: '起始',
                            labelWidth: 30,
                            id: 'startDate',
                            name: 'startDate',
                            format: 'Ym',
                            value: '<%=currentStartDate%>'
                        }),
                        Ext.create('Ext.ux.MonthField', {
                            fieldLabel: '结束',
                            labelWidth: 30,
                            id: 'endDate',
                            name: 'endDate',
                            format: 'Ym',
                            value: '<%=currentEndDate%>'
                        }),
                        {
                            id: 'startDateY',
                            xtype: 'combo',
                            fieldLabel: '起始',
                            value: '<%=currentStartDate.substring(0,4)%>',
                            store: {
                                fields: ['value', 'name'],
                                data: years
                            },
                            displayField: 'name',
                            valueField: 'value',
                            hidden: true
                        },
                        {
                            id: 'endDateY',
                            xtype: 'combo',
                            fieldLabel: '结束',
                            value: '<%=currentEndDate.substring(0,4)%>',
                            store: {
                                fields: ['value', 'name'],
                                data: years
                            },
                            displayField: 'name',
                            valueField: 'value',
                            hidden: true
                        },
                        Ext.create('Ext.ux.TreeCombo', {
                            fieldLabel: '机构',
                            labelWidth: 30,
                            name: 'branchTree',
                            id: 'branchTree',
                            width: 300,
                            treeWidth: 250,
                            value: '<%=currentBranchId == null ? "13500" : currentBranchId%>',
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
                                asynRefreshChart();
                            }
                        }
                        <%if(downloadAuth){%>
                        ,
                        Ext.create('Ext.button.Button', {
                            text: '导出',
                            height: 25,
                            width: 75,
                            handler: function () {
                                saveExcel();
                            }
                        })
                        <%}%>
                    ]
                });
            });

            chart = drawChart('<%= chartXML %>', '<%=chartSWF%>');
        });
        /**
         * 指标组变化
         **/
        function onKpiGroupChange() {
            var groupRadio = document.getElementsByName("kpiGroups");
            for (var i = 0; i < groupRadio.length; i++) {
                if (groupRadio[i].checked) {
                    document.getElementById("kpiGroupId").value = groupRadio[i].value;
                    document.getElementById("kpiGroupId").groupName = groupRadio[i].groupName;
                    break;
                }
            }
            asynRefreshChart();
        }

        /**
         * 图表、表格勾选事件处理
         */
        function onChartAndTableChange() {
            var elements = document.getElementsByName("chartAndTable");
            for (var i = 0; i < elements.length; i++) {
                if ("chart" == elements[i].value) {
                    var chartDiv = document.getElementById("chartDiv");
                    if (elements[i].checked)
                        chartDiv.style.display = "";
                    else
                        chartDiv.style.display = "none"
                }
                if ("table" == elements[i].value) {
                    //var tableDiv = Ext.get("gridPanel");
                    var tableDiv = document.getElementById("gridPanel");
                    if (elements[i].checked) {
                        tableDiv.style.display = "block";
                        //初始化或者数据更新时重新绘制gridPanel
                        if (!grid || tableData.isUpdate()) {
                            var data = tableData.getData();
                            initDataTable(data.COLUMNS, data.DATA4DISPLAY);
                        }
                    }
                    else {
                        tableDiv.style.display = "none";
                    }
                }
            }
        }

        /**
         * 异步更新图表及表格
         */
        function asynRefreshChart() {
            var mask = new Ext.LoadMask(
                    Ext.getBody(),
                    {
                        msg: "数据加载中...",
                        removeMask: true
                    }
            );

            mask.show();
            var freq = Ext.getCmp('freq').getValue();
            var variables = {
                freq: Ext.getCmp('freq').getValue(),
                startDate: freq == 'year' ? Ext.getCmp('startDateY').getValue() + '01' : Ext.Date.format(new Date(Ext.getCmp('startDate').getValue()), 'Ym'),
                endDate: freq == 'year' ? Ext.getCmp('endDateY').getValue() + '12' : Ext.Date.format(new Date(Ext.getCmp('endDate').getValue()), 'Ym'),
                branchId: Ext.getCmp("branchTree").getValue(),
                kpiGroupId: document.getElementById("kpiGroupId").value
            };
            console.log(variables);

            Ext.Ajax.request({
                url: "<%=request.getContextPath() %>/market/important-kpi/retrieveAjax.action",
                params: variables,
                method: "post",
                success: function (response) {
                    var responseObj = Ext.decode(response.responseText);
                    chart.dispose();
                    chart = drawChart(responseObj.result.chartXML, responseObj.result.chartSWF);
                    mask.hide();
                    tableData.setData(responseObj.result.tableData, onChartAndTableChange);
                    var tip = responseObj.result.tip;
                    tip = tip == null ? "" : tip;
                    document.getElementById("tip").innerHTML = tip;
                },
                failure: function (response) {
                    mask.hide();
                    Ext.Msg.alert("系统提示", "查询数据失败，请稍后重试！");
                }
            });
        }

        var grid;
        var tableData = {
            updated: false,// 更新状态，false为未更新
            data: Ext.decode('<%=tableDataStr%>'),//json对象
            getData: function () {
                return this.data;
            },
            setData: function (newData, fn) {// 可选参数fn，用于数据更新时被调用（更新事件）。
                this.updated = true;
                this.data = newData;
                if (fn)
                    fn.apply();
            },
            isUpdate: function () {// 返回数据更新状态，并重置为false
                var temp = this.updated;
                this.updated = false;
                return temp;
            }
        }
        /**
         * 绘制表格
         */
        function initDataTable(columns, tableData) {
            if (!tableData || tableData.length == 0 || !columns || columns.length == 0) {
                return;
            }

            if (grid) {//刷新指标数据时，销毁已有的表格
                grid.destroy();
            }

            var _columns = new Array();
            var _fields = new Array();
            for (var i = 0, _length = columns.length; i < _length; i++) {
                var x = columns[i];
                // Grid的ColumnModel
                _columns.push({
                    header: x,
                    dataIndex: x,
                    tooltip: x
                });
                // Model的fields
                _fields.push(x);
            }

            var _store = Ext.create('Ext.data.ArrayStore', {
                data: tableData,
                fields: _fields
            });
            grid = new Ext.grid.GridPanel({
                columns: _columns,
                store: _store,
                renderTo: "gridPanel",
                align: 'center',
                columnLines: true,
                loadMask: true,
                forceFit: true,
                viewConfig: {
                    scrollOffset: 0
                },
                style: {
                    border: '1px',
                    borderColor: '#C0C0C0',
                    borderStyle: 'solid'
                }
            });
        }

        /**
         * 绘制图表
         */
        function drawChart(data, chartType) {
            FusionCharts.setCurrentRenderer("javascript");
            var chart = new FusionCharts(chartType, "kpi-chart", "90%", "480", "0", "0");
            chart.setDataXML(data);
            chart.render("chartDiv");
            chart.setChartAttribute('showBorder', '0');
            return chart;
        }

        /**
         * 导出excel
         */
        function saveExcel() {
            var freq = Ext.getCmp('freq').getValue();
            var startDate = freq == 'year' ? Ext.getCmp('startDateY').getValue() + '01' : Ext.Date.format(new Date(Ext.getCmp('startDate').getValue()), 'Ym');
            var endDate = freq == 'year' ? Ext.getCmp('endDateY').getValue() + '12' : Ext.Date.format(new Date(Ext.getCmp('endDate').getValue()), 'Ym');

            var fileName = '';
            var groupRadio = document.getElementsByName("kpiGroups");
            if (groupRadio && groupRadio.length > 0) {
                for (var i = 0; i < groupRadio.length; i++) {
                    if (groupRadio[i].checked) {
                        document.getElementById("kpiGroupId").value = groupRadio[i].value;
                        fileName = groupRadio[i].getAttribute('groupName');
                        break;
                    }
                }
            } else {
                fileName = "<%=((Map)kpiGroups.get(0)).get("KPI_GROUP_NAME")%>";
            }
            fileName = fileName + "_"
            + document.getElementsByName("branchTree")[0].value
            + "_"
            + "(" + startDate
            + "-"
            + endDate + ")"
            + ".xls";
            var url = "<%=request.getContextPath() %>/market/important-kpi/saveExcel.action";

            location.href = url + "?kpiGroupId=" + document.getElementById("kpiGroupId").value + "&fileName=" + encodeURI(fileName);
        }

    </script>
</head>
<body>
<div id="toolbarDiv" style="width: 100%;border-bottom: solid #cccccc 1px;"></div>
<div style="margin-top:10px;">
    <table border="0" width="100%">
        <tr>
            <td width="10%" align="left">
            </td>
            <td width="10%" align="left">
                <input type="checkbox" id="chart" name="chartAndTable" value="chart" checked
                       onclick="onChartAndTableChange()"><span style="font-size: 12px;">&nbsp;图形</span><br>
                <input type="checkbox" id="table" name="chartAndTable" value="table"
                       onclick="onChartAndTableChange()"><span style="font-size: 12px;">&nbsp;表格</span>
            </td>
            <td width="80%" align="right" style="padding-right:10%;">
	                    <span style="text-align:left;display: inline-block;font-size: 12px;">
	                    <%
                            if (null != kpiGroups && kpiGroups.size() > 1) {
                                for (int i = 0; i < kpiGroups.size(); i++) {
                                    Map groupInfo = (Map) kpiGroups.get(i);
                                    String groupId = (String) groupInfo.get("KPI_GROUP_ID");
                                    String groupName = (String) groupInfo.get("KPI_GROUP_NAME");
                                    String checked = "";
                                    if (groupId.equals(currentKpiGroupId))
                                        checked = "checked";
                                    out.println("<input type=\"radio\" id=\"kpiGroups\" name=\"kpiGroups\" groupName=\"" + groupName + "\"  value=\"" + groupId + "\" " + checked + " onclick=\"onKpiGroupChange()\">" + groupName + "<br>");

                                }
                            }
                        %>
				       </span>
            </td>
        </tr>
    </table>
</div>
<br/>

<div id="chartDiv" name="chartDiv" align="center"></div>

<div id="tipDiv" name="tipDiv" style="margin:10px 0 0 0;text-align: center;">
    <%if (tip != null && !tip.isEmpty()) {%><strong>注：</strong><%}%><span id="tip"><%=tip == null ? "" : tip %></span>
</div>


<input type="hidden" id="kpiGroupId" name="kpiGroupId" value="<%=currentKpiGroupId %>"/>
<input type="hidden" id="kpiSetId" name="kpiSetId" value="<%=currentKpiSetId %>"/>
<br/>

<div id="gridPanel" style="width: 80%;margin-left:10%;"></div>
<br/>
</body>
</html>
