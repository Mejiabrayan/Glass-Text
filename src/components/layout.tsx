export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='@container min-h-screen max-w-screen flex justify-center items-center space-y-10 px-10  bg-linear-45 from-indigo-500 via-purple-500 to-pink-500'>
      <div className="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}
