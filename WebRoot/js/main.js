Ext.ns('App');

App.initMain = function () {
    Ext.Direct.addProvider(Ext.app.REMOTING_API);
    Ext.QuickTips.init();
    Ext.form.Field.prototype.msgTarget = 'side';
    Ext.Msg.minWidth = 768;

    App.createViewport();
};

Ext.onReady(App.initMain);

App.createViewport = function () {
    var viewport = new Ext.Viewport({
        layout: 'border',
        items: [
            App.createNorth(),
            App.createWest(),
            App.createCenter()
        ]
    });
};

App.createNorth = function () {
    return {
        id: 'top',
        region: 'north',
        height: 60,
        html: '<div style="width: 100%;height:60px;background: #0084CF;"><div style="height: 60px;"><img src="/cmccmarket/images/banner-1.png"style="display: inline-block;float: left;margin: 0 0 0 8px;height: 52px;"><img src="/cmccmarket/images/banner-2.png"style="display: inline-block;float: right;margin: -20px 50px 0 0;height: 52px;"></div><div style="width: 100%;height: 28px; z-index: 999;display: inline-block;position: relative;bottom: 28px;"><div style="width:80%;height:28px;display: inline-block;"><div style="height: 20px;opacity: 0;"></div><div style="height: 4px;background-color: #8EC31E"></div><div style="height: 4px;background-color: #D2146F"></div></div><div style="width:20%;min-width:200px;height:28px;display: inline-block;float:right;background-color: #D2146F;text-align: center;"><span style="font-size: 1.2rem;color: #ffffff;margin-top:4px;display: block;">市场分析辅助工具</span></div></div></div>'
    };
};

App.createWest = function () {
    PerLeftMenuDomain.getMenus(loginUserId, function (result) {
        for (var i = 0; i < result.data.length; i++) {
            var item = result.data[i];

            var title = item.icon ? '<div style="background:url(' + item.icon
            + ') no-repeat;padding-left:20px;">' + item.text
            + '</div>' : item.text;

            var node = new Ext.tree.TreePanel({
                title: title,
                rootVisible: false,
                lines: true,
                autoScroll: true,
                root: {
                    editable: false,
                    expanded: true,
                    text: item.text,
                    draggable: false,
                    children: item.children
                },
                listeners: {
                    click: {
                        element: 'el',
                        fn: function (node, e) {
                        }
                    },
                    itemclick: function (view, record, item, index, e) {
                        var leaf = record.raw.leaf;
                        var parentid = record.raw.parent;
                        var url = record.raw.url;
                        if (leaf) {
                            App.mainPanel.openTab(record);
                        }

                    }

                }
            });

            Ext.getCmp('mainMenu').add(node);
        }

        Ext.getCmp('mainMenu').doLayout();

    });

    return {
        id: 'mainMenu',
        region: 'west',
        layout: 'accordion',
        title: loginUserName + '  <a style=\"color:#fff;text-decoration:none;\" href="' + App.contextPath + '/permission/loginOut.action">【退出】</a>',
        split: true,
        width: 225,
        minSize: 175,
        maxSize: 400,
        collapsible: true,
        margin: '0 0 5 5',
        lines: false,
        autoScroll: true
    };
};

App.createCenter = function () {
    var freshTab = function (tabPanel, curNode) {
        tabPanel.setTitle(curNode.text);
        tabPanel.body.dom.innerHTML = '<iframe scrolling="auto" frameborder="0" width="100%" height="100%" src="' + App.contextPath + curNode.attributes.url + '"> </iframe>';
        tabPanel.doLayout();
    };

    var mainPanel = new Ext.TabPanel({
        id: 'main-tabs',
        activeTab: 0,
        region: 'center',
        margins: '0 5 5 0',
        resizeTabs: true,
        tabWidth: 150,
        minTabWidth: 120,
        enableTabScroll: true
    });

    //菜单点击方法
    //支持单标签和多标签两种方式显示
    mainPanel.openTab = function (node) {

        var mask = new Ext.LoadMask(
            Ext.getBody(),
            {
                msg: "页面加载中...",
                removeMask: true
            }
        );
        mask.show();
        var multiTabsMode = true;
        // 单标签模式
        if (multiTabsMode == "false") {
            // 如果已有多个标签（多标签转化为单页面时），移除多余标签

            if (mainPanel.items.length > 1) {
                mainPanel.items.each(function (item) {
                    if (item.id != "main-view")
                        mainPanel.remove(item);
                });
            }
            var mainView = Ext.getCmp("main-view");
            // 初始状态，增加一个Main-view用于刷新页面
            if (!mainView) {
                mainView = new Ext.Panel({
                    id: "main-view",
                    nodeId: node.raw.id,
                    title: node.raw.text,
                    tabTip: node.raw.text,
                    layout: 'fit',
                    html: '<iframe scrolling="auto" frameborder="0" width="100%" height="100%" src="' + App.contextPath + node.raw.url + '"> </iframe>',
                    closable: true,
                    autoScroll: false,
                    border: true
                });
                mainPanel.add(mainView);
                mainPanel.setActiveTab(mainView);
            } else {
                freshTab(mainView, node);
                mainPanel.setActiveTab(mainView);
            }
        } else { // 多标签模式	

            var newTab = false;
            var tab = Ext.getCmp(node.raw.id);
            if (!tab) {
                tab = new Ext.Panel({
                    id: node.raw.id,
                    title: node.raw.text,
                    tabTip: node.raw.text,
                    layout: 'fit',
                    html: '<iframe scrolling="auto" frameborder="0" width="100%" height="100%" src="' + App.contextPath + node.raw.url + '"> </iframe>',
                    closable: true,
                    autoScroll: false,
                    border: true
                });
                this.add(tab);
                newTab = true;
            }
            this.setActiveTab(tab);
        }
        mask.hide();
    };
    App.mainPanel = mainPanel;
    return mainPanel;
};
