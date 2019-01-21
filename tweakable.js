var onSave = null;
var onError = null;


var serverSide = null;
var tweak_httpProtocol = null;
var tweak_token = null;
var tweak_url = null;
var tweak_lara_model = null;

$(function() {
    jQuery.fn.extend({
        tweak: function(options) {
            var checkOptions = JSON.parse(JSON.stringify(options));

            if(options.debugging == true) {
                if(options.serverSide != true && options.serverSide != false) {
                    throw_error('Error: serverSide parameter requires a boolean value');
                }
                if(options.serverSide == true) {
                    if(options.debugging == true) {
                        if (!('url' in checkOptions) == 0) {
                            if(options.url == ''){
                                throw_error('Error: url does not have a value. ');
                            }
                        } else {
                            throw_error('Error: Declaration of url not found. A prerequisite of serverSide processing. ');
                        }

                        if (!('httpProtocol' in checkOptions) == 0) {
                            if(options.httpProtocol == '') {
                                throw_error('Error: method does not have a value. ');
                            } else {
                                if(options.httpProtocol != 'POST' && options.httpProtocol != 'GET') {
                                    throw_error('Error: httpProtocol only accepts POST or GET value.');
                                }

                                if(options.httpProtocol == 'POST') {
                                    if (!('_token' in checkOptions) == 0) {
                                        if(options._token == '') {
                                            throw_error('Error: _token does not have a value. ');
                                        }
                                    } else {
                                        throw_error('Error: Declaration of _token is required for POST serverSide request.');
                                    }
                                }
                            }
                        }else{
                            throw_error('Error: Declaration of method not found.A prerequisite of serverSide processing. ');
                        }
                    }
                }
            }

            if(options.serverSide != '' || options.serverSide != 'undefined') {
                serverSide = options.serverSide;
            }

            if(options.httpProtocol != '' || options.httpProtocol != 'undefined') {
                tweak_httpProtocol = options.httpProtocol;
            }

            if(options.url != '' || options.url != 'undefined') {
                tweak_url = options.url;
            }

            if(options.token != '' || options.token != 'undefined') {
                tweak_token = options.token;
            }

            if (!('laraModel' in checkOptions) == 0) {
                if(options.laraModel != '' || options.laraModel != 'undefined') {
                    tweak_lara_model = options.laraModel;
                }
            }

            //callback Functions
            if(options.onSave != '' || options.onSave != 'undefined') {
                onSave = options.onSave;
            } else if (options.onError != '' || options.onError != 'undefined') {
                onError = options.onError;
            }

            return this.each(function() {
                if(options.debugging == true){
                    if(typeof $(this).attr('data-tweak_id') === 'undefined') {
                        throw_error('Error: Declaration of tweak_id not found');
                    } else {
                        if($(this).attr('data-tweak_id').trim() == '') {
                            throw_error('Error: tweak_id does not contain any value');
                        }

                        var letters = /^[A-Za-z]+$/;
                        if($(this).attr('data-tweak_id').match(letters)) {
                            throw_error('Error: tweak_id accepts only integers');
                        }
                    }

                    if(typeof $(this).attr('data-tweak_field') === 'undefined'){
                        throw_error('Error: Declaration of tweak_field not found');
                    } else {
                        if($(this).attr('data-tweak_field').trim() == '') {
                            throw_error('Error: tweak_field does not contain any value');
                        }
                    }

                    if(typeof $(this).attr('data-input_type') === 'undefined') {
                        throw_error('Error: Declaration of tweak_input_type not found');
                    } else {
                        if($(this).attr('data-input_type') == '') {
                            throw_error('Error: tweak_input_type does not contain any value');
                        }
                    }

                    if($(this).attr('data-input_pattern') == '') {
                        throw_error('Error: dara-tweak_pattern does not contain any value.')
                    }

                    if($(this).attr('data-input_type') === "select" ) {
                        if(typeof $(this).attr('data-tweak_options') === 'undefined' || typeof $(this).attr('data-tweak_option_key') === 'undefined' || typeof $(this).attr('data-tweak_option_value') === 'undefined') {
                            throw_error(`Error: data-tweak_options, data-tweak_option_key and data-tweak_option_value attribute is required for 'Select' input type.`);
                        } else {
                            if($(this).attr('data-tweak_options') == '') {
                                throw_error('Error: data-tweak_options does not contain any value.');
                            } else if($(this).attr('data-tweak_option_key') == '') {
                                throw_error('Error: data-tweak_option_key does not contain any value.');
                            } else if ($(this).attr('data-tweak_option_value') == '') {
                                throw_error('Error: data-tweak_option_value does not contain any value.');
                            } else {
                                if(isValidJson(JSON.parse($(this).attr('data-tweak_options')))) {
                                    throw_error("Invalid json format for data-tweak_options.");
                                }
                            }
                        }
                    }
                }

                var init_tweakable = $(this).html().trim();
                var empty_placeholder =   $(this).attr('data-tweak_empty');

                if(init_tweakable == '') {
                    if(empty_placeholder == '') {
                        empty_placeholder = 'Empty';
                    }

                    $(this).html(empty_placeholder).addClass('empty-tweakable');
                }
            });
        },

    });


});

