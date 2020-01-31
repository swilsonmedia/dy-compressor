(function($) {
	'use strict';

	function evaluator() {
		return ko && !!ko.dataFor(document.getElementById('promoCodeForm'));
	}

	function onReady() {
		var vm = ko.dataFor(document.getElementById('promoCodeForm')),
			oldSave = vm.save;

		vm.save = function() {
			oldSave.call(vm);
			$(document).ajaxComplete(function(event, xhr, settings) {
				if (settings.url === '/api/shoppingcart/getcartcostsummary') {
					if (/${Promo1}|${Promo2}/gi.test(vm.code())) {
						vm.messageHTML(
							'<div class="validation-summary-valid promoResponseMsg textLeft"><ul><li>Flax150 has been successfully applied. If your order is eligible, you will see this discount reflected with your next AutoShip SmartPaks shipment.</li></ul></div>'
						);
					}
				}
			});
		};
	}

	function waitFor(evaluator, callback) {
		var interval = null;

		if (evaluator()) {
			callback();
		} else {
			interval = setInterval(function() {
				if (evaluator()) {
					clearInterval(interval);
					interval = null;
					callback();
				}
			}, 100);
		}
	}

	waitFor(evaluator, onReady);
})(jQuery);
