interface SplashScreenProps {
  onEnter: () => void;
  isLoading: boolean;
}

export function SplashScreen({
  onEnter,
  isLoading,
}: SplashScreenProps): JSX.Element {
  return (
    <div className='fixed inset-0 bg-black z-50 flex flex-col items-center justify-center'>
      <button
        onClick={onEnter}
        disabled={isLoading}
        className='px-8 py-4 text-lg text-white border-2 border-white/20 rounded-lg 
                 hover:bg-white/10 transition-all duration-300 
                 disabled:opacity-50 disabled:cursor-not-allowed
                 relative overflow-hidden group'
      >
        <span className='relative z-10'>
          {isLoading ? 'Loading...' : 'Click to Enter'}
        </span>
        <div
          className='absolute inset-0 bg-white/10 translate-y-full 
                      transition-transform duration-300 
                      group-hover:translate-y-0'
        />
      </button>
    </div>
  );
}
