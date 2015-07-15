<%@ page language="java" import="java.util.*" pageEncoding="UTF-8" %>
<%@ page import="org.apache.log4j.Logger" %>

<%
    Logger logger = Logger.getLogger("index.jsp");
    List datas = (List) request.getAttribute("datas");
    String rp_id = (String)request.getAttribute("rp_id");
    rp_id="1";
    String download=request.getParameter("download")==null?"1":request.getParameter("download"); //1：不允许下载，反之
%>

<html>
<head>
    <title>营销资源-营销费用</title>
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
                    header: x,
                    dataIndex: x,
                    tooltip: x,
                    align: 'center'
                };
                if (i == 0) {
                    o.locked = true;
                    o.minWidth = 150;
                }
                _columns.push(o);
                // Model的fields
                _fields.push(x);
            }

            var _store = Ext.create('Ext.data.ArrayStore', {
                data: tableData,
                fields: _fields
            });
            Ext.create('Ext.grid.Panel', {
                title: '营销资源-营销费用',
                columns: _columns,
                store: _store,
                renderTo: "gridPanel",
                width: '100%',
                align: 'center',
                columnLines: true,
                loadMask: true,
                forceFit: true,
                selModel: {
                    selType: 'cellmodel'
                },
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
