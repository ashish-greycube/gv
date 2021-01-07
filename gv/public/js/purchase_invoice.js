frappe.ui.form.on('Purchase Invoice', {
    validate: function(doc, dt, dn) {
        for (let i = 0; i < cur_frm.doc.items.length; i++) {

            if (Object.keys(JSON.parse(cur_frm.doc.items[i].item_tax_rate)).length !== 0) {
                var itemtaxrate = Object.values(JSON.parse(cur_frm.doc.items[i].item_tax_rate))[0];
                cur_frm.doc.items[i].line_tax_rate = itemtaxrate;
                cur_frm.doc.items[i].line_tax_amount = (cur_frm.doc.items[i].amount * itemtaxrate) / 100;
		cur_frm.doc.items[i].line_total_tax_amount=cur_frm.doc.items[i].line_tax_amount+cur_frm.doc.items[i].amount;

            } else {
                cur_frm.doc.items[i].line_tax_rate = 0;
                cur_frm.doc.items[i].line_tax_amount = 0.0;
            }
        }
    }
});