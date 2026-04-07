import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'btn-base btn-primary',
      secondary: 'btn-base btn-dark',
      outline: 'btn-base btn-outline',
      ghost: 'btn-base btn-ghost',
      danger: 'btn-base btn-dark',
    };

    const sizes = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
      icon: 'btn-icon',
    };

    return (
      <button
        ref={ref}
        className={cn(
          variants[variant],
          sizes[size],
          'justify-center',
          variant === 'danger' && 'bg-[var(--color-dark-900)] text-[var(--color-text-inverse)]',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
