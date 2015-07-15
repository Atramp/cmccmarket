<%@ include file="/adf/common/jsp/taglibs.jsp" %>
<script type="text/javascript" src="${ctxPath}/adf/common/js/ext/ext-all-4.2.js"></script>
<script type="text/javascript" src="${ctxPath}/adf/common/js/ext/ext-theme-neptune.js"></script>
<script type="text/javascript" src="${ctxPath}/adf/common/js/ext/ext-lang-zh_CN.js"></script>
<script type="text/javascript" src="${ctxPath}/app/api.js"></script>
<script type="text/javascript">
    Ext.BLANK_IMAGE_URL = '${ctxPath}/adf/common/images/s.gif';
    Ext.Loader.setConfig({enabled: true});
    Ext.Loader.setPath('Ext.ux', '<%=request.getContextPath() %>/adf/common/js/ext/ux');
    Ext.require([
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.form.*',
        'Ext.tip.QuickTipManager',
        'Ext.ux.DataTip',
        'Ext.ux.RowBodyExtend'
    ]);
    Ext.Direct.addProvider(Ext.app.REMOTING_API);
</script>

<link rel="stylesheet" type="text/css"
      href="<%=request.getContextPath() %>/adf/common/css/ext4/ext-theme-neptune-all.css"/>
<style>
    .x-field-label-cell {
        vertical-align: middle;
    }
</style>
