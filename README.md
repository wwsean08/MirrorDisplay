# Mirror Display

##About
The Mirror Display is all about giving you what you want on your mirror when you want it.  The idea is based off of the MirrorMirror project by ctrlaltdylan, however I wanted my mirror to work from a push model to allow more integration for home automation.

Alone this project doesn't really display anything, the supplementary applications are where it gets all it's power.

##Installation
The following installation instructions assume you have Raspbian Jessie installed on your SD card and configured.  If you are using another distro then your steps may vary.

###Core Instructions
1. Install and Configure RabbitMQ
   * `sudo apt-get install rabbitmq-server`
   * Enable the webstomp plugin with the following commands:
    ```bash
    sudo rabbitmq-plugins enable rabbitmq_web_stomp
    sudo rabbitmq-plugins enable rabbitmq_management
    sudo /etc/init.d/rabbitmq-server restart
    ```
   * Add an admin user through the web console as the default guest user only can be accessed via localhost, this can make debugging from a machine other than the raspberry pi very difficult.  The admin console is located at <IP>:15672 and the default credentials are guest/guest.
2. Install apache2 HTTP server (you could use nginx, I'm just more familiar with apache)
   * `sudo apt-get install apache2`
3. Install Chromium, I used this guide to set it up, https://www.raspberrypi.org/forums/viewtopic.php?t=121195
4. Clone this git repository into */var/www/html* which will create a MirrorDisplay directory in there.
5. You should now be able to load to at http://localhost/MirrorDisplay if you are directly on the pi or http://<ip>/MirrorDisplay and see the time and the message at the bottom of the screen
6. Setup the companion apps (their directions coming soon)

###Optional Steps:
Rotate The Display

1. Open */boot/config.txt* to edit it with your favorite editor.
2. Add the line `display_rotate=1` to rotate it 90 degrees or `display_rotate=3` for 270 depending on which direction you turn your screen.
3. Reboot for this to take affect.

##Plans
* Come up with better images for weather
* Make it easier to setup/configure all the services automagically (possibly through Puppet or Ansible)
* (Indirect Plan but no repo for this one yet) work on a RabbitMQ plugin for Tasker to make automation from your cell phone more simple, for example you could make it so when your cell phone connects to your wifi it automatically sends an update request to get teh most up to date stock and weather information.