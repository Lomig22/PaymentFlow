declare module '@headlessui/react' {
  export const Menu: {
    Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
    Items: React.FC<React.HTMLAttributes<HTMLDivElement>>;
    Item: React.FC<{
      children: (props: { active: boolean }) => React.ReactNode;
    }>;
  } & React.FC<{ as?: React.ElementType }>;
}
