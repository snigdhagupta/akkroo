(function(window) {

	// Email API
	// ========
	function sendEmail(toAddress, templateName, templateVars, cb) {
		// setTimeout to simulate server async call
		setTimeout(function() {
			var templates = {
				'registrationEmail' : function(templateVars) {
					return [
						'Hello '+templateVars.name+',',
						'Thanks for signing up for our mailing list with the email address: '+toAddress
					].join('\n');
				},
				'voucherCodeEmail' : function(templateVars) {
					return [
						'Hello '+templateVars.name+',',
						'Congratulations, you have one our great prize!',
						'To claim it please give this code to one of our staff members: '+templateVars.voucherCode
					].join('\n');
				}
			}

			var template = templates[templateName](templateVars);

			//This is were we would use the template that has been dynamically created using the
			//variables to send an email to the email address provided.

			console.log('Sending email to '+toAddress);
			console.log(template);
			console.log('Successfully sent to '+toAddress);

			return true;
		}, 1);
		cb(template);
	}

	// "Pick a Winner" API
	// ===================
	function generateVoucherCode(name, cb) {
	// setTimeout to simulate server async call
		setTimeout(function() {
			if (name === 'Dennis Davids') {
				return cb(null);
			} else if (name === 'Alan Adams') {
				var getRand = function() {
					return '8hgskidjhyejdnh7';
				};
				var voucher = getRand();
				console.log('New voucher code generated for ' + name + ': '+ voucher);
				return cb(voucher);
			}
		}, 1);
	}

	window.AkkrooAPI = {};
	window.AkkrooAPI.sendEmail = sendEmail;
	window.AkkrooAPI.generateVoucherCode = generateVoucherCode;
}(window));