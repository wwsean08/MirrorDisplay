/**
 * Created by ssmith on 12/29/15.
 */
var ws = new SockJS('http://' + window.location.hostname + ':15674/stomp');
var client = Stomp.over(ws);
var user = 'guest';
var pass = 'guest';
var vhost = '/';
var time_refresh = 1000;

// SockJS does not support heart-beat: disable heart-beats
client.heartbeat.outgoing = 0;
client.heartbeat.incoming = 0;

/**
 * A weather message has been sent, parse and display it
 * TODO: Determine data structure and parse it to make it pretty
 * @param data
 */
var on_message_weather = function(data) {
    var content = $('#weather');
    content.text(data);
}

/**
 * When a message is sent to this it means that an updated version of the
 * application has been downloaded, refresh the page
 */
var on_message_update = function() {
    window.location.reload();
}

/**
 * A message......message has been sent, display it
 * @param data
 */
var on_message_msg = function(data) {
    var content = $('#message');
    content.text(data);
}

/**
 * A weather message has been sent, parse and display it
 * TODO: Determine data structure and parse it to make it pretty
 * @param data
 */
var on_message_stock = function(data) {
    var content = $('#weather');
    content.text(data);
}


/**
 * Connect to RabbitMQ to get weather updates
 * @param x
 */
var on_connect = function(x) {
    client.subscribe("/topic/weather", function (d) {
        on_message_weather(d.body);
    });
    client.subscribe("/topic/message", function (d) {
        on_message_msg(d.body);
    });
    client.subscribe("/topic/upgrade", function (_) {
        on_message_update();
    });
    client.subscribe("/topic/stock", function (d) {
        on_message_stock(d.body);
    });
};

var on_error =  function() {
    console.log('error');
};

client.connect(user, pass, on_connect, on_error, vhost);

/**
 * Requests updates from services, only used when the page first loads
 */
function request_updates() {
    client.send("/topic/weather_update");
    client.send("/topic/stock_update");
}

function display_c(){
    setTimeout('display_ct()',time_refresh);
}

function display_ct() {
    time = moment(new Date()).format('llll');
    $('#time').text(time);

    display_c();
}

window.onload = function() {
    display_ct();
    request_updates();
};