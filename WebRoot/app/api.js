Ext.namespace("Ext.app");
Ext.app.PROVIDER_BASE_URL=window.location.protocol+"//"+window.location.host+"/"+(window.location.pathname.split("/").length>2?window.location.pathname.split("/")[1]+"/":"")+"djn/directprovider";
Ext.app.POLLING_URLS={};
Ext.app.REMOTING_API={url:Ext.app.PROVIDER_BASE_URL,type:"remoting",actions:{KpiSetDomain:[{name:"getMenus",len:0,formHandler:false},{name:"getMyMenus",len:2,formHandler:false}],PermissionDomain:[{name:"getDeptByName",len:0,formHandler:false},{name:"geAllRoleGroup",len:0,formHandler:false},{name:"getBranchByName",len:0,formHandler:false}],PerLeftMenuDomain:[{name:"getMenus",len:1,formHandler:false},{name:"getMyMenus",len:2,formHandler:false}],BranchDomain:[{name:"getBranchs",len:0,formHandler:false}],CommonDomain:[{name:"queryDataPaginated",len:1,formHandler:false},{name:"saveData",len:1,formHandler:true},{name:"queryData",len:1,formHandler:false},{name:"removeData",len:1,formHandler:false},{name:"updateData",len:1,formHandler:true},{name:"listData",len:0,formHandler:false},{name:"loadData",len:1,formHandler:false},{name:"addData",len:1,formHandler:true}]}};