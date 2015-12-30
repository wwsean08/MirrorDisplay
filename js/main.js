/**
 * Created by ssmith on 12/29/15.
 */
var ws = new SockJS('http://' + window.location.hostname + ':15674/stomp');
var client = Stomp.over(ws);

// SockJS does not support heart-beat: disable heart-beats
client.heartbeat.outgoing = 0;
client.heartbeat.incoming = 0;

var on_message = function(data) {
    var content = $('#content');
    content.text(data);
}
var on_connect = function(x) {
    id = client.subscribe("/topic/hello", function(d) {
        on_message(d.body);
    });
};
var on_error =  function() {
    console.log('error');
};
client.connect('guest', 'guest', on_connect, on_error, '/')