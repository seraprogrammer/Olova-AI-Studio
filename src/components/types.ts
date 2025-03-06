export interface Chat {
  id: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
  createdAt: string;
  model?: string;
}

export interface ThinkingBlockProps {
  content: string;
}

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}
