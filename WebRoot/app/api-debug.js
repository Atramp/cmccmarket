/**********************************************************************
 * 
 * Code generated automatically by DirectJNgine
 * Copyright (c) 2009, Pedro Agulló Soliveres
 * 
 * DO NOT MODIFY MANUALLY!!
 * 
 **********************************************************************/

Ext.namespace( 'Ext.app');

Ext.app.PROVIDER_BASE_URL=window.location.protocol + '//' + window.location.host + '/' + (window.location.pathname.split('/').length>2 ? window.location.pathname.split('/')[1]+ '/' : '')  + 'djn/directprovider';

Ext.app.POLLING_URLS = {
}

Ext.app.REMOTING_API = {
  url: Ext.app.PROVIDER_BASE_URL,
  type: 'remoting',
  actions: {
    KpiSetDomain: [
      {
        name: 'getMenus'/*() => com.teradata.adf.web.djn.DjnResult */,
        len: 0,
        formHandler: false
      },
      {
        name: 'getMyMenus'/*(String, String) => java.util.List */,
        len: 2,
        formHandler: false
      }
    ],
    PermissionDomain: [
      {
        name: 'getDeptByName'/*() => java.util.ArrayList */,
        len: 0,
        formHandler: false
      },
      {
        name: 'geAllRoleGroup'/*() => java.util.ArrayList */,
        len: 0,
        formHandler: false
      },
      {
        name: 'getBranchByName'/*() => java.util.ArrayList */,
        len: 0,
        formHandler: false
      }
    ],
    PerLeftMenuDomain: [
      {
        name: 'getMenus'/*(String) => com.teradata.adf.web.djn.DjnResult */,
        len: 1,
        formHandler: false
      },
      {
        name: 'getMyMenus'/*(String, String) => java.util.List */,
        len: 2,
        formHandler: false
      }
    ],
    BranchDomain: [
      {
        name: 'getBranchs'/*() => com.teradata.adf.web.djn.DjnResult */,
        len: 0,
        formHandler: false
      }
    ],
    CommonDomain: [
      {
        name: 'queryDataPaginated'/*(com.google.gson.JsonArray) => com.teradata.adf.core.model.PaginatedList */,
        len: 1,
        formHandler: false
      },
      {
        name: 'saveData'/*() => com.teradata.adf.web.djn.DjnResult -- FORM HANDLER */,
        len: 1,
        formHandler: true
      },
      {
        name: 'queryData'/*(com.google.gson.JsonArray) => java.util.List */,
        len: 1,
        formHandler: false
      },
      {
        name: 'removeData'/*(String) => com.teradata.adf.web.djn.DjnResult */,
        len: 1,
        formHandler: false
      },
      {
        name: 'updateData'/*() => com.teradata.adf.web.djn.DjnResult -- FORM HANDLER */,
        len: 1,
        formHandler: true
      },
      {
        name: 'listData'/*() => java.util.List */,
        len: 0,
        formHandler: false
      },
      {
        name: 'loadData'/*(String) => com.teradata.adf.web.djn.DjnResult */,
        len: 1,
        formHandler: false
      },
      {
        name: 'addData'/*() => com.teradata.adf.web.djn.DjnResult -- FORM HANDLER */,
        len: 1,
        formHandler: true
      }
    ]
  }
}

