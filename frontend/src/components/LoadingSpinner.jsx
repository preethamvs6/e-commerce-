import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative h-12 w-12">
        <div className="absolute h-full w-full rounded-full border-4 border-gray-250 border-t-primary-505 animate-spin dark:border-gray-800 dark:border-t-primary-400"></div>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">Loading items...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 bg-opacity-70 backdrop-blur-sm dark:bg-gray-950 dark:bg-opacity-70">
        {spinner}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
