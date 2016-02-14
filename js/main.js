/**
 * Created by ssmith on 12/29/15.
 */
var ws = new SockJS('http://' + window.location.hostname + ':15674/stomp');
var client = Stomp.over(ws);
var user = 'admin';
var pass = 'admin';
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
var on_message_weather = function (data) {
    obj = JSON.parse(data);
    updateTime = new Date(obj.timestamp);
    $('#temperature').text(obj.temperature + "°");
    $('#location').text(obj.location);
    $('#updatedAt').text('Last updated at ' + moment(updateTime).format('LT'));
    $('#icon').attr("src", obj.icon);
}

/**
 * When a message is sent to this it means that an updated version of the
 * application has been downloaded, refresh the page
 */
var on_message_update = function () {
    window.location.reload();
}

/**
 * When a message is sent to this it means that the page should have it's
 * brightness adjusted.  I am doing the if statements to prevent random garbage
 * from being sent and set as the class (for example up)
 */
var on_message_display = function (data) {
    var body = $('body');
    if (data === 'bright') {
        body.removeClass().addClass('bright');

    }
    else if (data === 'dim') {
        body.removeClass().addClass('dim')
    }
    else if (data === 'off') {
        body.removeClass().addClass('off')
    }
}

/**
 * A message......message has been sent, display it
 * @param data
 */
var on_message_msg = function (data) {
    var content = $('#message');
    content.text(data);
    //We can store data so let's store it
    if(typeof(Storage) !== 'undefined') {
        localStorage.setItem('message', data);
    }
}

/**
 * A weather message has been sent, parse and display it
 * @param data
 */
var on_message_irc = function (data) {
    var content = $('#irc');
    var obj = JSON.parse(data);
    var updateTime = new Date(obj.timestamp);
    var display = '[' + moment(updateTime).format('LT') +'] ' + obj.username + ': ' + obj.message;
    var messageCount = $('#irc p').length;
    if (messageCount == 5) {
        var childToRemove = $('#irc p:first');
        childToRemove.remove();
    }
    var newMessage = $('<p></p>').text(display);
    newMessage.appendTo(content);
}

/**
 * Generate the html based on the JSON input, would be better to use a template
 * engine but meh
 * @param data
 */
var on_message_stock = function (data) {
    var obj = JSON.parse(data);
    var stockArray = obj.stockData;
    console.log(stockArray);
    var stockContainer = $('#stocks');
    stockContainer.empty();
    for (var i = 0; i < stockArray.length; i++) {
        var stock = stockArray[i];
        var stockClass = stock.change > 0.00 ? 'up' : 'down';
        var stockDiv = $('<div></div>');
        var nameP = $('<p></p>').text(stock.name + ' - ' + stock.symbol + ' - $' + stock.price.toFixed(2));
        var priceP = $('<p></p>').text('$' + stock.change.toFixed(2));
        if(stockClass == 'down') {
            priceP = $('<p></p>').text('-$' + Math.abs(stock.change));
        }
        var percentP = $('<p></p>').text(stock.changePercent.toFixed(2) + '%');
        priceP.attr("class", stockClass);
        percentP.attr("class", stockClass);

        nameP.appendTo(stockDiv);
        priceP.appendTo(stockDiv);
        percentP.appendTo(stockDiv);
        stockDiv.appendTo(stockContainer);
    }

}

/**
 * Connect to RabbitMQ to get weather updates
 * @param x
 */
var on_connect = function (x) {
    client.subscribe("/topic/weather", function (d) {
        on_message_weather(d.body);
    });
    client.subscribe("/topic/message", function (d) {
        on_message_msg(d.body);
    });
    client.subscribe("/topic/upgrade", function (_) {
        on_message_update();
    });
    client.subscribe("/topic/irc", function (d) {
        on_message_irc(d.body);
    });
    client.subscribe("/topic/stock", function (d) {
        on_message_stock(d.body);
    });
    client.subscribe("/topic/displayControls", function (d) {
        on_message_display(d.body);
    });
};

var on_error = function () {
    console.log('error');
};

/**
 * Requests updates from services, only used when the page first loads
 */
function request_updates() {
    client.send("/topic/update");
}

function display_c() {
    setTimeout('display_ct()', time_refresh);
}

function display_ct() {
    time = moment(new Date()).format('llll');
    $('#time').text(time);

    display_c();
}

$(window).load(function () {
    client.connect(user, pass, on_connect, on_error, vhost);
    display_ct();
    if(typeof(Storage) !== 'undefined') {
        //check if we have a message and display it if we do.
        if(localStorage.message) {
            var content = $('#message');
            content.text(localStorage.getItem('message'));
        }
    }
    //setTimeout is a hack to make sure that the connection is established
    setTimeout('request_updates()', 3000);
});
