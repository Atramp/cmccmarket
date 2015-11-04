<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>

<%
    List datas = (List) request.getAttribute("datas");
    String rp_id = (String) request.getAttribute("rp_id");
    String download = request.getParameter("download") == null ? "1" : request.getParameter("download"); //1：不允许下载，反之
%>

<html>
<head>
    <title></title>
    <style>
        body, div {
            padding: 0;
            margin: 0;
            text-align: center;
        }
    </style>
    <script language="javascript" type="text/javascript">
        // 绘制一个GridPanel
        function initDataTable(columns, tableData) {
            if (!tableData || tableData.length == 0 || !columns || columns.length == 0) {
                return;
            }

            var _columns = new Array();
            var _fields = new Array();
            for (var i = 0, _length = columns.length; i < _length; i++) {
                var x = columns[i];
                // Grid的ColumnModel
                var o = {
                    header: x == '分组' ? '' : x,
                    dataIndex: x,
                    tooltip: x,
                    align: 'center'
                };
                if (i == 0) {
                    o.locked = true;
                    o.minWidth = 150;
                    o.autoWidth = true;
                }
                _columns.push(o);
                _fields.push(x);
            }

            Ext.define('dataModel', {extend: 'Ext.data.Model', idProperty: '指标', fields: _fields});
            var _storeParam = {model: 'dataModel', data: tableData};
            if (columns[0] == '分组') {
                _storeParam['groupField'] = '指标';
            }
            var dataStore = Ext.create('Ext.data.Store', _storeParam);
            Ext.create('Ext.grid.Panel', {
                title: '<%="3".equals(rp_id) ? "4G行业对标" : "营销资源-营销费用.xls"%>',
                columns: _columns,
                store: dataStore,
                renderTo: "gridPanel",
                width: '100%',
                align: 'center',
                columnLines: true,
                loadMask: true,
                forceFit: true,
                selModel: {
                    selType: 'cellmodel'
                },
                features: [{
                    id: 'group',
                    ftype: 'grouping',
                    groupHeaderTpl: [
                        '<div>{name:this.formatName}</div>',
                        {
                            formatName: function (name) {
                                var index = name.indexOf('--') + 2;
                                return name.substring(index, name.length);
                            }
                        }
                    ],
                    hideGroupedHeader: true,
                    enableGroupingMenu: false
                }],
                tools: [
                    <%if(download.equals("0")){%>
                    {
                        text: '导出',
                        width: 100,
                        xtype: 'button',
                        handler: function () {
                            location.href = 'saveExcel.action?rp_id=<%=rp_id%>';
                        }
                    }
                    <%}%>
                ]
            });
        }
        ;
        Ext.onReady(function () {
            var columns = (<%=datas.get(0).toString()%>);
            var data = (<%=datas.get(1).toString()%>);
            initDataTable(columns, data);
        });
    </script>
</head>
<body>
<div id="gridPanel" style="width: 100%;">

</div>
</body>
</html>
