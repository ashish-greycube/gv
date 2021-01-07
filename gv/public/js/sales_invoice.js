frappe.ui.form.on('Sales Invoice', {
    branch:function(doc, dt, dn) {
		if(cur_frm.doc.branch){
		    frappe.call({
			method: "frappe.client.get",
			args: {
				doctype: "Branch",
				filters: {"name":cur_frm.doc.branch}    
			},
			callback: function(r) {
				for (i = 0; i < cur_frm.doc.items.length; i++) {
					cur_frm.doc.items[i].cost_center = r.message.cost_center					
				}
				
			}
		   })
		}
    },    
    refresh: function (frm) {
        if (frm.doc.docstatus == 1) {

            frm.add_custom_button(__('Make Purchase Invoice'), function () {
                if (frm.doc.items[0].supplier) {
                    frappe.call({
                        args: {
                            "source_name": cur_frm.doc.name,
                            "target_doc": undefined,
                            "supplier": frm.doc.items[0].supplier
                        },
                        method: "gv.api.make_purchase_invoice_from_sales_invoice",
                        callback: function (r) {
                            if (r.message) {
                                var doc = frappe.model.sync(r.message)[0];
                                window.open("#Form/" + doc.doctype + "/" + doc.name)
                                // frappe.set_route("Form", doc.doctype, doc.name);
                            }
                        }
                    });
                } else {
                    frappe.msgprint(__("Supplier for 1st item is mandatory to make purchase invoice."))
                }
            });
        }
    },
    setup: function (frm) {
        frappe.db.get_value('Company', frappe.sys_defaults.company, ['airline_supplier_group_cf', 'hotel_supplier_group_cf'])
            .then(r => {
                frm.set_query('airline_cf', 'items', () => {
                    return {
                        filters: {
                            supplier_group: r.message.airline_supplier_group_cf
                        }
                    }
                })
                frm.set_query('hotel_cf', 'items', () => {
                    return {
                        filters: {
                            supplier_group: r.message.hotel_supplier_group_cf
                        }
                    }
                })
            })
    },
    before_save: function (frm) {
        let items = frm.doc.items;
        for (const item in items) {
            let row = items[item]
            if (row.fare_base_cf > 0) {
                let tour_percent_cf = (row.tour_amount_cf / row.fare_base_cf) * 100
                frappe.model.set_value(row.doctype, row.name, 'tour_percent_cf', tour_percent_cf)
            }
            let cost_amount_cf = row.fare_base_cf + row.line_tax_amount - row.tour_amount_cf
            frappe.model.set_value(row.doctype, row.name, 'cost_amount_cf', cost_amount_cf)
        }
        frm.refresh_field('items');
    }
});
frappe.ui.form.on('Sales Invoice Item', {
    fare_base_cf: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.fare_base_cf && row.tour_amount_cf && row.fare_base_cf > 0) {
            row.tour_percent_cf = (row.tour_amount_cf / row.fare_base_cf) * 100
        }
        if (row.fare_base_cf && row.tour_amount_cf && row.line_tax_amount) {
            row.cost_amount_cf = row.fare_base_cf + row.line_tax_amount - row.tour_amount_cf
        }
        refresh_field("tour_percent_cf", row.name, "items");
        refresh_field("cost_amount_cf", row.name, "items");
    },
    tour_amount_cf: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.fare_base_cf && row.tour_amount_cf && row.fare_base_cf > 0) {
            row.tour_percent_cf = (row.tour_amount_cf / row.fare_base_cf) * 100
        }
        if (row.fare_base_cf && row.tour_amount_cf && row.line_tax_amount) {
            row.cost_amount_cf = row.fare_base_cf + row.line_tax_amount - row.tour_amount_cf
        }
        refresh_field("tour_percent_cf", row.name, "items");
        refresh_field("cost_amount_cf", row.name, "items");
    },
    line_tax_amount: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.fare_base_cf && row.tour_amount_cf && row.line_tax_amount) {
            row.cost_amount_cf = row.fare_base_cf + row.line_tax_amount - row.tour_amount_cf
        }
        refresh_field("cost_amount_cf", row.name, "items");
    },
})