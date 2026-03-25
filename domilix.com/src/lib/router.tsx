'use client';

import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';
import React, { useEffect } from 'react';

type ClassNameInput =
  | string
  | ((props: { isActive: boolean }) => string | undefined)
  | undefined;

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  state?: unknown;
  className?: ClassNameInput;
  children: React.ReactNode;
};

export function Link({
  to,
  replace,
  className,
  children,
  ...props
}: LinkProps): React.ReactElement {
  const resolvedClassName = typeof className === 'function' ? className({ isActive: false }) : className;

  return (
    <NextLink href={to} replace={replace} className={resolvedClassName} {...props}>
      {children}
    </NextLink>
  );
}

export function NavLink({
  to,
  replace,
  className,
  children,
  ...props
}: LinkProps): React.ReactElement {
  const pathname = usePathname();
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <NextLink href={to} replace={replace} className={resolvedClassName} {...props}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useRouter();

  return (to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  };
}

export function useSearchParams() {
  const searchParams = useNextSearchParams();
  return [searchParams] as const;
}

export function useParams<T extends Record<string, string | string[] | undefined>>() {
  return useNextParams<T>();
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  const search = searchParams.toString();

  return {
    pathname,
    search: search ? `?${search}` : '',
    hash: '',
  };
}

export function Navigate({
  to,
  replace,
}: {
  to: string;
  replace?: boolean;
  state?: unknown;
}): null {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(to);
      return;
    }
    router.push(to);
  }, [replace, router, to]);

  return null;
}

export function Outlet({ children }: { children?: React.ReactNode }): React.ReactElement | null {
  return children ? <>{children}</> : null;
}
