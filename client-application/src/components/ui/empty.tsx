import { type FC } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface EmptyProps {
  description?: string;
  image?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const Empty: FC<EmptyProps> = ({
  description = "No data",
  image,
  className,
  children,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}
  >
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground ring-2 ring-border/50">
      {image ?? <Icon icon="mdi:inbox-outline" className="size-10" aria-hidden />}
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
    {children && <div className="mt-4">{children}</div>}
  </div>
);
