/* input widgets */
(function( $ ) {
	/* normal inputs */
	$.widget( "upc-form.input", {
		options: {
			'defaultValue': ''
		},

		_create: function() {
			var self = this;

			self.input = self.element;
			self.inputWrapper = self.input.closest('.input-wrapper');
			self.tabindex = self.input.attr('tabindex');

			if(self.input.attr('disabled')){
				self.inputWrapper.addClass('disabled');
			}

			self.input.on('enable.upc-form', function(){
				self.inputWrapper.removeClass('disabled');
				self.input.attr({'disabled': false, 'tabindex': self.tabindex});
			}).on('disable.upc-form', function(){
				self.inputWrapper.addClass('disabled');
				self.input.attr({'disabled': true, 'tabindex': '-1'});
			}).on('focusin', function(){
				self.inputWrapper.addClass('active').removeClass('default').trigger('focused.upc-form');
			}).on('focusout', function(){
				self.inputWrapper.removeClass('active').trigger('blured.upc-form');
			});

			self.input.placeholder();
		},

		destroy: function() {
			$.Widget.prototype.destroy.call( this );
		}
	});

	/* textareas */
	$.widget( "upc-form.textarea", {
		options: {},

		_create: function() {
			var self = this;

			self.textarea = self.element;
			self.textareaWrapper = self.textarea.closest('.textarea-wrapper');
			self.tabindex = self.textarea.attr('tabindex');

			self.counter = self.textareaWrapper.nextAll('.textarea-counter');

			if(self.textarea.attr('maxLength')){
				self.counter.html(self.counter.html().replace(/\[COUNTER\]/, '<span class="counter"></span>'));
			} else {
				self.counter.hide();
			}

			if(self.textarea.attr('disabled')){
				self.textareaWrapper.addClass('disabled');
			}

			self.textarea.on('keyup change', function(){
				self.counter.find('.counter').text(self._internalHelpers.remaining(self.textarea));
			}).on('enable.upc-form', function(){
				self.textareaWrapper.removeClass('disabled');
				self.textarea.attr({'disabled': false, 'tabindex': self.tabindex});
			}).on('disable.upc-form', function(){
				self.textareaWrapper.addClass('disabled');
				self.textarea.attr({'disabled': true, 'tabindex': '-1'});
			}).on('focusin', function(){
				self.textareaWrapper.addClass('active').trigger('focused.upc-form');
			}).on('focusout', function(){
				self.textareaWrapper.removeClass('active').trigger('blured.upc-form');
			}).change();

			self.textarea.placeholder();
		},

		destroy: function() {
			this.counter.show();
			$.Widget.prototype.destroy.call( this );
		},

		_internalHelpers: {
			remaining: function(textarea){
				return (textarea.attr('maxlength') - textarea.val().replace(/\r?\n/g, '\r\n').length);
			}
		}
	});

	/* radiobuttons */
	$.widget( "upc-form.radiobutton", {
		options: {
		},

		_create: function(){
			var self = this;

			self.radio = self.element;
			self.label = self.radio.next('label');
			self.tabindex = self.radio.attr('tabindex');

			self.wrapper = self.radio.closest('.radiobutton-wrapper');
			self.radioWrapper = self.radio.closest('td');

			self.index = self.wrapper.find("input:radio").index(self.radio);

			if(self.radio.attr('disabled')){
				self.radioWrapper.addClass('disabled');
			}

			self.radio.on('change', function(ev){
				if(self.radio.is(':checked')){
					self.radioWrapper.addClass('active');

					self.wrapper.find('input:radio').not(self.radio).each(function(){
						$(this).closest('td').removeClass('active');
					});
				}
			}).on('enable.upc-form', function(){
				self.radioWrapper.removeClass('disabled');
				self.radio.attr({'disabled': false, 'tabindex': self.tabindex});
			}).on('disable.upc-form', function(){
				self.radioWrapper.addClass('disabled');
				self.radio.attr({'disabled': true, 'tabindex': '-1'});
			}).change();
		},

		destroy: function(){

		},

		_internalHelpers: {
		}
	});

	/* checkboxes */
	$.widget( "upc-form.checkbox", {
		options: {

		},

		_create: function(){
			var self = this;

			self.checkbox = self.element;
			self.label = self.checkbox.next('label');
			self.tabindex = self.checkbox.attr('tabindex');

			self.wrapper = self.checkbox.closest('.checkbox-wrapper');
			self.checkboxWrapper = self.checkbox.closest('td');

			if(self.checkbox.attr('disabled')){
				self.checkboxWrapper.addClass('disabled');
			}

			self.checkbox.on('change', function(ev){
				if(self.checkbox.is(':checked')){
					self.checkboxWrapper.addClass('active');
				} else {
					self.checkboxWrapper.removeClass('active');
				}
			}).on('disable.upc-form', function(){
				self.checkbox.attr('disabled', true);
				self.checkboxWrapper.addClass('disabled');
			}).on('enable.upc-form', function(){
				self.checkbox.attr('disabled', false);
				self.checkboxWrapper.removeClass('disabled');
			}).change();
		},

		destroy: function(){

		},

		_internalHelpers: {

		}
	});

	/* select dropdowns */
	$.widget( "upc-form.dropdown", {
		options: {
			'maxLength': 8
		},

		_create: function() {
			var self = this;

			self.select = self.element.hide();
			self.tabindex = self.select.attr('tabindex');

			self.valueWrapper = self.select.closest('.select-wrapper').attr('tabindex', self.tabindex).disableSelection();
			self.value = self.valueWrapper.find('label');
			self.button = self.valueWrapper.find('.select-button');

			self.dropdownWrapper = $('<span></span>').addClass('select-dropdown-wrapper').hide().appendTo(self.valueWrapper);
			self.dropdown = $('<span></span>').addClass('select-dropdown').appendTo(self.dropdownWrapper);

			self.select.insertBefore(self.valueWrapper);

			self.values = self.select.children(':selected');
			self.allValues = self.select.children('option');

			self.isHidden = true;
			self.hasFocus = false;
			self.height = 0;

			self.showDropdown = function(callback){
				if(self.isHidden){
					self.isHidden = false;
					self.dropdownWrapper.show();

					var selected = self.dropdown.find('.selected');

					var scrollTop = selected.length > 0 ? selected.position().top : 0;

					self.dropdown.scrollable({'scrollTop':scrollTop});

					self.dropdownWrapper.position({
						'of': self.valueWrapper,
						'my': 'left top',
						'at': 'left top',
						'offset': '0'
					});

					self.valueWrapper.focus();
				}
			}

			self.hideDropdown = function(callback){
				if(!self.isHidden){
					self.isHidden = true;
					self.dropdownWrapper.hide();
					self.dropdown.scrollable('destroy');
				}
			};

			self.setValue = function(element){
				if(element.length > 0){
					self.select.val(element.data('value'));
					self.value.text(element.data('text'));
					self.select.trigger('selected.upc-form');
				}
			}

			self.allValues.each(function(i,el){
				var option = $(el);
				if(option.val() != ''){
					var $o = $('<span></span>').text(option.text()).addClass('select-dropdown-item').click(function(ev){
						ev.preventDefault();
						ev.stopPropagation();

						$(this).addClass('selected').siblings().removeClass('selected');

						self.setValue($(this));

						self.hideDropdown();
						self.valueWrapper.focus();
					}).data({'value':option.attr('value'),'text':option.text()}).appendTo(self.dropdown).hover(function(){
						$(this).addClass('hover').siblings('span.hover').removeClass('hover');
					},function(){
						$(this).removeClass('hover').siblings('span.hover').removeClass('hover');
					});

					if(option.attr('selected')){
						$o.addClass('selected');
					}
				}
				if(option.attr('selected')){
					self.value.text(option.text());
				}
			});

			self.valueWrapper.click(function(ev){
				self.valueWrapper.focus();

				self.showDropdown();

				ev.preventDefault();
			}).focusin(function(ev){
				if(!self.hasFocus){
					self.valueWrapper.off('keydown');
					self.valueWrapper.on('keydown', function(ev){
						if(ev.which == 40){
							if(self.isHidden){
								self.showDropdown();
							} else {
								var index = self.dropdown.find('span.hover').index() + 1;
								var children = self.dropdown.find('span');
								if(index < children.length){
									children.eq(index - 1).removeClass('hover');
									children.eq(index).addClass('hover');
									self.dropdown.data('scrollable').showElement(children.eq(index));
								}
							}
							ev.preventDefault();
						} else if(!self.isHidden){
							if(ev.which == 9){
								self.setValue(self.dropdown.find('span.hover'));
								self.valueWrapper.focus();
							}
							if(ev.which == 38){
								var index = self.dropdown.find('span.hover').index() - 1;
								var children = self.dropdown.find('span');
								if(index >= 0){
									children.eq(index + 1).removeClass('hover');
									children.eq(index).addClass('hover');
									self.dropdown.data('scrollable').showElement(children.eq(index));
								}
								ev.preventDefault();
							}
							if(ev.which == 13){
								self.setValue(self.dropdown.find('span.hover'));
								self.hideDropdown();
								self.valueWrapper.focus();
							}
							if(ev.which == 27){
								self.hideDropdown();
								self.valueWrapper.focus();
							}
						} else if(ev.which != 9){
							ev.preventDefault();
						}

					});
					self.valueWrapper.addClass('focused').trigger('focused.upc-form');
				}
			}).focusout(function(ev){
				if(!(self.valueWrapper.get(0) == document.activeElement || $.contains(self.valueWrapper.get(0), document.activeElement))){
					self.hideDropdown();
					self.select.blur();
					self.valueWrapper.off('keydown');
					self.hasFocus = false;

					self.valueWrapper.removeClass('focused').trigger('blured.upc-form');
				}
			});

			self.select.on('refresh.upc-form', function(){
				var $opt = self.select.find('option:selected'),
					i = $opt.index();

				if(i > 0){
					self.dropdown.find('.select-dropdown-item').eq(i-1).trigger("click");
				} else {
					self.dropdown.find('.select-dropdown-item').removeClass('selected');
					self.value.text($opt.text());
				}
			});
		},

		destroy: function() {
			this.element.prependTo(this.valueWrapper);
			this.dropdownWrapper.remove();
			$.Widget.prototype.destroy.call( this );
		}
	});

	/* date input fields */
	$.widget( "upc-form.date", {
		options: {
			'defaultValue': 'dd.mm.yyyy',
			'separator': '.',
			'disableDays': [],
			'disableDates': [],
			'datepicker': {
				'dateFormat': 'd.m.yy',
				'changeMonth': false,
				'changeYear': false,
				'yearRange': '-5:+5',
				'maxDate': '+5y',
				'minDate': '-5y',
				'disabled': false,
				'firstDay': 1
			}
		},

		_create: function(){
			var self = this;

			self.input = self.element.hide();

			if(!self._internalHelpers.checkDate(self.input.val())){
				self.input.val('');
			}

			self.tabindex = parseInt(self.input.attr('tabindex'),10);
			self.dateWrapper = self.input.closest('.date-wrapper');
			self.button = self.dateWrapper.find('.date-button').attr('tabindex', -1);
			self.dateDay = $('<input type="text" placeholder="dd"/>').attr('tabindex', -1).addClass('date-day ignore').insertBefore(self.button).placeholder();
			self.dateMonth = $('<input type="text" placeholder="mm"/>').attr('tabindex', -1).addClass('date-month ignore').insertBefore(self.button).placeholder();
			self.dateYear = $('<input type="text" placeholder="yyyy"/>').attr('tabindex', -1).addClass('date-year ignore').insertBefore(self.button).placeholder();

			self.lastValue = self.input.val();
			self.prevValue = self.lastValue;

			//self.date = null;
			self.day = null;
			self.month = null;
			self.year = null;

			self.defaults = self.options.defaultValue.split(self.options.separator);

			self.hasFocus = false;
			self.hasChanged = false;
			self.disabled = self.input.attr('disabled') || false;
			self.initial = true;

			$('<span>' + self.options.separator + '</span>').addClass('date-separator').insertAfter(self.dateDay).clone().insertAfter(self.dateMonth);

			self.input.on('date.upc-form', function(){
				self.lastValue = self.day + self.options.separator + self.month + self.options.separator + self.year;
				self.hasChanged = true;
				$(this).trigger('internal-change');
			}).on('internal-change', function(){
				var $this = $(this);
				var v = self.lastValue.split(self.options.separator);

				if(v[0]){
					self.day = v[0];
					self.dateDay.val(self.day).removeClass('default');
				} else {
					self.day = '';
					self.dateDay.val('');
				}

				if(v[1]){
					self.month = v[1];
					self.dateMonth.val(self.month).removeClass('default');
				} else {
					self.month = '';
					self.dateMonth.val('');
				}

				if(v[2]){
					self.year = v[2];
					self.dateYear.val(self.year).removeClass('default');
				} else {
					self.year = '';
					self.dateYear.val('');
				}

				$this.val((v[0] && v[1] && v[2]) ? self.lastValue : '');

				if (self.prevValue !== self.lastValue) {
					self.prevValue = self.lastValue;
					$this.change();
				}
			});

			self.dateDay.on('focusin', function(ev){
				if(!self.disabled){
					if(!self.dateWrapper.hasClass('no-button')){
						self.input.datepicker('setDate', self.input.val()).datepicker('show');
					}

					self.hasFocus = true;
					self._internalHelpers.offInputs(self);
					this.hasChanged = false;

					var $this = $(this).removeClass('default');

					if($this.val() == self.defaults[0]){
						$this.val('');
					} else {
						$this.caret({start: 0, end: 2})
					}

					$this.on('keypress', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(ev.which > 30 && ((vl == 2 && caret.start == caret.end) || ev.which < 48 || ev.which > 57)){
							ev.preventDefault();
						} else {
							this.hasChanged = true;
						}
					}).on('keydown', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(ev.which == 39 && caret.end == vl){
							ev.preventDefault();
							self.dateMonth.focus();
						}
						if(ev.which == 9){
							self.dateWrapper.focus();
						}
					}).on('keyup', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(caret.end == 2 && ((ev.which >= 48 && ev.which <= 57) || (ev.which >= 96 && ev.which <= 105)) && this.hasChanged){
							ev.preventDefault();
							self.dateMonth.focus();
						}
					});
				}
			}).on('focusout', function(){
				if(!self.disabled){
					var $inp = $(this).off('keypress keydown keyup');

					if ($inp.val().length && !isNaN($inp.val())) {
						if($inp.val().length == 1){
							$inp.val(self._internalHelpers.padLeft(parseInt($inp.val(),10),2));
						}
						if(self.day != $inp.val()){
							self.day = $inp.val();
							self.input.trigger('date.upc-form');
						}
					}
					self.day = $inp.val();
					self.input.trigger('date.upc-form');
				}
			});

			self.dateMonth.on('focusin', function(){
				if(!self.disabled){
					if(!self.dateWrapper.hasClass('no-button')){
						self.input.datepicker('setDate', self.input.val()).datepicker('show');
					}

					self.hasFocus = true;
					self._internalHelpers.offInputs(self);
					this.hasChanged = false;

					var $this = $(this).removeClass('default');

					if($this.val() == self.defaults[1]){
						$this.val('');
					} else {
						$this.caret({start: 0, end: 2})
					}

					$this.on('keypress', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(ev.which > 30 && ((vl == 2 && caret.start == caret.end) || ev.which < 48 || ev.which > 57)){
							ev.preventDefault();
						} else {
							this.hasChanged = true;
						}
					}).on('keydown', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(ev.which == 39 && caret.end == vl){
							ev.preventDefault();
							self.dateYear.focus();
						}
						if(ev.which == 37 && caret.start == 0){
							ev.preventDefault();
							self.dateDay.focus();
						}
						if(ev.which == 9){
							self.dateWrapper.focus();
						}
					}).on('keyup', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(caret.end == 2 && ((ev.which >= 48 && ev.which <= 57) || (ev.which >= 96 && ev.which <= 105)) && this.hasChanged){
							ev.preventDefault();
							self.dateYear.focus();
						}
					});
				}
			}).on('focusout', function(){
				if(!self.disabled){
					var $inp = $(this).off('keypress keydown keyup');

					if ($inp.val().length && !isNaN($inp.val())) {
						if($inp.val().length == 1){
							$inp.val(self._internalHelpers.padLeft(parseInt($inp.val(),10),2));
						}
						if(self.month != $inp.val()){
							self.month = $inp.val();
							self.input.trigger('date.upc-form');
						}
					}
					self.month = $inp.val();
					self.input.trigger('date.upc-form');
				}
			});

			self.dateYear.on('focusin', function(){
				if(!self.disabled){
					if(!self.dateWrapper.hasClass('no-button')){
						self.input.datepicker('setDate', self.input.val()).datepicker('show');
					}

					self.hasFocus = true;
					self._internalHelpers.offInputs(self);

					var $this = $(this).removeClass('default');

					if($this.val() == self.defaults[2]){
						$this.val('');
					} else {
						$this.caret({start: 0, end: 4})
					}

					$this.on('keypress', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(ev.which > 30 && ((vl == 4 && caret.start == caret.end) || ev.which < 48 || ev.which > 57)){
							ev.preventDefault();
						} else {
							this.hasChanged = true;
						}
					}).on('keydown', function(ev){
						var $this = $(this),
							caret = $this.caret(),
							vl = $this.val().length;
						if(ev.which == 37 && caret.start == 0){
							ev.preventDefault();
							self.dateMonth.focus();
						}
						if(ev.which == 9){
							self.dateWrapper.focus();
						}
					});
				}
			}).on('focusout', function(){
				if(!self.disabled){
					var $inp = $(this).off('keypress keydown');

					if ($inp.val().length && !isNaN($inp.val())) {
						if($inp.val().length < 4){
							$inp.val(self._internalHelpers.padLeft(parseInt($inp.val(),10),2));
						}
						if(self.year != $inp.val()){
							self.year = $inp.val();
							self.input.trigger('date.upc-form');
						}
					}
					self.year = $inp.val();
					self.input.trigger('date.upc-form');
				}
			});

			self.dateWrapper.on('focusin', function(ev){
				if(!self.disabled){
					if(!self.hasFocus && ev.target == this){
						// self.input.change();
						self.input.trigger('internal-change');
						self.dateDay.focus();
					}

					if(self.initial){
						self.initial = false;
						$('body').off('focusin.upc-form').on('focusin.upc-form', function(ev){
							if(self.dateWrapper.get(0) != document.activeElement && !$.contains(self.dateWrapper.get(0), document.activeElement)){
								$('body').off('focusin.upc-form');
								if(!self.disabled && self.hasChanged){
									self.hasChanged = false;
								}

								self.dateDay.off('keypress keyup keydown');
								self.dateMonth.off('keypress keyup keydown');
								self.dateYear.off('keypress keydown');

								self.hasFocus = false;
								self.initial = true;

								self.dateWrapper.removeClass('active').trigger('blured.upc-form');

								if(!self.dateWrapper.hasClass('no-button')){
									self.input.datepicker('hide');
								}

								// For validation support
								self.input.blur();
							}
						});
					}
					self.dateWrapper.addClass('active').trigger('focused.upc-form');
				}
			});

			self.input.prependTo(self.dateWrapper).on('disable.upc-form', function(){
				self.input.addClass('disabled').attr('disabled',true);
				self.dateWrapper.addClass('disabled').attr('tabindex', '-1');
				self.disabled = true;
				self.dateDay.attr('disabled', true);
				self.dateMonth.attr('disabled', true);
				self.dateYear.attr('disabled', true);
			}).on('enable.upc-form', function(){
				self.input.removeClass('disabled').attr('disabled', false);
				self.dateWrapper.removeClass('disabled').attr('tabindex', self.tabindex);
				self.disabled = false;
				self.dateDay.removeAttr('disabled');
				self.dateMonth.removeAttr('disabled');
				self.dateYear.removeAttr('disabled');
			});

			if(self.disabled){
				self.input.trigger('disable.upc-form');
			} else {
				self.input.trigger('enable.upc-form');
			}


			if(self.dateWrapper.hasClass('no-button')){
				self.button.on('click', function(){
					self.dateDay.focus();
				});
			} else {
				self.button.on('click', function(ev){
					if(!self.disabled){
						self.input.datepicker('setDate', self.input.val()).datepicker('show');
						self.hasFocus = true;
					}
				});

				self.input.datepicker(
					$.extend({
						'beforeShow': function(inp, inst){
							inst.dpDiv.appendTo(self.dateWrapper).attr('tabindex',-1);
						},
						'afterShow': function(inp, inst){
							inst.dpDiv.show().position({
								'of': self.dateWrapper,
								'my': 'left top',
								'at': 'left bottom',
								'offset': '0 -1',
								'collision': 'none'
							});
						},
						'beforeShowDay': function(date){
							var ret = [true, ''];

							if($.inArray(date.getDay(), self.options.disableDays) >= 0){
								ret[0] = false;
							}
							for(var d = 0 ; d < self.options.disableDates.length ; d++){
								var dd = self._internalHelpers.parseDate(self.options.disableDates[d]);
								if(date.getDate() == dd.getDate() && date.getMonth() == dd.getMonth() && date.getFullYear() == dd.getFullYear()){
									ret[0] = false;
								}
							}

							return ret;
						},
						'onSelect': function(dateStr, inst){
							if(dateStr){
								var v = dateStr.split(self.options.separator);
								self.day = self._internalHelpers.padLeft(v[0], 2);
								self.month = self._internalHelpers.padLeft(v[1], 2);
								self.year = v[2];

								self.input.trigger('date.upc-form');
							}

							self.dateWrapper.focus();
						}},
						self.options.datepicker
					)
				);
			}
		},

		_init: function(){
			this.input.trigger('internal-change');
		},

		destroy: function(){
			this.dateWrapper.remove();
			this.element().show();
			$.Widget.prototype.destroy.call( this );
		},

		_internalHelpers: {
			parseDate: function(timeStr){
				var n = timeStr.split('.');
				if(n.length != 3) return null;
				if(parseInt(n[0],10) > 0 && parseInt(n[1],10) > 0 && parseInt(n[2],10) > 0){
					return new Date(parseInt(n[2],10), parseInt(n[1],10) - 1, parseInt(n[0],10));
				}
				return null;
			},
			checkDate: function(timeStr){
				var date = this.parseDate(timeStr);
				if(date == null) return false;
				var n = timeStr.split('.');

				return (date.getFullYear() == parseInt(n[2],10)
						&& date.getMonth() == parseInt(n[1],10) - 1
						&& date.getDate() == parseInt(n[0],10));
			},
			padLeft: function (number, length) {
				var str = number.toString(10);
				while (str.length < length) {
					str = '0' + str;
				}
				return str;
			},
			offInputs: function(self){
				self.dateDay.off('keypress keydown keyup');
				self.dateMonth.off('keypress keydown keyup');
				self.dateYear.off('keypress keydown keyup');
			}
		}
	});

	/* date input fields */
	$.widget( "upc-form.tooltip", {
		options: {},

		_create: function(){
			var self = this;

			self.tooltip = self.element.data('tooltip-selector') ? $(self.element.data('tooltip-selector')) : self.element.next('.tooltip-target');
			self.position = self.element.data('tooltip-position') || "right";

			switch(self.position){
				case 'top':
					self.config = {
						'of': self.element,
						'my': 'center bottom',
						'at': 'center top',
						'offset': '0 0',
						'collision': 'flip'
					}
					self.tooltip.addClass('pos-top');
					$('<div class="arrow"></div>').appendTo(self.tooltip);
					break;
				case 'bottom':
					self.config = {
						'of': self.element,
						'my': 'center top',
						'at': 'center bottom',
						'offset': '0 0',
						'collision': 'flip'
					}
					self.tooltip.addClass('pos-bottom');
					$('<div class="arrow"></div>').prependTo(self.tooltip);
					break;
				case 'left':
					self.config = {
						'of': self.element,
						'my': 'right center',
						'at': 'left center',
						'offset': '0 0',
						'collision': 'flip'
					}
					self.tooltip.addClass('pos-left');
					$('<div class="arrow"></div>').appendTo(self.tooltip).height(self.tooltip.height());
					break;
				case 'right':
					self.config = {
						'of': self.element,
						'my': 'left center',
						'at': 'right center',
						'offset': '0 0',
						'collision': 'flip'
					}
					self.tooltip.addClass('pos-right');
					$('<div class="arrow"></div>').prependTo(self.tooltip).height(self.tooltip.height());
					break;
			}

			if(self.tooltip.length > 0){
				self.element.hover(function(ev){
					self.tooltip.show().position(self.config);
				}, function(ev){
					self.tooltip.hide();
				}).click(false);
			}
		},

		destroy: function(){
			this.options.uninstallTrigger(this.tooltip);
			this.element.unwrap();
			$.Widget.prototype.destroy.call( this );
		}
	});

	/* scrollable */
	$.widget( "upc-form.scrollable", {
		options: {
			'minHeight': 18,
			'scrollTop': 0
		},

		_create: function(){
			var self = this;

			self.scrollTo = $.noop;
			self.moveTo = $.noop;
			self.showElement = $.noop;

			self.scrollable = self.element.addClass('scrollable');

			self.height = self.scrollable.height() + self._internalHelpers.innerHeight(self.scrollable);
			self.realHeight = self.scrollable.prop("scrollHeight");

			if(self.height < self.realHeight){

				self.barWrapper = $('<div></div>').addClass('scrollable-wrapper').height(self.height);
				self.bar = $('<div></div>').addClass('scrollable-bar').appendTo(self.barWrapper);

				self.scrollable.after(self.barWrapper);

				self.barHeight = Math.max(Math.round(self.height * self.height / self.realHeight), self.options["minHeight"]);
				self.barOuterHeight = self._internalHelpers.outerHeight(self.bar);
				self.barInnerHeight = self._internalHelpers.innerHeight(self.bar);

				self.fullH = self.height - self.barHeight - self.barInnerHeight;

				self.isHovering = false;

				self.bar.height(self.barHeight - self.barOuterHeight - self.barInnerHeight).hover(function(){
					self.bar.addClass('hover');
					self.isHovering = true;
				}, function(){
					self.bar.removeClass('hover');
					self.isHovering = false;
				}).on('mousedown', function(ev){
					ev.preventDefault();

					var offsetTop = self.scrollable.offset().top;
					var scrollTop = $(window).scrollTop();
					var parentTop = offsetTop - scrollTop - self._internalHelpers.outerHeight(self.scrollable) / 2;
					var barTop = ev.clientY - parentTop - self._internalHelpers.innerHeight(self.scrollable) / 2 - parseInt(self.bar.css('top') || 0) + self._internalHelpers.innerHeight(self.barWrapper) / 2;

					$('html').disableSelection().on('mousemove.upc-form', function(ev){
						ev.preventDefault();

						var moveTop = Math.min(Math.max(0, ev.clientY - parentTop - barTop), self.fullH);
						self.moveTop(moveTop);

					}).on('mouseup.upc-form', function(ev){
						ev.preventDefault();

						if(!self.isHovering){
							self.bar.removeClass('hover');
						}

						$('html').off('mouseup.upc-form mousemove.upc-form').enableSelection();

					});
				}).click(function(ev){
					ev.preventDefault();
					ev.stopPropagation();
				}).disableSelection();

				self.scrollable.on('mousewheel.upc-form', function(ev, delta, deltaX, deltaY){
					ev.preventDefault();

					deltaY = (deltaY || delta) * 100;

					var scroll = Math.min(Math.max(self.scrollable.scrollTop() - deltaY, 0), self.realHeight - self.height);
					self.scrollTo(scroll);
				});

				self.scrollTo = function(scroll){
					self.bar.stop();
					self.scrollable.stop();

					scroll = Math.min(Math.max(0, scroll), self.realHeight - self.height);
					var moveTop = self._internalHelpers.moveTop.call(self,scroll) + self._internalHelpers.innerHeight(self.barWrapper) / 2;

					self.bar.animate({'top': moveTop}, { duration: 100, queue: false });
					self.scrollable.animate({'scrollTop': scroll}, { duration: 100, queue: false });
				}

				self.moveTop = function(moveTop){
					var scroll = self._internalHelpers.scrollTop.call(self,moveTop);
				  	moveTop += self._internalHelpers.innerHeight(self.barWrapper) / 2;

					self.bar.addClass('hover').css('top', moveTop+'px');
					self.scrollable.scrollTop(scroll);
				}

				self.showElement = function(elem){
					var pos = elem.position(),
						top = self.scrollable.scrollTop();
					if(pos.top < 0){
						self.scrollTo(top + pos.top);
					} else {
						var height = self._internalHelpers.innerHeight(elem) + elem.height();
						if(pos.top + height > self.height){
							self.scrollTo(top + pos.top + height - self.height);
						}
					}
				}

				self.scrollTo(self.options['scrollTop']);

				self.barWrapper.position({
					'of': self.scrollable,
					'my': 'right top',
					'at': 'right top',
					'offset': '' + (self._internalHelpers.outerHeight(self.scrollable) / 2) + ''
				});
			}
		},

		_internalHelpers: {
			outerHeight: function(el){
				return (parseInt(el.css('margin-top'))
										+ parseInt(el.css('margin-bottom'))
										+ (parseInt(el.css('border-top-width')) || 0)
										+ (parseInt(el.css('border-bottom-width')) || 0));
			},
			innerHeight: function(el){
				return (parseInt(parseInt(el.css('padding-top')) + parseInt(el.css('padding-bottom'))));
			},
			scrollTop: function(moveTop){
				return Math.round(moveTop  / this.fullH * (this.realHeight - this.height));
			},
			moveTop: function(scrollTop){
				return Math.round(scrollTop * this.fullH / (this.realHeight - this.height));
			}
		},

		destroy: function(){
			if(this.barWrapper){
				this.barWrapper.remove();
				this.bar.off();
				this.scrollable.off('mousewheel.upc-form');
				$('html').off("mouseup.upc-form mousemove.upc-form");
				this.element.removeClass('scrollable');
			}
			$.Widget.prototype.destroy.call( this );
		}

	});
})( jQuery );

jQuery.hook('addClass removeClass');

/* modify datepicker, add after show */
$.datepicker._showDatepicker = (function(fn){
	return function(){
		fn.apply(this, arguments);
		var input = arguments[0],
			inst = $.datepicker._getInst(input),
			afterShow = $.datepicker._get(inst, 'afterShow');
		if(afterShow){
			afterShow.apply(input, [input, inst]);
		}
	}
})($.datepicker._showDatepicker);

