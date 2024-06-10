/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

/**
 * SuiteScript 2.0 Template - Suitelet Script
 *
 * @summary Suitelet Script 2.0 Template
 *
 * @author Nutchapol Engcharoensoonthorn <nutchapol@teibto.com>
 *
 * @version 1
 * @requires -
 *
 * @changes 1 Create Script
 */

// ===============================================================================================
// Owner :Nutchapol Eng
// Description : Script to manage Create Customer in SCA 
// ================================================================================================
// 29/05/2024 10:00 Nutchapol :Create Script


var config, format, record, redirect, runtime, search, serverWidget, url, libCode, file;
var MODULE = new Array();
MODULE.push('N/config');
MODULE.push('N/format');
MODULE.push('N/record');
MODULE.push('N/redirect');
MODULE.push('N/runtime');
MODULE.push('N/search');
MODULE.push('N/ui/serverWidget');
MODULE.push('N/url');
MODULE.push('SuiteScripts/Lib/Libraries Code 2.0.220622.js');
MODULE.push('N/file');

var step = null;
var timer = new Date().getTime();

// ----- Display Type List
var DisplayType = {
	NORMAL : {
		displayType : 'NORMAL'
	},
	HIDDEN : {
		displayType : 'HIDDEN'
	},
	READONLY : {
		displayType : 'READONLY'
	},
	DISABLED : {
		displayType : 'DISABLED'
	},
	ENTRY : {
		displayType : 'ENTRY'
	},
	INLINE : {
		displayType : 'INLINE'
	},
};

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// ########## Main Suitelet Function
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

define(MODULE,
	/**
	 * @param {config} _config
	 * @param {format} _format
	 * @param {record} _record
	 * @param {redirect} _redirect
	 * @param {runtime} _runtime
	 * @param {search} _search
	 * @param {serverWidget} _serverWidget
	 * @param {url} _url
	 * @param {libCode_200414} _libCode
	 * @param {file} _file
	 */
	function(_config, _format, _record, _redirect, _runtime, _search, _serverWidget, _url, _libCode, _file) {
		config = _config;
		format = _format;
		record = _record;
		redirect = _redirect;
		runtime = _runtime;
		search = _search;
		serverWidget = _serverWidget;
		url = _url;
		libCode = _libCode;
		file = _file;

		return {
			onRequest : OnRequest
		};
	});

/**
 * Definition of the Suitelet script trigger point.
 *
 * @param {Object} context
 * @param {ServerRequest} request context.request - Encapsulation of the incoming request
 * @param {ServerResponse} response context.response - Encapsulation of the Suitelet response
 * @Since 2015.2
 */
