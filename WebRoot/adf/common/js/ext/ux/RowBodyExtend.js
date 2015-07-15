Ext.define('Ext.ux.RowBodyExtend', 
{
    extend: 'Ext.grid.feature.RowBody',
    alias: 'feature.rowbodyextend',
    rowBodyHiddenCls: Ext.baseCSSPrefix + 'grid-row-body-hidden',
    rowBodyTrCls: Ext.baseCSSPrefix + 'grid-rowbody-tr rowbodyexpander-row-body',
    rowBodyTdCls: Ext.baseCSSPrefix + 'grid-cell-rowbody',
    rowBodyDivCls: Ext.baseCSSPrefix + 'grid-rowbody',

    eventPrefix: 'rowbody',
    eventSelector: '.' + Ext.baseCSSPrefix + 'grid-rowbody-tr',
    
    checkcolumn: false,
    
    readMoreText: 'Read more...',
    readLessText: 'Less...',
    
    getRowBodyCheck: function(values) {
        return [
            '<tr class="' + this.rowBodyTrCls + ' {rowBodyCls}">',
                '<td class="' + this.rowBodyTdCls + '" colspan="{rowBodyColspan}">',
                    '<div class="' + this.rowBodyDivCls + '"><div class="rowbodyexpander-row-container"><div class="rowbodyexpander-row-prebody"></div></div><div class="rowbodyexpander-row-body-text">{rowBody}</div><div class="rowbody-extend show">'+this.readMoreText+'</div><div class="rowbody-extend hide">'+this.readLessText+'</div></div>',
                '</td>',
            '</tr>'
        ].join('');
    },
    
    getRowBody: function(values) {
        return [
            '<tr class="' + this.rowBodyTrCls + ' {rowBodyCls}">',
                '<td class="' + this.rowBodyTdCls + '" colspan="{rowBodyColspan}">',
                    '<div class="' + this.rowBodyDivCls + '"><div class="rowbodyexpander-row-body-text">{rowBody}</div><div class="rowbody-extend show">'+this.readMoreText+'</div><div class="rowbody-extend hide">'+this.readLessText+'</div></div>',
                '</td>',
            '</tr>'
        ].join('');
    },
    
    
	reloadBody: function(cpt)
	{
		var elems = cpt.getEl().query('.rowbodyexpander-row-body-text');
		for(var i=0,j=elems.length;i<j;i++)
		{
			var elem = Ext.get(elems[i]);
			var height = elem.getHeight();
			
			if(height > 20)
			{
				elem.addCls('collapsed');
			}
			else
			{
				elem.parent().addCls('noshow');
			}						
		}
	},
	init: function(config)
	{
		var me	= this;
		this.callParent(arguments);

		var	store = me.grid.store,
			cpt = me.grid;

		store.on('beforeload', function()
		{
			cpt.un('afterlayout', me.afterShow);
		});

		store.on('load', function()
		{
			me.reloadBody(cpt);
		});
		
		cpt.on('rowbodyclick', function(view, nesto, e)
		{
			var el = e.getTarget(null, 10, true);
			if(el.hasCls('rowbody-extend'))
			{
				if(el.prev('.rowbodyexpander-row-body-text').hasCls('collapsed'))
				{
					el.prev('.rowbodyexpander-row-body-text').removeCls('collapsed');
					el.removeCls('show').addCls('hide');
					el.next('.rowbody-extend').removeCls('hide').addCls('show');
				}
				else
				{
					el.prev('.rowbodyexpander-row-body-text').addCls('collapsed');
					el.removeCls('show').addCls('hide');
					el.prev('.rowbody-extend').removeCls('hide').addCls('show');
				}
			}
		});
		
		cpt.on('afterlayout', me.afterShow, me);
	},
	
	afterShow: function(cpt)
	{
		var	me = this;
		cpt.getEl().addCls('rowbodyexpander-table');
		me.reloadBody(cpt);
	},
    
    // injects getRowBody into the metaRowTpl.
    getMetaRowTplFragments: function() {
        return {
            getRowBody: (this.checkcolumn) ? this.getRowBodyCheck : this.getRowBody,
            rowBodyTrCls: this.rowBodyTrCls,
            rowBodyTdCls: this.rowBodyTdCls,
            rowBodyDivCls: this.rowBodyDivCls,
            readMoreText: this.readMoreText,
            readLessText: this.readLessText
        };
    },

    mutateMetaRowTpl: function(metaRowTpl) {
        metaRowTpl.push('{[this.getRowBody(values)]}');
    },

    /**
     * Provides additional data to the prepareData call within the grid view.
     * The rowbody feature adds 3 additional variables into the grid view's template.
     * These are rowBodyCls, rowBodyColspan, and rowBody.
     * @param {Object} data The data for this particular record.
     * @param {Number} idx The row index for this record.
     * @param {Ext.data.Model} record The record instance
     * @param {Object} orig The original result from the prepareData call to massage.
     */
    getAdditionalData: function(data, idx, record, orig) {
        var headerCt = this.view.headerCt,
            colspan  = headerCt.getColumnCount();

        return {
            rowBody: "",
            rowBodyCls: this.rowBodyCls,
            rowBodyColspan: colspan
        };
    }
});
