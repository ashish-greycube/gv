frappe.ui.form.on('Scan CT', {
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
    }
});