import { useYoutubeSession } from '../context/YoutubeSessionContext';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  videoId?: string;
}

export function InAppYoutubeLoginButton({
  className = 'btn btn-google',
  size = 'sm',
  label = '软件内登录 YouTube',
  videoId,
}: Props) {
  const { loginInApp } = useYoutubeSession();
  const sizeClass = size === 'lg' ? 'btn-lg' : size === 'md' ? '' : 'btn-sm';

  return (
    <button
      type="button"
      className={`${className} ${sizeClass}`.trim()}
      onClick={() => loginInApp(videoId)}
      title="在当前软件窗口登录 YouTube，登录后自动回到课程"
    >
      {label}
    </button>
  );
}
