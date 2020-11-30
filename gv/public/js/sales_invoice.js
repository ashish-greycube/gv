frappe.ui.form.on('Sales Invoice', {
    refresh: function (frm) {
        if (frm.doc.docstatus == 1) {
            frm.add_custom_button(__('Make Purchase Invoice'), function () {
                if (frm.doc.items[0].supplier) {
                    frappe.call({
                        args: {
                            "source_name": cur_frm.doc.name,
                            "target_doc":undefined,
                            "supplier":frm.doc.items[0].supplier
                        },
                        method: "gv.api.make_purchase_invoice_from_sales_invoice",
                        callback: function (r) {
                            if (r.message) {
                                var doc = frappe.model.sync(r.message)[0];
                                frappe.set_route("Form", doc.doctype, doc.name);
                            }
                        }
                    });
                } else {
                    frappe.msgprint(__("Supplier for 1st item is mandatory to make purchase invoice."))
                }
            });
        }
    },    
	setup: function(frm){
        frappe.db.get_value('Company', frappe.sys_defaults.company, ['airline_supplier_group_cf','hotel_supplier_group_cf'])
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
    before_save: function(frm){
        let items=frm.doc.items;
        for (const item in items){
            let row=items[item]
            let tour_amount_cf=((row.total_amount-row.commission_cf)* row.tour_percent_cf)/100
            frappe.model.set_value(row.doctype,row.name,'tour_amount_cf',tour_amount_cf)
            let cost_amount_cf=row.total_amount-row.commission_cf-row.tour_amount_cf
            frappe.model.set_value(row.doctype,row.name,'cost_amount_cf',cost_amount_cf)
        }
        frm.refresh_field('items');

    }
});