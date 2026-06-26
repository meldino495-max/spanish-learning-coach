import { useEffect, useRef, useState } from 'react';

import { useAudioDevices } from '../context/AudioDeviceContext';

import { DEFAULT_DEVICE } from '../utils/audioDeviceStore';



export function AudioDevicePicker() {

  const {

    inputDeviceId,

    outputDeviceId,

    inputDevices,

    outputDevices,

    setInputDeviceId,

    setOutputDeviceId,

    refreshDevices,

    pickOutputDevice,

    testOutput,

    openSoundSettings,

    supportsSinkId,

    supportsNativeOutputPicker,

    isElectron,

  } = useAudioDevices();

  const [open, setOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    if (!open) return;

    void refreshDevices();

    const onDoc = (e: MouseEvent) => {

      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);

    };

    const onKey = (e: KeyboardEvent) => {

      if (e.key === 'Escape') setOpen(false);

    };

    document.addEventListener('mousedown', onDoc);

    document.addEventListener('keydown', onKey);

    return () => {

      document.removeEventListener('mousedown', onDoc);

      document.removeEventListener('keydown', onKey);

    };

  }, [open, refreshDevices]);



  const inputLabel =

    inputDevices.find((d) => d.deviceId === inputDeviceId)?.label ?? '系统默认麦克风';

  const outputLabel =

    outputDevices.find((d) => d.deviceId === outputDeviceId)?.label ?? '系统默认扬声器';



  return (

    <div className="audio-device-picker" ref={wrapRef}>

      <button

        type="button"

        className="audio-device-trigger"

        onClick={() => setOpen((v) => !v)}

        title="音频输入 / 输出设备"

        aria-expanded={open}

      >

        <span aria-hidden="true">🎧</span>

        <span className="audio-device-trigger-label">音频</span>

      </button>



      {open && (

        <div className="audio-device-panel" role="dialog" aria-label="音频设备设置">

          <p className="audio-device-panel-title">音频设备</p>



          <label className="audio-device-field">

            <span>🎤 输入（麦克风）</span>

            <select

              value={inputDeviceId}

              onChange={(e) => setInputDeviceId(e.target.value)}

            >

              <option value={DEFAULT_DEVICE}>系统默认</option>

              {inputDevices.map((d) => (

                <option key={d.deviceId} value={d.deviceId}>

                  {d.label}

                </option>

              ))}

            </select>

          </label>

          <p className="audio-device-hint">

            口语识别跟随 Windows 默认录音设备。若识别用错麦克风，请点下方打开系统声音设置。

          </p>



          <label className="audio-device-field">

            <span>🔊 输出（扬声器 / 耳机）</span>

            <select

              value={outputDeviceId}

              onChange={(e) => setOutputDeviceId(e.target.value)}

            >

              <option value={DEFAULT_DEVICE}>系统默认</option>

              {outputDevices.map((d) => (

                <option key={d.deviceId} value={d.deviceId}>

                  {d.label}

                </option>

              ))}

            </select>

          </label>



          <div className="audio-device-actions">

            {supportsNativeOutputPicker && (

              <button type="button" className="btn btn-secondary btn-sm" onClick={() => void pickOutputDevice()}>

                系统选择扬声器…

              </button>

            )}

            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void testOutput()}>

              测试输出

            </button>

            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void refreshDevices()}>

              刷新列表

            </button>

            <button type="button" className="btn btn-secondary btn-sm" onClick={openSoundSettings}>

              打开系统声音设置

            </button>

          </div>



          <p className="audio-device-meta">

            当前：{inputLabel} → {outputLabel}

          </p>

          {isElectron && supportsSinkId && outputDeviceId !== DEFAULT_DEVICE && (

            <p className="audio-device-hint">朗读（🔊）将尝试输出到所选扬声器。</p>

          )}

          {!supportsSinkId && (

            <p className="audio-device-warn">

              当前环境不支持切换朗读输出设备，请用系统声音设置或「系统选择扬声器」。

            </p>

          )}

        </div>

      )}

    </div>

  );

}

