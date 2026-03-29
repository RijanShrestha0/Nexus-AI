import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion.create ? motion.create(Link) : motion(Link);

export function Button({ children, variant = 'primary', size = 'md', className = '', to, href, ...props }) {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'lg' ? 'btn-lg' : '';
  const fullClassName = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();
  
  const hoverProps = variant === 'ghost' 
    ? { backgroundColor: "rgba(15, 23, 42, 0.05)" }
    : { scale: 1.05 };

  if (to) {
    return (
      <MotionLink 
        to={to}
        whileHover={hoverProps}
        whileTap={{ scale: 0.95 }}
        className={fullClassName}
        {...props}
      >
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a 
        href={href}
        whileHover={hoverProps}
        whileTap={{ scale: 0.95 }}
        className={fullClassName}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button 
      whileHover={hoverProps}
      whileTap={{ scale: 0.95 }}
      className={fullClassName}
      {...props}
    >
      {children}
    </motion.button>
  );
}