function OnRequest(context, request, response) {
	// ==================== Define Default Variable
	var userObj = runtime.getCurrentUser();
	var userSubsi = userObj.subsidiary;
	var userRoleID = userObj.role;
	request = context.request;
	response = context.response;
	var params = request.parameters;
	var step = params.stepfield || null;
	// log.debug("ss_template",JSON.stringify(ss_template))
	// ============================================
	if (!step) {
		
		// Create the form
		var form = serverWidget.createForm({
			title: 'Create Customer & Contact'
		});

		form.addField({
			id : 'stepfield',
			label : 'stepfield',
			type : serverWidget.FieldType.TEXT,
		}).updateDisplayType(DisplayType.HIDDEN).defaultValue = "saveCustomer";

		// ----- Add Field Group
		form.addFieldGroup({
			id : 'g_primary',
			label : 'Primary Information',
		});

		// Add fields to the form
		form.addField({
			id: 'custpage_companyname',
			type: serverWidget.FieldType.TEXT,
			label: 'Company Name',
			container : 'g_primary'
		});

		form.addField({
			id: 'custpage_firstname',
			type: serverWidget.FieldType.TEXT,
			label: 'First Name',
			container : 'g_primary'
		});
		form.addField({
			id: 'custpage_lastname',
			type: serverWidget.FieldType.TEXT,
			label: 'Last Name',
			container : 'g_primary'
		});

		form.addField({
			id: 'custpage_email',
			type: serverWidget.FieldType.EMAIL,
			label: 'Email',
			container : 'g_primary'
		});

		form.addField({
			id: 'custpage_phone',
			type: serverWidget.FieldType.PHONE,
			label: 'Phone',
			container : 'g_primary'
		});
		//======================================================//
		var salesRepField = form.addField({
			id: 'custpage_salesrep',
			type: serverWidget.FieldType.SELECT,
			label: 'Sales Rep',
			source: 'salesrep',
			container : 'g_primary'
		});
		// Source the field from the SalesRep list
        salesRepField.addSelectOption({
            value: '',
            text: ''
        });

        // Load the sales rep list and add each as an option
        var salesReps = getSalesReps();
        salesReps.forEach(function(salesRep) {
            salesRepField.addSelectOption({
                value: salesRep.id,
                text: salesRep.name
            });
        });
		//======================================================//
		var subsiField = form.addField({
			id: 'custpage_subsi',
			type: serverWidget.FieldType.SELECT,
			label: 'Subsidiary',
			container : 'g_primary'
		});
		// Source the field from the SalesRep list
        subsiField.addSelectOption({
            value: '',
            text: ''
        });
		// Load the subsidiary list and add each as an option
        var subsiList = getSubsiList();
		// log.debug('subsiList ui',JSON.stringify(subsiList))
        subsiList.forEach(function(subsidiary) {
            subsiField.addSelectOption({
                value: subsidiary.id,
                text: subsidiary.name
            });
        });

		// ----- Add Field Group
		form.addFieldGroup({
			id : 'g_company',
			label : 'Customer Information',
		});
		//======================================================//
		form.addField({
			id: 'custpage_demestic',
			type: serverWidget.FieldType.SELECT,
			label: 'DEMESTIC/EXPORT',
			source: 'customlist_entity_dom_export_lists',
			container : 'g_company'
		});
		form.addField({
			id: 'custpage_custype',
			type: serverWidget.FieldType.SELECT,
			label: 'Customer Type',
			source: 'customlist_customer_type_lists',
			container : 'g_company'
		});
		//======================================================//
		var leadsrcField = form.addField({
			id: 'custpage_leadsrc',
			type: serverWidget.FieldType.SELECT,
			label: 'Lead Source',
			container : 'g_primary'
		});
		// Source the field from the leadsrcList list
        leadsrcField.addSelectOption({
            value: '',
            text: ''
        });
		// Load the leadsrc list and add each as an option
        var leadsrcList = getLeadSrcList();
		// log.debug('leadsrcList ui',JSON.stringify(leadsrcList))
        leadsrcList.forEach(function(leadsrc) {
            leadsrcField.addSelectOption({
                value: leadsrc.id,
                text: leadsrc.name
            });
        });

		var statusField = form.addField({
			id: 'custpage_customerstatus',
			type: serverWidget.FieldType.SELECT,
			label: 'Customer Status',
			container : 'g_primary'
		});
		// Source the field from the leadsrcList list
        statusField.addSelectOption({
            value: '',
            text: ''
        });
		// Load the leadsrc list and add each as an option
        var statusList = getCusStatus();
		// log.debug('statusList ui',JSON.stringify(statusList))
        statusList.forEach(function(cusstatus) {
            statusField.addSelectOption({
                value: cusstatus.id,
                text: cusstatus.name
            });
        });
		//======================================================//
		// ----- Add Field Group
		form.addFieldGroup({
			id : 'g_vatinfo',
			label : 'Vat Information',
		});
		//======================================================//
		// Add fields to the form
		form.addField({
			id: 'custpage_thllegalname',
			type: serverWidget.FieldType.TEXT,
			label: 'THL LEGAL NAME',
			container : 'g_vatinfo'
		});
		form.addField({
			id: 'custpage_thlvarregisno',
			type: serverWidget.FieldType.TEXT,
			label: 'THL VAT REGISTRATION NO.',
			container : 'g_vatinfo'
		});
		form.addField({
			id: 'custpage_thlbrchno',
			type: serverWidget.FieldType.TEXT,
			label: 'THL BRANCH NO.',
			container : 'g_vatinfo'
		});

		// Add a submit button
		form.addSubmitButton({
			label: 'Create Customer'
		});

		response.writePage(form);

	} else if(step == 'saveCustomer'){
		// ################################################################################################
		// ===== Define Variable
		// ################################################################################################
		
		// Process the form submission
		var firstName = params['custpage_firstname'];
		var lastName = params['custpage_lastname'];
		var email = params['custpage_email'];
		var phone = params['custpage_phone'];
		var comp_name = params['custpage_companyname'];
		var salesrep = params['custpage_salesrep'];
		var subsidiarySelect = params['custpage_subsi'];
		var leadsrc = params['custpage_leadsrc'];
		var demestic = params['custpage_demestic'];
		var custype = params['custpage_custype'];
		var thl_legalname = params['custpage_thllegalname'];
		var thl_vatno = params['custpage_thlvarregisno'];
		var thl_brnchno = params['custpage_thlbrchno'];

		try {
			// Create a new customer record
			var recObj = record.create({
				type: 'CUSTOMER',
				isDynamic: true
			});

			// recObj.setValue({
			// 	fieldId: 'firstname',
			// 	value: firstName
			// });
			// recObj.setValue({
			// 	fieldId: 'lastname',
			// 	value: lastName
			// });
			recObj.setValue({
				fieldId: 'email',
				value: email
			});
			recObj.setValue({
				fieldId: 'phone',
				value: phone
			});
			recObj.setValue({
				fieldId: 'companyname',
				value: comp_name
			});

			recObj.setValue({
				fieldId: 'custentity_thl_legalname',
				value: thl_legalname
			});
			recObj.setValue({
				fieldId: 'custentity_thl_vatregistrationno',
				value: thl_vatno
			});
			recObj.setValue({
				fieldId: 'custentity_thl_branchno',
				value: thl_brnchno
			});

			recObj.setValue({
				fieldId: 'salesrep',
				value: salesrep
			});
			recObj.setValue({
				fieldId: 'subsidiary',
				value: subsidiarySelect
			});
			recObj.setValue({
				fieldId: 'leadsource',
				value: leadsrc
			});
			recObj.setValue({
				fieldId: 'custentity_cust_type',
				value: custype
			});
			recObj.setValue({
				fieldId: 'custentity_dom_or_export',
				value: demestic
			});

			// Save the customer record
			var customerId = recObj.save();

			//===========================================================//
			//== 2 create contract ==//
			// Create a new customer record
			var conObj = record.create({
				type: 'CONTACT',
				isDynamic: true
			});

			conObj.setValue({
				fieldId: 'firstname',
				value: firstName
			});
			conObj.setValue({
				fieldId: 'email',
				value: email
			});
			conObj.setValue({
				fieldId: 'phone',
				value: phone
			});
			conObj.setValue({
				fieldId: 'subsidiary',
				value: subsidiarySelect
			});
			// Save the contact record
			var contactId = conObj.save();

			// Provide feedback to the user
			var form = serverWidget.createForm({
				title: 'Customer & Contact Created'
			});

			form.addField({
				id: 'custpage_message',
				type: serverWidget.FieldType.INLINEHTML,
				label: ' '
			}).defaultValue = 'Customer created successfully with ID: ' + customerId + "/" + contactId;

			form.addButton({
				id: 'custpage_back',
				label: 'Back',
				functionName: "window.history.back();"
			});

			response.writePage(form);

		} catch (e) {
			log.error({
				title: 'Error creating customer',
				details: e.message
			});

			var form = serverWidget.createForm({
				title: 'Error'
			});

			form.addField({
				id: 'custpage_message',
				type: serverWidget.FieldType.INLINEHTML,
				label: ' '
			}).defaultValue = 'Error creating customer: ' + e.message;

			form.addButton({
				id: 'custpage_back',
				label: 'Back',
				functionName: "window.history.back();"
			});

			response.writePage(form);
		}
	}

}

