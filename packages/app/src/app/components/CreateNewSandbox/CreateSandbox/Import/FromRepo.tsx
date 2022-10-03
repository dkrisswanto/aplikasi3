import { useAppState } from 'app/overmind';
import styled, { keyframes } from 'styled-components';
import css from '@styled-system/css';
import React, { useState } from 'react';
import {
  Button,
  Element,
  Icon,
  Input,
  Label,
  SkeletonText,
  Stack,
  Text,
} from '@codesandbox/components';
import { CloudBetaBadge } from 'app/components/CloudBetaBadge';
import { GithubRepoToImport } from './types';
import { StyledSelect } from '../elements';
import { useGithubOrganizations } from './useGithubOrganizations';
import { getGihubOrgMatchingCsbTeam } from './utils';
import { useValidateName } from './useValidateName';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const SpinnerWrapper = styled.span`
  display: inline-block;
  animation: ${rotate} 2s linear infinite;
`;

type FromRepoProps = {
  onCancel: () => void;
  repo: GithubRepoToImport;
};
export const FromRepo: React.FC<FromRepoProps> = ({ repo, onCancel }) => {
  const { activeTeamInfo } = useAppState();
  const githubOrganizations = useGithubOrganizations();

  const [repoName, setRepoName] = useState<string>(repo.name);
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const activeTeamRef = React.useRef(activeTeamInfo);
  const organizationStatesRef = React.useRef(githubOrganizations.state);

  const repoNameValidation = useValidateName(selectedTeam, repoName);
  console.warn(
    'repoNameValidation',
    repoNameValidation,
    selectedTeam,
    repoName
  );

  React.useEffect(() => {
    if (githubOrganizations.state === 'ready') {
      if (
        organizationStatesRef.current === 'loading' ||
        activeTeamInfo.id !== activeTeamRef.current?.id
      ) {
        setSelectedTeam(
          getGihubOrgMatchingCsbTeam(
            activeTeamInfo.name,
            githubOrganizations.data
          ).login
        );
      }
    }

    organizationStatesRef.current = githubOrganizations.state;
  }, [activeTeamInfo, githubOrganizations]);

  return (
    <Stack
      direction="vertical"
      gap={7}
      css={{ width: '100%', height: '100%', paddingBottom: '24px' }}
    >
      <Stack css={{ justifyContent: 'space-between' }}>
        <Text
          as="h2"
          css={{
            fontSize: '16px',
            fontWeight: 500,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Create new fork
        </Text>
        <CloudBetaBadge />
      </Stack>

      <Element
        as="form"
        css={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'space-between',
        }}
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <Stack direction="vertical" gap={6}>
          <Element
            css={{
              position: 'relative',
              flex: 1,
            }}
          >
            <Input
              aria-invalid={repoNameValidation.state === 'invalid'}
              css={{
                fontFamily: 'inherit',
                height: '48px',
                padding: '8px 16px',
                backgroundColor: '#2a2a2a',
                color: '#e5e5e5',
                border: '1px solid',
                borderColor:
                  repoNameValidation.state === 'invalid'
                    ? '#ED6C6C'
                    : '#2a2a2a',
                borderRadius: '2px',
                fontSize: '13px',
                lineHeight: '16px',
                fontWeight: 500,
              }}
              id="repo-name"
              type="text"
              aria-label="Repository name"
              placeholder="Repository name"
              value={repoName}
              onChange={e => setRepoName(e.target.value)}
              autoFocus
              required
            />
            {repoNameValidation.state !== 'idle' ? (
              <Element
                css={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color:
                    {
                      valid: '#2ecc71',
                      invalid: '#ED6C6C',
                    }[repoNameValidation.state] ?? '#e5e5e5',
                }}
              >
                {repoNameValidation.state === 'valid' ? (
                  <Icon name="simpleCheck" />
                ) : null}
                {repoNameValidation.state === 'invalid' ? (
                  <Icon name="warning" />
                ) : null}
                {repoNameValidation.state === 'validating' ? (
                  <SpinnerWrapper>
                    <Icon name="spinner" />
                  </SpinnerWrapper>
                ) : null}
              </Element>
            ) : null}
            {repoNameValidation.state === 'invalid' ? (
              <Text
                as="small"
                css={css({
                  display: 'block',
                  marginTop: 2,
                  color: 'errorForeground',
                  fontSize: 12,
                })}
              >
                {repoNameValidation.error}
              </Text>
            ) : null}
          </Element>

          <Label css={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Text as="span" size={2} css={{ color: '#808080' }}>
              GitHub organization
            </Text>
            {githubOrganizations.state === 'loading' ? (
              <SkeletonText />
            ) : (
              <StyledSelect
                css={{
                  color: '#e5e5e5',
                }}
                icon={() => <Icon css={{ marginLeft: 8 }} name="github" />}
                onChange={e => {
                  setSelectedTeam(e.target.value);
                }}
                value={selectedTeam}
                disabled={githubOrganizations.state !== 'ready'}
              >
                {githubOrganizations.state === 'ready' &&
                  githubOrganizations.data.map(org => (
                    <option key={org.id} value={org.login}>
                      {org.login}
                    </option>
                  ))}
              </StyledSelect>
            )}
          </Label>
        </Stack>

        <Stack css={{ justifyContent: 'flex-end' }}>
          <Stack gap={2}>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              css={{ width: 'auto' }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" css={{ width: 'auto' }}>
              Create repository
            </Button>
          </Stack>
        </Stack>
      </Element>
    </Stack>
  );
};
