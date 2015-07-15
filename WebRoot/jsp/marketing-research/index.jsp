<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>

<%
    String fullscreen = request.getParameter("fullscreen");//当前是否处于全屏状态
    String download = request.getParameter("download") == null ? "1" : request.getParameter("download"); //是否允许下载，为1时不允许

    String startDate = request.getAttribute("startDate").toString();
    String endDate = request.getAttribute("endDate").toString();
    String branchId = request.getAttribute("branchId").toString();
    String kpiId = request.getAttribute("kpiId").toString();
    Map dataInfo = (Map) request.getAttribute("dataInfo");
    String data = dataInfo.get("data").toString();//数据
    String branchTreeData = dataInfo.get("branchTreeData").toString();
    String kpiTreeData = dataInfo.get("kpiTreeData").toString();
    String firstColumnHeader = dataInfo.get("firstColumnHeader").toString();//第一列表头，不同模式下显示不同
    String columnHeaders = dataInfo.get("columnHeaders").toString();//第一列表头，不同模式下显示不同
    boolean multiMonth = (Boolean) dataInfo.get("multiMonth");
%>
<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8">
    <title>市场调研数据报表</title>
    <script language="javascript" type="text/javascript" defer>
        function initTreeChildren(childrenData) {
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
                var temp = initTreeChildren(item.children);
                if (temp && temp.length > 0) {
                    children[i].children = temp;
                    children[i].leaf = false;
                    children[i].expanded = true;
                    children[i].checked = false;
                }
            }
            return children;
        }
        ;

        Ext.onReady(function () {
            var isFullScreen = '<%=fullscreen%>' == '1';//是否全屏（展开模式）
            var tools = [
                Ext.create('Ext.ux.MonthField', {
                    fieldLabel: '起始',
                    labelWidth: 30,
                    editable: false,
                    width: 120,
                    id: 'startDate',
                    name: 'startDate',
                    format: 'Ym',
                    listeners: {
                        render: function (datefield) {
                            datefield.setValue(<%=startDate%>);
                        }
                    }
                }),
                Ext.create('Ext.ux.MonthField', {
                    fieldLabel: '结束',
                    labelWidth: 30,
                    editable: false,
                    width: 120,
                    id: 'endDate',
                    name: 'endDate',
                    format: 'Ym',
                    listeners: {
                        render: function (datefield) {
                            datefield.setValue(<%=endDate%>);
                        }
                    }
                }),
                Ext.create('Ext.ux.TreeCombo', {
                    name: 'branchTree',
                    id: 'branchTree',
                    width: 180,
                    treeHeight: 10,
                    treeWidth: 200,
                    emptyText: '请选择省份...',
                    afterLoadSetValue: true,
                    selectChildren: true,
                    canSelectFolders: true,
                    store: Ext.create('Ext.data.TreeStore', {
                        root: {
                            text: '全国', id: 'root', expanded: true, checked: false,
                            children: initTreeChildren(Ext.decode('<%=branchTreeData%>', true).data.children)
                        },
                        folderSort: false
                    })
                }),
                Ext.create('Ext.ux.TreeCombo', {
                    name: 'kpiTree',
                    id: 'kpiTree',
                    width: 180,
                    treeHeight: 10,
                    treeWidth: 400,
                    emptyText: '请选择指标...',
                    afterLoadSetValue: true,
                    selectChildren: true,
                    canSelectFolders: true,
                    store: Ext.create('Ext.data.TreeStore', {
                        root: {
                            text: '全部指标', id: 'root', expanded: true, checked: false,
                            children: initTreeChildren(Ext.decode('<%=kpiTreeData%>', true).data.children)
                        },
                        folderSort: false
                    })
                }),
                Ext.create('Ext.button.Button', {
                    text: '提交',
                    margin: '0 10 0 0',
                    handler: function () {
                        console.log(Ext.getCmp("branchTree").getValue());
                        location.href = 'retrieve.action?startDate=' + Ext.Date.format(new Date(Ext.getCmp("startDate").getValue()), 'Ym') + '&endDate=' + Ext.Date.format(new Date(Ext.getCmp("endDate").getValue()), 'Ym') + '&branchId=' + Ext.getCmp("branchTree").getValue() + '&kpiId=' + Ext.getCmp("kpiTree").getValue() + "&download=<%=download%>";
                    }
                }),
                <%if(download.equals("0")){%>
                Ext.create('Ext.button.Button', {
                    text: '导出',
                    handler: function () {
                        location.href = 'saveExcel.action?startDate=' + Ext.Date.format(new Date(Ext.getCmp("startDate").getValue()), 'Ym') + '&endDate=' + Ext.Date.format(new Date(Ext.getCmp("endDate").getValue()), 'Ym') + '&branchId=' + Ext.getCmp("branchTree").getValue() + '&kpiId=' + Ext.getCmp("kpiTree").getValue() + "&download=<%=download%>";
                    }
                }),
                <%}%>
                {
                    text: isFullScreen ? '关闭' : '展开',
                    xtype: 'button',
                    handler: function () {
                        if (isFullScreen)
                            window.close();
                        else {
                            if (Ext.isIE)
                                window.open('retrieve.action?startDate=' + Ext.Date.format(new Date(Ext.getCmp("startDate").getValue()), 'Ym') + '&endDate=' + Ext.Date.format(new Date(Ext.getCmp("endDate").getValue()), 'Ym') + '&branchId=' + Ext.getCmp("branchTree").getValue() + '&kpiId=' + Ext.getCmp("kpiTree").getValue() + '&download=<%=download%>&fullscreen=1', "_blank", "toolbar=no,fullscreen=yes,scrollbars=no,resizable=no,status=no");
                            else
                                window.open('retrieve.action?startDate=' + Ext.Date.format(new Date(Ext.getCmp("startDate").getValue()), 'Ym') + '&endDate=' + Ext.Date.format(new Date(Ext.getCmp("endDate").getValue()), 'Ym') + '&branchId=' + Ext.getCmp("branchTree").getValue() + '&kpiId=' + Ext.getCmp("kpiTree").getValue() + '&download=<%=download%>&fullscreen=1', "_blank", "toolbar=yes,scrollbars=yes,resizable=no,status=no,width=" + screen.width + ",height=" + screen.height);
                        }
                    }
                }
            ];

            var toolbar = Ext.create('Ext.toolbar.Toolbar', {
                xtype: 'form',
                bodyPadding: '5 5 0',
                fieldDefaults: {
                    labelWidth: 30,
                    msgTarget: 'side',
                    autoFitErrors: false
                },
                layout: 'hbox',
                items: tools
            });


            var data = Ext.decode('<%=data%>', true);//数据

            // 表头定义
            var columns = new Array();
            columns[0] = {
                text: '<%=firstColumnHeader%>',
                width: 300,
                locked: true,
                tdCls: 'task',
                sortable: false,
                dataIndex: 'KPI_NAME',
                hideable: false,
                summaryType: 'count'
            };

            //字段定义
            var fields = new Array();
            fields[0] = {name: 'KPI_NAME', type: 'string'};
            fields[1] = {name: 'DATA_DATE', type: 'string', defaultValue: '-'};

            var columnGroup = new Object();
            var columnHeaderArray = Ext.decode('<%=columnHeaders%>', true);
            for (var i = 0; i < columnHeaderArray.length; i++) {
                var header = columnHeaderArray[i];
                if (header != 'DATA_DATE' && header != 'KPI_NAME') {
                    fields.push({name: header, type: 'text', defaultValue: '-'});
                }
                var _header = header.split("-");
                if (null == columnGroup[_header[1]]) {
                    columnGroup[_header[1]] = new Array();
                }
                columnGroup[_header[1]].push({
                    header: _header[2], tooltip: _header[1] + _header[2], align: 'center',
                    width: 100, maxWidth: 150, sortable: false, lockable: false,
                    menuDisabled: true, autoScroll: true, dataIndex: header
                });
            }
            for (var key in columnGroup) {
                columns.push({header: key, tooltip: key, sortable: false, columns: columnGroup[key]});
            }

            Ext.define('dataModel', {extend: 'Ext.data.Model', idProperty: 'taskId', fields: fields});
            var dataStore = Ext.create('Ext.data.Store', {model: 'dataModel', data: data, groupField: 'DATA_DATE'});

            var grid = Ext.create('Ext.grid.Panel', {
                height: window.outerHeight,
                frame: false,
                renderTo: Ext.getBody(),
                columnLines: true,
                store: dataStore,
                selModel: {
                    selType: 'cellmodel'
                },
                <%if(multiMonth){%>
                features: [{
                    id: 'group',
                    ftype: 'grouping',
                    groupHeaderTpl: '{name}',
                    hideGroupedHeader: true,
                    enableGroupingMenu: false
                }],
                <%}%>
                sortable: false,
                columns: columns,
                tbar: toolbar
            });


            Ext.getCmp("branchTree").ids = "<%=branchId%>".split(",");
            Ext.getCmp("branchTree").setValue("<%=branchId%>");

            Ext.getCmp("kpiTree").ids = "<%=kpiId%>".split(",");
            Ext.getCmp("kpiTree").setValue("<%=kpiId%>");
        });
        $(".x-column-header-last").css("border-right-style", "solid");
    </script>
</head>
<body style="height: 100%;">
</body>
</html>