// Function to get the list of sales reps
function getSalesReps() {
	var salesReps = [];

	var filters = new Array();
	var columns = new Array();
	columns.push(search.createColumn({name: 'internalid',sort: search.Sort.ASC}));
	columns.push(search.createColumn({name: 'entityid'}));

	filters.push({
		name: 'isinactive',
		operator: search.Operator.IS,
		values: 'F'
	},
	{
		name: 'salesrep',
		operator: search.Operator.IS,
		values: 'T'
	});

	var searchResult = libCode.loadSavedSearch('employee',  null, filters, columns);

	searchResult.forEach(function(result) {
		salesReps.push({
			id: result.getValue('internalid'),
			name: result.getValue('entityid')
		});
	});

	log.debug('salesReps',JSON.stringify(salesReps))
	return salesReps;
}

// Function to get the list of status
function getSubsiList() {
	var subsiList = [];

	var filters = new Array();
	var columns = new Array();
	columns.push(search.createColumn({name: 'internalid',sort: search.Sort.ASC}));
	columns.push(search.createColumn({name: 'name'}));


	var searchResult = libCode.loadSavedSearch('subsidiary',  null, filters, columns);
	// log.debug('searchResult',JSON.stringify(searchResult))
	searchResult.forEach(function(result) {
		subsiList.push({
			id: result.getValue('internalid'),
			name: result.getValue('name')
		});
	});

	// log.debug('subsiList',JSON.stringify(subsiList))
	return subsiList;
}

// // Function to get the list of lead src
function getLeadSrcList() {
	var leadsrclist = [];

	var filters = new Array();
	var columns = new Array();
	columns.push(search.createColumn({name: 'internalid',sort: search.Sort.ASC}));
	columns.push(search.createColumn({name: 'title'}));


	var searchResult = libCode.loadSavedSearch('campaign',  null, filters, columns);
	// log.debug('searchResult',JSON.stringify(searchResult))
	searchResult.forEach(function(result) {
		leadsrclist.push({
			id: result.getValue('internalid'),
			name: result.getValue('title')
		});
	});

	// log.debug('leadsrclist',JSON.stringify(leadsrclist))
	return leadsrclist;
}

// // Function to get the list of getCusStatus src
function getCusStatus() {
	var cusstatusList = [];

	var filters = new Array();
	var columns = new Array();
	columns.push(search.createColumn({name: 'internalid',sort: search.Sort.ASC}));
	columns.push(search.createColumn({name: 'name'}));

	var searchResult = libCode.loadSavedSearch('customerstatus',  null, filters, columns);
	// log.debug('searchResult',JSON.stringify(searchResult))
	searchResult.forEach(function(result) {
		cusstatusList.push({
			id: result.getValue('internalid'),
			name: result.getValue('name')
		});
	});

	// log.debug('cusstatusList',JSON.stringify(cusstatusList))
	return cusstatusList;
}

