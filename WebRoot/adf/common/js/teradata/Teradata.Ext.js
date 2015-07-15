/**
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */
Ext.apply(Ext.data.Store.prototype, {
	applySort: function() {
		if (this.sortInfo && !this.remoteSort) {
			var s = this.sortInfo, f = s.field;
			var st = this.fields.get(f).sortType;
			var fn = function(r1, r2) {
				var v1 = st(r1.data[f]), v2 = st(r2.data[f]);
				if (typeof (v1) == "string") {
					return v1.localeCompare(v2);
				}
				return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
			};
			this.data.sort(s.direction, fn);
			if (this.snapshot && this.snapshot != this.data) {
				this.snapshot.sort(s.direction, fn);
			}
		}
	}
});
    
