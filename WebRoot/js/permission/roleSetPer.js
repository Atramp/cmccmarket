Ext.Loader.setConfig({
    enabled: true 
});Ext.Loader.setPath('Ext.ux', '../ux');
 
Ext.require([
    'Ext.data.*',
    'Ext.grid.*',
    'Ext.tree.*',
    'Ext.ux.CheckColumn'
]);

Ext.onReady(function() {
    Ext.QuickTips.init();
    
    Ext.define('treeMenu', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'text',     type: 'string'},
            {name: 'done',     type: 'boolean'}
        ], proxy: {  
             type: 'ajax',  
             reader: 'json'  
         } 
    });

    var MenuStore = Ext.create('Ext.data.TreeStore', {
        model: 'treeMenu',
        proxy: {
            type: 'ajax',
            url: '/cmccmarket/selectAllRoleMenu.action'
        },
        reader: { type: 'json'},
        folderSort: false
    });
    var treePanel = Ext.create('Ext.tree.Panel', {
        width: '100%',
        height:500,
        renderTo: Ext.getBody(),
        columnLines: true,
        useArrows: true,
        rootVisible: false,
        store: MenuStore,
        multiSelect: true,
        columns: [{
            xtype: 'treecolumn',text: '菜单模块',width: 200,sortable:false,
            dataIndex: 'text',locked: true
           },{
            xtype: 'checkcolumn',header: '访问',width: 100,sortable:false,
            dataIndex: 'done',stopSelection: false,
            listeners: {
            	    checkchange: function(column, rowIndex, checked){
				       var view = treePanel.getView(),
			             record = view.getRecord(view.getNode(rowIndex));
					     record.eachChild(function (child) {
					     	 if(!child.get('leaf')){
					     	 	 child.eachChild(function (child0) {
					     	 	 	    child0.set('done', checked);  
					        			child0.fireEvent('checkchange', child0, checked);  
					     	 	 });
					     	 }
					         child.set('done', checked);  
					         child.fireEvent('checkchange', child, checked);  
					    }); 
			        }
    
       		 }
        }],  //columns  end
        viewConfig: {
	        getRowClass: function(record){
	            return record.get('children')==null ? 'customCss' : '';
	        }
    	}
    });
});