$(document).on('click','.tweakable',function() {
    $(this).hide();
    var tweakable = $(this);
    var input_type = $(this).attr('data-input_type');
    var tweak_pattern = $(this).attr('data-input_pattern');
    var tweak_options = $(this).attr('data-tweak_options');
    var tweak_option_key = $(this).attr('data-tweak_option_key');
    var tweak_option_value = $(this).attr('data-tweak_option_value');
    var tweak_id = $(this).attr('data-tweak_id');
    var tweak_field = $(this).attr('data-tweak_field');
    var value = $(this).html();
    var placeholder = '';


    if($(this).attr('data-tweak_placeholder') != '' || $(this).attr('data-tweak_placeholder') != 'undefined') {
        placeholder = $(this).attr('data-tweak_placeholder');
    }

    if($(this).hasClass('empty-tweakable')) {
        value = '';
    }

    if(input_type == 'text') {
        $(this).parent().append("<input type='"+input_type+"' data-tweak_field='"+ tweak_field +"' data-tweak_id='"+ tweak_id + "' value='"+ value +"' placeholder='"+ placeholder +"' class='tweakable-input w-100'>");
    } else if(input_type == 'select') {
        let json_data = JSON.parse(tweak_options);
        $(this).parent().append(`<select class="tweakable-input w-100 tweakable-select" data-tweak_field="${tweak_field}" data-tweak_id="${tweak_id}">${generateSelectOptions(json_data, tweak_option_key, tweak_option_value)}</select>`);
    } else if(input_type == 'email') {
        $(this).parent().append("<input type='"+input_type+"' data-tweak_field='"+ tweak_field +"' data-tweak_id='"+ tweak_id + "' value='"+ value +"' placeholder='"+ placeholder +"' class='tweakable-input w-100'>");
    }

    let tweakable_element = $(this).parent().find('.tweakable-input');

    tweakable_element.on('blur', function() {
        $(this).trigger(
            jQuery.Event('keydown', {
                keyCode: 13, which: 13
            })
        );
    });

    tweakable_element.on('keydown', function(e) {
        if(input_type == 'select') {
            e.preventDefault();
        }

        if(e.keyCode == 13) {
            var tweak_input = $(this);
            var pattern = tweak_input.prev().attr('data-input_pattern');

            if(serverSide == true) {
                $.ajax({
                    url: tweak_url,
                    type: tweak_httpProtocol,
                    data: {
                        lara_model: tweak_lara_model,
                        data_id: tweak_id,
                        field_name: tweak_field,
                        value: tweak_input.val(),
                        _token: tweak_token,
                    },
                    success:function(response) {
                        onSave(response);

                        switch(input_type) {
                            case 'text': {
                                if(tweak_input.val().trim() == '') {
                                    return false;
                                } else {
                                    tweakable.html(tweak_input.val().trim());
                                }
                                break;
                            }
                            case 'select': {
                                tweakable.html(tweak_input.children('option:selected').text());
                                break;
                            }
                            case 'email': {
                                if(isValidEmail(tweak_input.val().trim())) {
                                    tweakable.html(tweak_input.val().trim());
                                    break;
                                } else {
                                    return false;
                                }
                            }
                        }

                        if(tweak_input.val() != '') {
                            tweakable.removeClass('empty-tweakable');
                        } else {
                            tweakable.addClass('empty-tweakable');

                            if(tweakable.attr('data-tweak_empty') != '' || tweakable.attr('data-tweak_empty') != 'undefined') {
                                tweakable.html(tweakable.attr('data-tweak_empty'));
                            } else {
                                tweakable.html('Empty');
                            }
                        }

                        tweak_input.remove();
                        tweakable.show();
                    }
                });
            }
        }
    });

    return false;
});

/*UTILITY FUNCTIONS*/
let maskInput = (str, pattern) => {
    let separator = pattern.split('x').filter(v => v != '');

    let unique_separator = separator.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });

    let _pattern = pattern.split('-');

    let output = ``;
    let index = 0;
    $.each(_pattern, function(pattern_k, pattern_v) {
        output += str.substring(index, pattern_v.length + 1) + (_pattern.length == pattern_k + 1 ? '' : '-');
        index += pattern_v.length + 2;
    });


    return output;
};

let throw_error = (message) => {
    throw message;
};

let isValidJson = (json) => {
    try {
        JSON.parse(json);
    }  catch (e) {
        return false;
    }
    return true;
};

let isNumeric = (str) => {
    return !isNaN(str);
};

let generateSelectOptions = (json, data_key, data_value) => {
    let options = ``;
    $.each(json, function(key, value) {
        options += `<option value="${ (isNumeric(data_key) ? capitalize(value[data_key].toLowerCase()) : value[data_key]) }">${ capitalize(value[data_value].toLowerCase()) }</option>`;
    });

    return options;
};

let capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

let isValidEmail = (email) => {
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
};
/*END*/

/**/
//line 224 if(pattern == '' || typeof pattern === 'undefined') { tweakable.html(tweak_input.val());}else{tweakable.html(maskInput(tweak_input.val(), pattern));}

/**/
// var input_text = '';
// if(input_type === 'text') {
//     if(pattern == '' || typeof pattern === 'undefined') {
//         input_text = tweak_input.val();
//     } else {
//         input_text = maskInput(tweak_input.val(), pattern);
//     }
// } else {
//     input_text = tweak_input.val();
// }
