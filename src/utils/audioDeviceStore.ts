import { getAppSetting, setAppSetting } from './appSettings';



export const DEFAULT_DEVICE = 'default';



export function getStoredInputDeviceId(): string {

  return getAppSetting('audioInput') || DEFAULT_DEVICE;

}



export function getStoredOutputDeviceId(): string {

  return getAppSetting('audioOutput') || DEFAULT_DEVICE;

}



export function setStoredInputDeviceId(id: string) {

  setAppSetting('audioInput', id || DEFAULT_DEVICE);

}



export function setStoredOutputDeviceId(id: string) {

  setAppSetting('audioOutput', id || DEFAULT_DEVICE);

}

