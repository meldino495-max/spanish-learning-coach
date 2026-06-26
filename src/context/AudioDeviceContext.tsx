import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  type ReactNode,

} from 'react';

import {

  bindOutputDevice,

  enumerateAudioDevices,

  openSystemSoundSettings,

  playOutputTestTone,

  promptSelectAudioOutput,

  supportsSelectAudioOutput,

  supportsSetSinkId,

  type AudioDeviceOption,

} from '../utils/audioDevices';

import {

  DEFAULT_DEVICE,

  getStoredInputDeviceId,

  getStoredOutputDeviceId,

  setStoredInputDeviceId,

  setStoredOutputDeviceId,

} from '../utils/audioDeviceStore';



interface AudioDeviceContextValue {

  inputDeviceId: string;

  outputDeviceId: string;

  inputDevices: AudioDeviceOption[];

  outputDevices: AudioDeviceOption[];

  setInputDeviceId: (id: string) => void;

  setOutputDeviceId: (id: string) => void;

  refreshDevices: () => Promise<void>;

  pickOutputDevice: () => Promise<void>;

  testOutput: () => Promise<void>;

  openSoundSettings: () => void;

  supportsSinkId: boolean;

  supportsNativeOutputPicker: boolean;

  isElectron: boolean;

}



const AudioDeviceContext = createContext<AudioDeviceContextValue | null>(null);



export function AudioDeviceProvider({ children }: { children: ReactNode }) {

  const [inputDeviceId, setInputState] = useState(getStoredInputDeviceId);

  const [outputDeviceId, setOutputState] = useState(getStoredOutputDeviceId);

  const [devices, setDevices] = useState<AudioDeviceOption[]>([]);

  const isElectron = Boolean(window.electronAPI?.isElectron);



  const refreshDevices = useCallback(async () => {

    const list = await enumerateAudioDevices();

    setDevices(list);

  }, []);



  useEffect(() => {

    void refreshDevices();

    void bindOutputDevice(outputDeviceId);

    navigator.mediaDevices?.addEventListener('devicechange', refreshDevices);

    return () => navigator.mediaDevices?.removeEventListener('devicechange', refreshDevices);

  }, [refreshDevices, outputDeviceId]);



  const setInputDeviceId = useCallback((id: string) => {

    const v = id || DEFAULT_DEVICE;

    setStoredInputDeviceId(v);

    setInputState(v);

  }, []);



  const setOutputDeviceId = useCallback((id: string) => {

    const v = id || DEFAULT_DEVICE;

    setStoredOutputDeviceId(v);

    setOutputState(v);

    void bindOutputDevice(v);

  }, []);



  const pickOutputDevice = useCallback(async () => {

    const id = await promptSelectAudioOutput();

    if (id) setOutputDeviceId(id);

    await refreshDevices();

  }, [refreshDevices, setOutputDeviceId]);



  const testOutput = useCallback(async () => {

    await playOutputTestTone(outputDeviceId);

  }, [outputDeviceId]);



  const openSoundSettings = useCallback(() => {

    openSystemSoundSettings();

  }, []);



  const value = useMemo<AudioDeviceContextValue>(

    () => ({

      inputDeviceId,

      outputDeviceId,

      inputDevices: devices.filter((d) => d.kind === 'audioinput'),

      outputDevices: devices.filter((d) => d.kind === 'audiooutput'),

      setInputDeviceId,

      setOutputDeviceId,

      refreshDevices,

      pickOutputDevice,

      testOutput,

      openSoundSettings,

      supportsSinkId: supportsSetSinkId(),

      supportsNativeOutputPicker: supportsSelectAudioOutput(),

      isElectron,

    }),

    [

      devices,

      inputDeviceId,

      outputDeviceId,

      pickOutputDevice,

      refreshDevices,

      setInputDeviceId,

      setOutputDeviceId,

      testOutput,

      openSoundSettings,

      isElectron,

    ],

  );



  return <AudioDeviceContext.Provider value={value}>{children}</AudioDeviceContext.Provider>;

}



export function useAudioDevices() {

  const ctx = useContext(AudioDeviceContext);

  if (!ctx) throw new Error('useAudioDevices must be used within AudioDeviceProvider');

  return ctx;

}

