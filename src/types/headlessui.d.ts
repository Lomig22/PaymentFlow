declare module '@headlessui/react' {
  import * as React from 'react';
  export const Dialog: React.FC<any> & {
    Title: React.FC<any>;
    Description: React.FC<any>;
    Panel: React.FC<any>;
    Overlay: React.FC<any>;
  };
  export const Transition: React.FC<any> & {
    Child: React.FC<any>;
    Root: React.FC<any>;
  };

  export const Disclosure: React.FC<any> & {
    Button: React.FC<any>;
    Panel: React.FC<any>;
  };
  export const Menu: {
    Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    Items: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    Item: React.FC<{
      children: (props: { active: boolean }) => React.ReactNode;
    }>;
  } & React.FC<{ as?: React.ElementType }>;
}
