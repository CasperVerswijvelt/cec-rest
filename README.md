# CEC REST

A simple REST api to control CEC devices via a pi (or another device connected to your tv with HDMI)!

## Home Assistant

Easy integrate your CEC device in Home Assistant by using this Restful Switch configuration

```
switch:
  - platform: rest
    name: TV CEC
    resource: http://192.168.69.10:3000/dev0
    state_resource: http://192.168.69.10:3000/dev0/powerStatus
    is_on_template: '{{ value == "on" }}'
    body_on: '{"action":"turnOn"}'
    body_off: '{"action":"turnOff"}'
    headers:
      Content-Type: application/json
    scan_interval: 5
```

## API

### GET `/`

Returns info about connected CEC devices and which functions you can run

Example response:
```
{
   "dev0":{
      "name":"TV",
      "logicalAddress":"0",
      "address":"0.0.0.0",
      "activeSource":"no",
      "vendor":"Unknown",
      "osdString":"TV",
      "cecVersion":"1.4",
      "powerStatus":"on",
      "language":"eng",
      "turnOn":"[function]",
      "turnOff":"[function]",
      "togglePower":"[function]",
      "changeSource":"[function]",
      "sendKey":"[function]"
   },
   "dev4":{
      "name":"Playback 1",
      "logicalAddress":"4",
      "address":"2.0.0.0",
      "activeSource":"no",
      "vendor":"Pulse Eight",
      "osdString":"CEC-Control",
      "cecVersion":"1.4",
      "powerStatus":"on",
      "language":"eng",
      "turnOn":"[function]",
      "turnOff":"[function]",
      "togglePower":"[function]"
   },
   "setActive":"[function]",
   "setInactive":"[function]",
   "volumeUp":"[function]",
   "volumeDown":"[function]",
   "mute":"[function]",
   "getKeyNames":"[function]",
   "command":"[function]"
}
```

### GET `/<device>`

Example path: `/dev0`
Example response:
```
{
   "name":"TV",
   "logicalAddress":"0",
   "address":"0.0.0.0",
   "activeSource":"no",
   "vendor":"Unknown",
   "osdString":"TV",
   "cecVersion":"1.4",
   "powerStatus":"on",
   "language":"eng",
   "turnOn":"[function]",
   "turnOff":"[function]",
   "togglePower":"[function]",
   "changeSource":"[function]",
   "sendKey":"[function]"
}
```

### GET `/<device>/<property>`

Example path: `/dev0/powerStatus`
Example response:

`on`

### POST `/<device>`

Example path `/dev0`
Example body:

```
{
    "action": "powerOff"
}
```
