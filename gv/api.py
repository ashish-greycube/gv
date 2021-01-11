from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.mapper import get_mapped_doc
from frappe.utils.data import flt

@frappe.whitelist()
def make_purchase_invoice_from_sales_invoice(source_name,target_doc=None,supplier=None):
	def set_missing_values(source, target):
		if len(target.get("items")) == 0:
			frappe.throw(_("No Items found"))
		doc = frappe.get_doc(target)
		doc.run_method("onload")
		doc.run_method("set_missing_values")
		doc.run_method("calculate_taxes_and_totals")
	def update_item(obj, target, source_parent):
		target.rate=flt(obj.cost_amount_cf)

	def update_main_item(source, target,source_parent):
		target.supplier=supplier
		target.sales_partner_cf=source.sales_partner

	doc = get_mapped_doc("Sales Invoice", source_name,	{
		"Sales Invoice": {
			"doctype": "Purchase Invoice",
			"postprocess": update_main_item,
			"validation": {
				"docstatus": ["=", 1],
			}
		},
		"Sales Invoice Item": {
			"doctype": "Purchase Invoice Item",
			"field_no_map":{
				"rate"
			},
			"postprocess": update_item,
		},
	}, target_doc, set_missing_values)
	doc.inter_company_invoice_reference=None
	doc.save()
	return doc 