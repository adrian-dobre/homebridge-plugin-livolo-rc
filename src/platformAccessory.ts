import type { PlatformAccessory, Service } from 'homebridge';

import type { LivoloRCHomebridgePlatform } from './platform.js';
import axios from 'axios';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class LivoloRCPlatformAccessory {
  private service: Service;

  constructor(
    private readonly platform: LivoloRCHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly name: string, private readonly remoteId: number, private readonly keyCode: number,
  ) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Madtek.ro')
      .setCharacteristic(this.platform.Characteristic.Model, 'Livolo RF Light')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '0001');
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.getCharacteristic(this.platform.Characteristic.Name).onGet(() => this.name);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(() => false)
      .onSet(() => {
        this.sendLivoloCommand(this.remoteId, this.keyCode);
        setTimeout(() => {
          this.service.updateCharacteristic(this.platform.Characteristic.On, false);
        }, 2000);
        return false;
      });
  }

  private sendLivoloCommand(remoteId: number, keyCode: number) {
    axios.post(`${this.platform.config.controllerUrl}/controller/livolo/send`, {
      remoteId,
      keyCode,
    }, {
      headers: {
        'Authorization': `Bearer ${this.platform.config.controllerAccessKey}`,
      },
    }).catch((reason) => this.platform.log.error(reason.message));
  }
}
