var onSave = null;


var serverSide = null;
var tweak_httpProtocol = null;
var tweak_token = null;
var tweak_url = null;
var tweak_lara_model = null;

$(function() {
    jQuery.fn.extend({
        tweak: function(options) {
            var checkOptions = JSON.parse(JSON.stringify(options));

            if(options.debugging == true){
                if(options.serverSide != true && options.serverSide != false){
                    console.log('Error: serverSide parameter requires a boolean value');
                }
                if(options.serverSide == true){


                    if(options.debugging == true) {
                        if (!('url' in checkOptions) == 0)
                        {
                            if(options.url == ''){
                                console.log('Error: url does not have a value. ');
                            }
                        }else{
                            console.log('Error: Declaration of url not found.A prerequisite of serverSide processing. ');
                        }

                        if (!('httpProtocol' in checkOptions) == 0)
                        {
                            if(options.httpProtocol == ''){
                                console.log('Error: method does not have a value. ');
                            }else{
                                if(options.httpProtocol != 'POST' && options.httpProtocol != 'GET'){
                                    console.log('Error: httpProtocol only accepts POST or GET value.');
                                }
                                if(options.httpProtocol == 'POST'){
                                    if (!('_token' in checkOptions) == 0){
                                        if(options._token == ''){
                                            console.log('Error: _token does not have a value. ');
                                        }
                                    }else{
                                        console.log('Error: Declaration of _token is required for POST serverSide request.');
                                    }
                                }
                            }
                        }else{
                            console.log('Error: Declaration of method not found.A prerequisite of serverSide processing. ');
                        }
                    }
                }

            }
            if(options.serverSide != '' || options.serverSide != 'undefined'){
                serverSide = options.serverSide;
            }

            if(options.httpProtocol != '' || options.httpProtocol != 'undefined'){
                tweak_httpProtocol = options.httpProtocol;
            }
            if(options.url != '' || options.url != 'undefined'){
                tweak_url = options.url;
            }
            if(options.token != '' || options.token != 'undefined'){
                tweak_token = options.token;
            }
            if (!('laraModel' in checkOptions) == 0)
            {
                if(options.laraModel != '' || options.laraModel != 'undefined'){
                    tweak_lara_model = options.laraModel;
                }
            }

            //callback Functions
            if(options.onSave != '' || options.onSave != 'undefined'){
                onSave = options.onSave;
            }


            return this.each(function() {

                if(options.debugging == true){
                    if(typeof $(this).attr('data-tweak_id') === 'undefined'){
                        console.log('Error: Declaration of tweak_id not found');
                    }else{
                        if($(this).attr('data-tweak_id').trim() == ''){
                            console.log('Error: tweak_id does not contain any value');
                        }
                        var letters = /^[A-Za-z]+$/;
                        if($(this).attr('data-tweak_id').match(letters))
                        {
                            console.log('Error: tweak_id accepts only integers');
                        }
                    }

                    if(typeof $(this).attr('data-tweak_field') === 'undefined'){
                        console.log('Error: Declaration of tweak_field not found');
                    }else{
                        if($(this).attr('data-tweak_field').trim() == ''){
                            console.log('Error: tweak_field does not contain any value');
                        }
                    }

                    if(typeof $(this).attr('data-tweak_input_type') === 'undefined'){
                        console.log('Error: Declaration of tweak_input_type not found');
                    }else{
                        if($(this).attr('data-tweak_input_type')){
                            console.log('Error: tweak_input_type does not contain any value');
                        }
                    }

                }


                var init_tweakable = $(this).html().trim();

                var empty_placeholder =   $(this).attr('data-tweak_empty');

                if(init_tweakable == ''){

                    if(empty_placeholder == ''){
                        empty_placeholder = 'Empty';
                    }

                    $(this).html(empty_placeholder).addClass('empty-tweakable');


                }

            });
        },

    });


});


$(document).on('click','.tweakable',function(){
    var tweakable = $(this);
    $(this).hide();
    var input_type = $(this).attr('data-input_type');
    var tweak_id = $(this).attr('data-tweak_id');
    var tweak_field = $(this).attr('data-tweak_field');
    var value = $(this).html();
    var placeholder = '';

    if($(this).attr('data-tweak_placeholder') != '' || $(this).attr('data-tweak_placeholder') != 'undefined'){
        placeholder = $(this).attr('data-tweak_placeholder');
    }

    if($(this).hasClass('empty-tweakable')){
        value = '';
    }

    if(input_type == 'text'){
        $(this).parent().append("<input type='"+input_type+"' data-tweak_field='"+ tweak_field +"' data-tweak_id='"+ tweak_id + "' value='"+ value +"' placeholder='"+ placeholder +"' class='tweakable-input'>");
    }


    $(".tweakable-input").blur(function(){
        var tweak_input = $(this);

        if(serverSide == true){
            $.ajax({
                url: tweak_url,
                type: tweak_httpProtocol,
                data:{
                    lara_model: tweak_lara_model,
                    data_id: tweak_id,
                    field_name: tweak_field,
                    value: tweak_input.val(),
                    _token: tweak_token,
                },
                success:function(response){
                    onSave(response);
                    if(input_type == 'text'){
                        tweakable.html(tweak_input.val());
                    }
                    if(tweak_input.val() != ''){
                        tweakable.removeClass('empty-tweakable');
                    }else{
                        tweakable.addClass('empty-tweakable');

                        if(tweakable.attr('data-tweak_empty') != '' || tweakable.attr('data-tweak_empty') != 'undefined'){
                            tweakable.html(tweakable.attr('data-tweak_empty'));
                        }else{
                            tweakable.html('Empty');
                        }

                    }
                    tweak_input.remove()
                    tweakable.show();

                },
                error:function(response){

                }
            });
        }


    });

    return false;
});
