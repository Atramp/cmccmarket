/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */
$(function() {
	if(window.parent && window.parent.Teradata && window.parent.Teradata.ThemeManager) {
		Teradata.ThemeManager = window.parent.Teradata.ThemeManager;
		Teradata.MAIN_THEME_MANAGER = false;
	} else {
		Teradata.MAIN_THEME_MANAGER = true;
		Teradata.ThemeManager = function() {
			var all = {};
			var wins = [];
			return {
				/**
				 * 加载主题
				 * @param {Function} callback
				 * @param {Object} scope
				 */
				load: function(callback, scope) {
					$.getJSON(App.contextPath + '/themes?action=list', function(themes) {
						all = {};
						var selectionsData = [];
						for(var i = 0; i < themes.length; i++) {
							Teradata.ThemeManager.regist(themes[i].id, themes[i]);
						}
						callback.call(scope || window, Teradata.ThemeManager.list());
					});
				},
				
				/**
				 * 注册主题
				 * @param {String} name
				 * @param {Object} theme
				 */
				regist: function(name, theme) {
					all[name] = theme;
				},
				
				/**
				 * 应用指定主题
				 * @param {String} themeId
				 */
				apply: function(themeId, win) {
					if(!win) {
						for(var i = 0; i < wins.length; i++) {
							try {
								Teradata.ThemeManager.apply(themeId, wins[i]);
							} catch (e) {
								Teradata.ThemeManager.unregistWindow(win);
								continue;
							}
						}
					} else {
						with(win) {
							var theme = all[themeId];
							var urls = theme.cssURLs;
							var head = $('head');
							if(urls) {
								var curLinks = head.find('link[title="teradata-ui-theme-css"]');
								var lastCurLink = null;
								
								if(curLinks.length > 0) {
									lastCurLink = curLinks[curLinks.length - 1];
								}
								
								for(var i = 0; i < urls.length; i++) {
									var link = document.createElement('link');
									link.setAttribute('rel', 'stylesheet');
									link.setAttribute('type', 'text/css');
									link.setAttribute('href', App.contextPath + urls[i]);
									link.setAttribute('title', 'teradata-ui-theme-css');
									link = $(link);
									if(lastCurLink) {
										link.insertAfter(lastCurLink);
										lastCurLink = link;
									} else {
										link.appendTo(head);
									}
									if(Teradata.isIE6 || Teradata.isIE7 || Teradata.isIE8) {
										// Fixd IE's bug.
										var href = link.attr('href');
										var type = link.attr('type');
										var rel = link.attr('rel');
										link.attr('href', '');
										link.attr('type', '');
										link.attr('rel', '');
										
										link.attr('type', type);
										link.attr('rel', rel);
										link.attr('href', href);
									}
								}
								
								for(var i = 0; i < curLinks.length; i++) {
									if(Teradata.isIE6 || Teradata.isIE7 || Teradata.isIE8) {
										// Fixd IE's bug.
										curLinks[i].setAttribute('type', '');
										curLinks[i].setAttribute('rel', '');
										curLinks[i].setAttribute('href', '');
									}
									$(curLinks[i]).remove();
								}
								
								if(Teradata.MAIN_THEME_MANAGER) {
									$.cookie('teradata-ui-theme-id', themeId);
								}
							}
						}
					}
				},
				
				/**
				 * 获取全部主题
				 * @return {Array}
				 */
				list: function() {
					var list = [];
					for(var k in all) {
						list.push(all[k]);
					}
					return list;
				},
				
				/**
				 * 注册window，用于多frame应用同时换肤
				 * @param {HTMLWindow} win
				 */
				registWindow: function(win) {
					$(win).bind('unload', function() {
						Teradata.ThemeManager.unregistWindow(win);
					});
					wins.push(win);
				},
				
				/**
				 * 撤销注册window
				 */
				unregistWindow: function(win) {
					wins.remove(win);
				}
			};
		}();
	}
	Teradata.ThemeManager.registWindow(window);
});

