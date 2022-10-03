import {
  GetGithubRepoQuery,
  GetGithubOrganizationsQuery,
} from 'app/graphql/types';

export type GithubRepoToImport = NonNullable<GetGithubRepoQuery['githubRepo']>;

// This is very hacky, ideally we should use fragments but for
// some reason the generated types do not recognized them.
type _MeFromOrganizationsQuery = NonNullable<GetGithubOrganizationsQuery['me']>;
export type GithubOrganizations = Array<
  | _MeFromOrganizationsQuery['githubProfile']
  | _MeFromOrganizationsQuery['githubOrganizations'][number]
>;
