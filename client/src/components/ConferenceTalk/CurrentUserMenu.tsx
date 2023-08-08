import CoreCurrentUserMenu, { LoadingState } from '../CurrentUserMenu';
import cx from 'classnames';
import LoadingStateHighlighter, {
  withHighlight,
} from '../LoadingStateHighlighter';
import { gql, useSuspenseQuery, useQuery } from '@apollo/client';
import {
  CurrentUserMenuQuery,
  CurrentUserMenuQueryVariables,
} from '../../types/api';
import { fragmentRegistry } from '../../apollo/fragmentRegistry';
import { CURRENT_USER_MENU_QUERY } from './queries';

fragmentRegistry.register(gql`
  fragment CurrentUserMenuFields on CurrentUserProfile {
    displayName
    ...Avatar_profile
  }
`);

export const CurrentUserMenu = () => {
  const { data, loading } = useQuery<
    CurrentUserMenuQuery,
    CurrentUserMenuQueryVariables
  >(CURRENT_USER_MENU_QUERY);

  if (loading) {
    return (
      <LoadingStateHighlighter>
        <CurrentUserMenu.LoadingState />
      </LoadingStateHighlighter>
    );
  }

  const me = data?.me;

  if (!me) {
    throw new Error('You must be logged in');
  }

  return (
    <header className="flex items-center justify-end text-primary bg-transparent pt-[var(--main-content--padding)] px-[var(--main-content--padding)] absolute top-0 w-full pointer-events-none flex-shrink-0 z-10">
      <div className="flex gap-4 items-center pointer-events-auto">
        <CoreCurrentUserMenu profile={me.profile} />
      </div>
    </header>
  );
};

CurrentUserMenu.LoadingState = withHighlight(
  ({ isActiveSuspenseBoundary }) => {
    return (
      <header
        className={cx(
          'flex items-center text-primary bg-transparent pointer-events-none flex-shrink-0 z-10',
          {
            ['absolute top-[var(--main-content--padding)] right-[var(--main-content--padding)]']:
              !isActiveSuspenseBoundary,
          }
        )}
      >
        <LoadingState />
      </header>
    );
  },
  {
    className:
      '!absolute top-[var(--main-content--padding)] right-[var(--main-content--padding)] z-10',
    shade: '#00F900',
  }
);
