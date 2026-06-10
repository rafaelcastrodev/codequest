interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 border-4",
  md: "w-10 h-10 border-4",
  lg: "w-12 h-12 border-4",
};

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div
          className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin mx-auto`}
        />
        {message && (
          <p className="text-text-muted font-body">{message}</p>
        )}
      </div>
    </div>
  );
}
